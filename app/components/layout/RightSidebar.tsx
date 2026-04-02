'use client'

import { Upload, Loader2, MousePointer2, Box, RotateCw, Trash2, Tag } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect, useMemo } from 'react'
import { JobQueuePanel } from '@/components/layout/JobQueuePanel'

export function RightSidebar() {
    const activeTool = useFloorplanStore(s => s.activeTool)
    const mode = useFloorplanStore(s => s.mode)
    const token = useFloorplanStore(s => s.token)
    const selectedId = useFloorplanStore(s => s.selectedId)
    const furniture = useFloorplanStore(s => s.furniture)
    const updateFurniture = useFloorplanStore(s => s.updateFurniture)
    const deleteObject = useFloorplanStore(s => s.deleteObject)
    const testGLB = useFloorplanStore(s => s.testGLB)
    const toggleTestGLB = useFloorplanStore(s => s.toggleTestGLB)
    const setMode = useFloorplanStore(s => s.setMode)


    // --- AI / SAM3D State ---
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [jobId, setJobId] = useState<string | null>(null)
    const [isProcessingAI, setIsProcessingAI] = useState(false)
    const [statusMsg, setStatusMsg] = useState('')
    const [masks, setMasks] = useState<any[]>([])

    const selectedFurn = useMemo(
        () => furniture.find(f => f.id === selectedId),
        [furniture, selectedId]
    )

    const [sizeDraft, setSizeDraft] = useState({ width: '', height: '', depth: '' })
    const [labelDraft, setLabelDraft] = useState('')

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const overlayRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Show sidebar if:
    // 1. "Furniture" tool (now AI Reconstruction) is active
    // 2. Mode is "3d" (3D Options/Results)
    // 3. An item is selected (for size/label edits)
    const isVisible = true // activeTool === 'furniture' || mode === '3d' || !!selectedFurn

    console.log('RightSidebar visibility:', { isVisible, activeTool, mode, selectedFurn, testGLB })

    const mToCm = (v: number) => v * 100

    useEffect(() => {
        if (!selectedFurn) {
            setSizeDraft({ width: '', height: '', depth: '' })
            setLabelDraft('')
            return
        }
        setSizeDraft({
            width: selectedFurn.dimensions.width.toFixed(2),
            height: selectedFurn.dimensions.height.toFixed(2),
            depth: selectedFurn.dimensions.depth.toFixed(2),
        })
        setLabelDraft(selectedFurn.label || selectedFurn.type || '')
    }, [
        selectedFurn?.id,
        selectedFurn?.dimensions.width,
        selectedFurn?.dimensions.height,
        selectedFurn?.dimensions.depth,
        selectedFurn?.label,
        selectedFurn?.type,
    ])

    const commitSize = () => {
        if (!selectedFurn) return
        const width = parseFloat(sizeDraft.width)
        const height = parseFloat(sizeDraft.height)
        const depth = parseFloat(sizeDraft.depth)
        if (!isFinite(width) || !isFinite(height) || !isFinite(depth) || width <= 0 || height <= 0 || depth <= 0) {
            return
        }
        updateFurniture(selectedFurn.id, {
            dimensions: { width, height, depth }
        })

        const bp = (window as any).__BP3D_INSTANCE__
        const item = bp?.model?.scene?.getItems?.()?.find((it: any) => it?.metadata?.storeId === selectedFurn.id)
        if (item?.resize) {
            item.resize(mToCm(height), mToCm(width), mToCm(depth))
        }
    }

    const commitLabel = () => {
        if (!selectedFurn) return
        updateFurniture(selectedFurn.id, { label: labelDraft })
        const bp = (window as any).__BP3D_INSTANCE__
        const item = bp?.model?.scene?.getItems?.()?.find((it: any) => it?.metadata?.storeId === selectedFurn.id)
        if (item?.metadata) {
            item.metadata.itemName = labelDraft
        }
    }

    const rotateBy = (deg: number) => {
        if (!selectedFurn) return
        const delta = (deg * Math.PI) / 180
        const next = (selectedFurn.rotation?.y || 0) + delta
        updateFurniture(selectedFurn.id, { rotation: { y: next } })
        const bp = (window as any).__BP3D_INSTANCE__
        const item = bp?.model?.scene?.getItems?.()?.find((it: any) => it?.metadata?.storeId === selectedFurn.id)
        if (item) {
            item.rotation.y = next
            item.scene.needsUpdate = true
        }
    }

    // --- AI Handlers ---

    // 1. Upload Image
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsProcessingAI(true)
        setStatusMsg("Uploading...")

        // Preview
        const reader = new FileReader()
        reader.onload = (ev) => {
            if (ev.target?.result) setImageSrc(ev.target.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to API
        const formData = new FormData()
        formData.append('image', file)

        try {
            const res = await fetch('/api/runs', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.ok) {
                setJobId(data.run_id)
                setStatusMsg("Ready. Click object to segment.")
            } else {
                setStatusMsg("Upload failed.")
            }
        } catch (err) {
            console.error(err)
            setStatusMsg("Error uploading.")
        } finally {
            setIsProcessingAI(false)
        }
    }

    // 2. Adjust Canvas Size when image loads
    useEffect(() => {
        if (!imageSrc || !canvasRef.current || !overlayRef.current) return

        const img = new Image()
        img.src = imageSrc
        img.onload = () => {
            if (canvasRef.current && overlayRef.current) {
                // Fit to sidebar width (approx 280px minus padding)
                // We keep aspect ratio but scale down for display
                // Actually, for segmentation click coordinates to match, we need to handle scaling carefully.
                // We'll let CSS handle display size, but set internal resolution to match image?
                // Or just set strict width.

                // Let's stick to intrinsic size for canvas and scale visually with CSS max-w-full
                canvasRef.current.width = img.width
                canvasRef.current.height = img.height
                overlayRef.current.width = img.width
                overlayRef.current.height = img.height

                const ctx = canvasRef.current.getContext('2d')
                ctx?.drawImage(img, 0, 0)
            }
        }
    }, [imageSrc])

    // 3. Click Segmentation
    const handleCanvasClick = async (e: React.MouseEvent) => {
        if (!jobId || isProcessingAI || !canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const scaleX = canvasRef.current.width / rect.width
        const scaleY = canvasRef.current.height / rect.height

        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY

        setIsProcessingAI(true)
        setStatusMsg("Segmenting...")

        try {
            const formData = new FormData()
            formData.append('job_id', jobId)
            formData.append('x', x.toString())
            formData.append('y', y.toString())
            formData.append('intent', 'user_click')

            const res = await fetch('/api/sam3d/segment-click', {
                method: 'POST',
                body: formData,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            })
            const data = await res.json().catch(() => ({} as any))

            if (res.status === 429) {
                setStatusMsg(data?.message || 'GPU busy. Please wait and try again.')
                return
            }

            if (data.ok || data.mask_id) {
                // The new server endpoint returns `job_id` for the specific click task.
                const clickJobId = data.job_id;

                // If polygon is missing (async worker), poll for it via the status endpoint
                let result = data;
                if (!result.polygon && clickJobId) {
                    setStatusMsg("Processing click...");
                    const pollStart = Date.now();
                    while (Date.now() - pollStart < 15000) { // 15s timeout
                        await new Promise(r => setTimeout(r, 150));
                        try {
                            const check = await fetch(`/api/sam3d/jobs/${clickJobId}/status`);
                            if (check.ok) {
                                const statusData = await check.json();
                                if (statusData.status === 'COMPLETED' && statusData.polygon && statusData.polygon.length > 0) {
                                    result = statusData;
                                    break;
                                } else if (statusData.status === 'FAILED') {
                                    setStatusMsg("Segmentation failed internally.");
                                    break;
                                }
                            }
                        } catch (e) { }
                    }
                }

                if (result.polygon) {
                    setMasks([result]);
                    drawMasks([result]);
                    setStatusMsg("Segmented! Ready to generate.");
                } else {
                    setStatusMsg("Segmentation timed out.");
                }
            } else {
                setStatusMsg("No object found.");
            }
        } catch (err) {
            console.error(err)
            setStatusMsg("Segmentation failed.")
        } finally {
            setIsProcessingAI(false)
        }
    }

    const drawMasks = (maskList: any[]) => {
        if (!overlayRef.current) return
        const ctx = overlayRef.current.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)

        maskList.forEach(mask => {
            if (mask.polygon && mask.polygon.length > 0) {
                ctx.beginPath()
                ctx.moveTo(mask.polygon[0][0], mask.polygon[0][1])
                for (let i = 1; i < mask.polygon.length; i++) {
                    ctx.lineTo(mask.polygon[i][0], mask.polygon[i][1])
                }
                ctx.closePath()
                ctx.fillStyle = 'rgba(99, 102, 241, 0.4)'
                ctx.fill()
                ctx.strokeStyle = '#fff'
                ctx.lineWidth = 4
                ctx.stroke()
            }
        })
    }

    // 4. Trigger 3D
    const trigger3D = async () => {
        if (!jobId || masks.length === 0) return

        setIsProcessingAI(true)
        setStatusMsg("Queuing 3D Generation...")

        try {
            const res = await fetch('/api/sam3d/reconstruct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId,
                    polygon: masks[0].polygon
                })
            })
            const data = await res.json()
            if (data.ok) {
                // Don't poll here. Just notify queued.
                // The backend handles the job separately.
                setStatusMsg(`Queued: ${data.message || "3D Model"}`)
                setIsProcessingAI(false)

                // Add to list immediately as placeholder? 
                // No, let the user continue.
            } else {
                setStatusMsg("Failed to start 3D gen.")
                setIsProcessingAI(false)
            }
        } catch (err) {
            console.error(err)
            setIsProcessingAI(false)
            setStatusMsg("Error calling backend.")
        }
    }



    if (!isVisible) return null

    return (
        <div className="w-[320px] border-l bg-card h-[calc(100vh-3.5rem)] flex flex-col select-none overflow-hidden animate-in slide-in-from-right duration-300">

            {/* Selected Item Controls */}
            {selectedFurn && (
                <div className="p-4 border-b bg-secondary/5">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Selected Item</h3>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold">Label</label>
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-muted-foreground/70" />
                                <input
                                    type="text"
                                    value={labelDraft}
                                    onChange={(e) => setLabelDraft(e.target.value)}
                                    onBlur={commitLabel}
                                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                    placeholder="Item label..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold">Size (m)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={sizeDraft.width}
                                    onChange={(e) => setSizeDraft(s => ({ ...s, width: e.target.value }))}
                                    onBlur={commitSize}
                                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="W"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={sizeDraft.height}
                                    onChange={(e) => setSizeDraft(s => ({ ...s, height: e.target.value }))}
                                    onBlur={commitSize}
                                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="H"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={sizeDraft.depth}
                                    onChange={(e) => setSizeDraft(s => ({ ...s, depth: e.target.value }))}
                                    onBlur={commitSize}
                                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="D"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => rotateBy(-15)}
                                className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border bg-secondary/30 py-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                            >
                                <RotateCw className="w-3 h-3 rotate-180" />
                                Rotate -15°
                            </button>
                            <button
                                onClick={() => rotateBy(15)}
                                className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border bg-secondary/30 py-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                            >
                                <RotateCw className="w-3 h-3" />
                                Rotate +15°
                            </button>
                        </div>

                        <button
                            onClick={() => deleteObject(selectedFurn.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 py-2 text-[11px] text-red-300 hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete Item
                        </button>
                    </div>
                </div>
            )}

            {/* --- AI Reconstruction Panel (Visible when activeTool === 'furniture') --- */}
            {activeTool === 'furniture' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Reconstruction</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">Upload an image and segment objects to create 3D models.</p>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1 space-y-4">

                        {/* Control Bar */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 px-3 py-2 rounded text-xs font-semibold transition-colors"
                                >
                                    <Upload className="w-3 h-3" />
                                    Upload Image
                                </button>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />

                                <button
                                    onClick={trigger3D}
                                    disabled={masks.length === 0 || isProcessingAI}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold transition-colors border",
                                        masks.length > 0 ? "bg-accent text-accent-foreground border-accent" : "bg-muted text-muted-foreground border-border cursor-not-allowed"
                                    )}
                                >
                                    {isProcessingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Box className="w-3 h-3" />}
                                    Generate 3D
                                </button>
                            </div>

                            {statusMsg && (
                                <div className={`text-[10px] font-mono text-center p-1.5 rounded ${statusMsg.includes("Queued") ? "bg-green-500/20 text-green-300" :
                                    (statusMsg.includes("Error") || statusMsg.includes("Failed") ? "bg-red-500/20 text-red-300" : "bg-secondary/30 text-muted-foreground")
                                    }`}>
                                    {statusMsg}
                                </div>
                            )}

                            {/* Generate Another Button (appears after queueing) */}
                            {statusMsg.includes("Queued") && (
                                <button
                                    onClick={() => {
                                        setStatusMsg("Ready. Click object to segment.");
                                        setMasks([]);
                                        if (overlayRef.current) {
                                            const ctx = overlayRef.current.getContext('2d');
                                            ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded text-xs font-semibold transition-colors animate-in fade-in"
                                >
                                    <MousePointer2 className="w-3 h-3" />
                                    Segment Another Object
                                </button>
                            )}
                        </div>

                        {/* Canvas Area */}
                        <div className="relative border rounded-lg overflow-hidden bg-black/20 flex items-center justify-center min-h-[200px] border-dashed border-border/50">
                            {!imageSrc && (
                                <div className="text-center text-muted-foreground/50 p-4">
                                    <MousePointer2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No image loaded</p>
                                </div>
                            )}

                            {imageSrc && (
                                <div className="relative max-w-full">
                                    <canvas
                                        ref={canvasRef}
                                        className="block w-full h-auto cursor-crosshair"
                                        onMouseDown={handleCanvasClick}
                                    />
                                    <canvas
                                        ref={overlayRef}
                                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-primary/5 rounded-lg">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Status</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">Job ID:</span>
                                    <span className="font-mono text-primary truncate max-w-[100px]">{jobId || 'None'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">State:</span>
                                    <span className={cn(
                                        "font-semibold",
                                        statusMsg.includes("Error") ? "text-red-400" : (statusMsg.includes("Ready") ? "text-green-400" : "text-yellow-400")
                                    )}>
                                        {statusMsg || 'Idle'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Job Queue — always visible at bottom, outside scroll */}
                    <JobQueuePanel />

                </div>
            )}

            {/* --- 3D Options Panel (Visible when mode === '3d') --- */}
            {true && ( // mode === '3d' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">3D Options</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">Control 3D rendering and test features.</p>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1 space-y-4">
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    console.log('Test GLB button clicked, current state:', testGLB)
                                    if (!testGLB) {
                                        // Show test GLB even before calibration by entering 3D mode
                                        setMode('3d')
                                    }
                                    toggleTestGLB()
                                }}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold transition-colors border",
                                    testGLB ? "bg-accent text-accent-foreground border-accent" : "bg-secondary/30 text-muted-foreground border-border hover:text-foreground hover:bg-secondary/50"
                                )}
                            >
                                <Box className="w-3 h-3" />
                                {testGLB ? "Hide Test GLB" : "Load Test GLB"}
                            </button>
                            <p className="text-[10px] text-muted-foreground">Load and render a test GLB file from the test folder.</p>
                        </div>
                    </div>

                    {/* Job Queue — always visible at bottom, outside scroll */}
                    <JobQueuePanel />
                </div>
            )}

            {/* Job Queue — always show when sidebar is open */}
            {activeTool !== 'furniture' && <JobQueuePanel />}

        </div>
    )
}
