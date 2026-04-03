'use client'

import {
    Upload,
    Loader2,
    MousePointer2,
    Box,
    RotateCw,
    Trash2,
    Tag,
    X
} from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react'

type PolygonPoint = [number, number]

type SegmentMask = {
    ok?: boolean
    mask_id?: string
    job_id?: string
    polygon?: PolygonPoint[]
    status?: string
    message?: string
}

type BlueprintSceneItem = {
    metadata?: {
        storeId?: string
        itemName?: string
    }
    resize?: (height: number, width: number, depth: number) => void
    rotation?: {
        y: number
    }
    scene?: {
        needsUpdate: boolean
    }
}

const getBpItems = (): BlueprintSceneItem[] => {
    if (typeof window === 'undefined') return []
    const bp = (window as Window & {
        __BP3D_INSTANCE__?: {
            model?: {
                scene?: {
                    getItems?: () => BlueprintSceneItem[]
                }
            }
        }
    }).__BP3D_INSTANCE__

    return bp?.model?.scene?.getItems?.() ?? []
}

function PanelSection({
    eyebrow,
    title,
    description,
    accent = 'default',
    children,
}: {
    eyebrow?: string
    title: string
    description?: string
    accent?: 'default' | 'emerald' | 'cyan'
    children: ReactNode
}) {
    const accentClasses = {
        default: 'border-white/10 bg-white/[0.03]',
        emerald: 'border-emerald-400/15 bg-emerald-400/[0.06]',
        cyan: 'border-cyan-400/15 bg-cyan-400/[0.06]',
    }

    return (
        <section className={cn("overflow-hidden rounded-[24px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]", accentClasses[accent])}>
            <div className="border-b border-white/8 px-4 py-3">
                {eyebrow && (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
                )}
                <div className={cn(eyebrow && 'mt-1.5')}>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    {description && <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>}
                </div>
            </div>
            <div className="px-4 py-4">{children}</div>
        </section>
    )
}

type RightSidebarProps = {
    desktopExpanded?: boolean
    onDesktopHoverStart?: () => void
    onDesktopHoverEnd?: () => void
}

export function RightSidebar({
    desktopExpanded = false,
    onDesktopHoverStart,
    onDesktopHoverEnd,
}: RightSidebarProps) {
    const activeTool = useFloorplanStore(s => s.activeTool)
    const mode = useFloorplanStore(s => s.mode)
    const token = useFloorplanStore(s => s.token)
    const currentRunId = useFloorplanStore(s => s.currentRunId)
    const selectedId = useFloorplanStore(s => s.selectedId)
    const furniture = useFloorplanStore(s => s.furniture)
    const updateFurniture = useFloorplanStore(s => s.updateFurniture)
    const deleteObject = useFloorplanStore(s => s.deleteObject)
    const glbPreviewSource = useFloorplanStore(s => s.glbPreviewSource)
    const setGlbPreviewSource = useFloorplanStore(s => s.setGlbPreviewSource)
    const setMode = useFloorplanStore(s => s.setMode)
    const mobileRightSidebarOpen = useFloorplanStore(s => s.mobileRightSidebarOpen)
    const setMobileRightSidebarOpen = useFloorplanStore(s => s.setMobileRightSidebarOpen)

    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [jobId, setJobId] = useState<string | null>(null)
    const [isProcessingAI, setIsProcessingAI] = useState(false)
    const [statusMsg, setStatusMsg] = useState('')
    const [masks, setMasks] = useState<SegmentMask[]>([])

    const selectedFurn = useMemo(
        () => furniture.find(f => f.id === selectedId),
        [furniture, selectedId]
    )

    const [sizeDraft, setSizeDraft] = useState({ width: '', height: '', depth: '' })
    const [labelDraft, setLabelDraft] = useState('')

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const overlayRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const mToCm = (v: number) => v * 100
    const showAiPanel = activeTool === 'furniture'
    const showPreviewPanel = mode === '3d' || glbPreviewSource !== 'none'

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
    }, [selectedFurn])

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

        const item = getBpItems().find((it) => it.metadata?.storeId === selectedFurn.id)
        if (item?.resize) {
            item.resize(mToCm(height), mToCm(width), mToCm(depth))
        }
    }

    const commitLabel = () => {
        if (!selectedFurn) return
        updateFurniture(selectedFurn.id, { label: labelDraft })
        const item = getBpItems().find((it) => it.metadata?.storeId === selectedFurn.id)
        if (item?.metadata) {
            item.metadata.itemName = labelDraft
        }
    }

    const rotateBy = (deg: number) => {
        if (!selectedFurn) return
        const delta = (deg * Math.PI) / 180
        const next = (selectedFurn.rotation?.y || 0) + delta
        updateFurniture(selectedFurn.id, {
            rotation: {
                x: selectedFurn.rotation?.x || 0,
                y: next,
                z: selectedFurn.rotation?.z || 0,
            }
        })
        const item = getBpItems().find((it) => it.metadata?.storeId === selectedFurn.id)
        if (item) {
            if (item.rotation) item.rotation.y = next
            if (item.scene) item.scene.needsUpdate = true
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsProcessingAI(true)
        setStatusMsg("Uploading...")

        const reader = new FileReader()
        reader.onload = (ev) => {
            if (ev.target?.result) setImageSrc(ev.target.result as string)
        }
        reader.readAsDataURL(file)

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

    useEffect(() => {
        if (!imageSrc || !canvasRef.current || !overlayRef.current) return

        const img = new Image()
        img.src = imageSrc
        img.onload = () => {
            if (canvasRef.current && overlayRef.current) {
                canvasRef.current.width = img.width
                canvasRef.current.height = img.height
                overlayRef.current.width = img.width
                overlayRef.current.height = img.height

                const ctx = canvasRef.current.getContext('2d')
                ctx?.drawImage(img, 0, 0)
            }
        }
    }, [imageSrc])

    const drawMasks = (maskList: SegmentMask[]) => {
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
                ctx.fillStyle = 'rgba(34, 211, 238, 0.22)'
                ctx.fill()
                ctx.strokeStyle = '#f8fafc'
                ctx.lineWidth = 3
                ctx.stroke()
            }
        })
    }

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
            const data = await res.json().catch(() => ({} as SegmentMask)) as SegmentMask

            if (res.status === 429) {
                setStatusMsg(data?.message || 'GPU busy. Please wait and try again.')
                return
            }

            if (data.ok || data.mask_id) {
                const clickJobId = data.job_id
                let result: SegmentMask = data

                if (!result.polygon && clickJobId) {
                    setStatusMsg("Processing click...")
                    const pollStart = Date.now()
                    while (Date.now() - pollStart < 15000) {
                        await new Promise(r => setTimeout(r, 150))
                        try {
                            const check = await fetch(`/api/sam3d/jobs/${clickJobId}/status`)
                            if (check.ok) {
                                const statusData = await check.json() as SegmentMask
                                if (statusData.status === 'COMPLETED' && statusData.polygon && statusData.polygon.length > 0) {
                                    result = statusData
                                    break
                                } else if (statusData.status === 'FAILED') {
                                    setStatusMsg("Segmentation failed internally.")
                                    break
                                }
                            }
                        } catch {
                            // ignore transient polling failure
                        }
                    }
                }

                if (result.polygon) {
                    setMasks([result])
                    drawMasks([result])
                    setStatusMsg("Segmented! Ready to generate.")
                } else {
                    setStatusMsg("Segmentation timed out.")
                }
            } else {
                setStatusMsg("No object found.")
            }
        } catch (err) {
            console.error(err)
            setStatusMsg("Segmentation failed.")
        } finally {
            setIsProcessingAI(false)
        }
    }

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
                setStatusMsg(`Queued: ${data.message || "3D Model"}`)
            } else {
                setStatusMsg("Failed to start 3D gen.")
            }
        } catch (err) {
            console.error(err)
            setStatusMsg("Error calling backend.")
        } finally {
            setIsProcessingAI(false)
        }
    }

    return (
        <aside
            className={cn(
                "absolute inset-y-3 right-3 z-40 flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#070b12]/94 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl transition-all duration-300 xl:bottom-4 xl:right-4 xl:top-4 xl:bg-slate-950/78",
                mobileRightSidebarOpen ? "translate-x-0 w-[min(92vw,360px)] max-w-[360px]" : "translate-x-[108%] w-[min(92vw,360px)] max-w-[360px]",
                desktopExpanded 
                    ? "xl:translate-x-0 xl:w-[332px] xl:max-w-[332px]" 
                    : "xl:translate-x-0 xl:w-16 xl:max-w-16 xl:rounded-r-[28px] xl:rounded-l-none xl:border-l-0"
            )}
            onMouseEnter={onDesktopHoverStart}
            onMouseLeave={onDesktopHoverEnd}
        >
            {/* Dockbar content when minimized */}
            {!desktopExpanded && (
                <div className="flex flex-col items-center gap-4 p-3">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                            <MousePointer2 className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                            <Box className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                            <RotateCw className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                            <Trash2 className="h-4 w-4 text-slate-300" />
                        </div>
                    </div>
                </div>
            )}

            {/* Full content when expanded */}
            {desktopExpanded && (
                <>
                <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.75),rgba(2,6,23,0.6))] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        <span className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                            mode === '3d'
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                        )}>
                            {mode === '3d' ? '3D' : '2D'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                            {selectedFurn ? 'Selected' : 'Ready'}
                        </span>
                        {showAiPanel && (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-100">
                                Furn AI
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setMobileRightSidebarOpen(false)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 xl:hidden"
                        aria-label="Close inspector panel"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        <span className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                            mode === '3d'
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                        )}>
                            {mode === '3d' ? '3D' : '2D'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                            {selectedFurn ? 'Selected' : 'Ready'}
                        </span>
                        {showAiPanel && (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-100">
                                Furn AI
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setMobileRightSidebarOpen(false)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 xl:hidden"
                        aria-label="Close inspector panel"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                {selectedFurn && (
                    <PanelSection
                        eyebrow="Selection"
                        title={selectedFurn.label || selectedFurn.type || 'Selected item'}
                        description="Rename, resize, rotate, or remove the currently selected furniture."
                        accent="default"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Label</label>
                                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2">
                                    <Tag className="h-4 w-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={labelDraft}
                                        onChange={(e) => setLabelDraft(e.target.value)}
                                        onBlur={commitLabel}
                                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                                        placeholder="Item label..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Dimensions (m)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={sizeDraft.width}
                                        onChange={(e) => setSizeDraft(s => ({ ...s, width: e.target.value }))}
                                        onBlur={commitSize}
                                        className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                                        placeholder="W"
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={sizeDraft.height}
                                        onChange={(e) => setSizeDraft(s => ({ ...s, height: e.target.value }))}
                                        onBlur={commitSize}
                                        className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                                        placeholder="H"
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={sizeDraft.depth}
                                        onChange={(e) => setSizeDraft(s => ({ ...s, depth: e.target.value }))}
                                        onBlur={commitSize}
                                        className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                                        placeholder="D"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => rotateBy(-15)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                                >
                                    <RotateCw className="h-3.5 w-3.5 rotate-180" />
                                    Rotate -15°
                                </button>
                                <button
                                    onClick={() => rotateBy(15)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                                >
                                    <RotateCw className="h-3.5 w-3.5" />
                                    Rotate +15°
                                </button>
                            </div>

                            <button
                                onClick={() => deleteObject(selectedFurn.id)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/16"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Item
                            </button>
                        </div>
                    </PanelSection>
                )}

                {showAiPanel && (
                    <PanelSection
                        eyebrow="Furn AI"
                        title="AI Reconstruction"
                        description="Upload a reference image, click the target object, and queue a 3D asset."
                        accent="emerald"
                    >
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/16"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        Upload Image
                                    </button>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />

                                    <button
                                        onClick={trigger3D}
                                        disabled={masks.length === 0 || isProcessingAI}
                                        className={cn(
                                            "inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition",
                                            masks.length > 0 && !isProcessingAI
                                                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/16"
                                                : "cursor-not-allowed border-white/10 bg-white/[0.04] text-slate-500"
                                        )}
                                    >
                                        {isProcessingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Box className="h-3.5 w-3.5" />}
                                        Generate 3D
                                    </button>
                                </div>

                                {statusMsg && (
                                    <div className={cn(
                                        "rounded-2xl border px-3 py-2 text-[11px] font-medium",
                                        statusMsg.includes("Queued")
                                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                            : (statusMsg.includes("Error") || statusMsg.includes("Failed"))
                                                ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
                                                : "border-white/10 bg-white/[0.04] text-slate-300"
                                    )}>
                                        {statusMsg}
                                    </div>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-[22px] border border-dashed border-white/12 bg-slate-950/70">
                                {!imageSrc ? (
                                    <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">
                                        <MousePointer2 className="mb-3 h-8 w-8 text-slate-500" />
                                        <p className="text-sm font-medium text-white">No image loaded</p>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                            Upload a reference photo, then click the object you want to segment.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <canvas
                                            ref={canvasRef}
                                            className="block h-auto w-full cursor-crosshair"
                                            onMouseDown={handleCanvasClick}
                                        />
                                        <canvas
                                            ref={overlayRef}
                                            className="pointer-events-none absolute inset-0 h-full w-full"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2 rounded-[22px] border border-white/10 bg-slate-950/70 p-3">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">Job ID</span>
                                    <span className="max-w-[130px] truncate font-mono text-cyan-100">{jobId || 'None'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">State</span>
                                    <span className={cn(
                                        "font-semibold",
                                        statusMsg.includes("Error") || statusMsg.includes("Failed")
                                            ? "text-rose-200"
                                            : statusMsg.includes("Ready") || statusMsg.includes("Segmented")
                                                ? "text-emerald-200"
                                                : "text-slate-200"
                                    )}>
                                        {statusMsg || 'Idle'}
                                    </span>
                                </div>
                            </div>

                            {statusMsg.includes("Queued") && (
                                <button
                                    onClick={() => {
                                        setStatusMsg("Ready. Click object to segment.")
                                        setMasks([])
                                        if (overlayRef.current) {
                                            const ctx = overlayRef.current.getContext('2d')
                                            ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
                                        }
                                    }}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/16"
                                >
                                    <MousePointer2 className="h-3.5 w-3.5" />
                                    Segment Another Object
                                </button>
                            )}
                        </div>
                    </PanelSection>
                )}

                {showPreviewPanel && (
                    <PanelSection
                        eyebrow="Preview"
                        title="3D Stage"
                        description="Switch between the live editor canvas, the reference test GLB, and the generated floorplan GLB."
                        accent="cyan"
                    >
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => {
                                        setMode('3d')
                                        setGlbPreviewSource('none')
                                    }}
                                    className={cn(
                                        "inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition",
                                        glbPreviewSource === 'none' && mode === '3d'
                                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                            : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                                    )}
                                >
                                    <RotateCw className="h-3.5 w-3.5" />
                                    Live 3D Editor
                                </button>

                                <button
                                    onClick={() => {
                                        setMode('3d')
                                        setGlbPreviewSource(glbPreviewSource === 'test' ? 'none' : 'test')
                                    }}
                                    className={cn(
                                        "inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition",
                                        glbPreviewSource === 'test'
                                            ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                                            : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                                    )}
                                >
                                    <Box className="h-3.5 w-3.5" />
                                    {glbPreviewSource === 'test' ? 'Hide Test GLB' : 'Load Test GLB'}
                                </button>

                                <button
                                    onClick={() => {
                                        setMode('3d')
                                        setGlbPreviewSource(glbPreviewSource === 'generated' ? 'none' : 'generated')
                                    }}
                                    disabled={!currentRunId}
                                    className={cn(
                                        "inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition",
                                        glbPreviewSource === 'generated'
                                            ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                                            : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]",
                                        !currentRunId && "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    {glbPreviewSource === 'generated' ? 'Hide Generated GLB' : 'Preview Generated GLB'}
                                </button>
                            </div>

                            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-3">
                                <p className="text-xs font-medium text-white">Preview state</p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                    {glbPreviewSource === 'generated'
                                        ? 'Generated floorplan GLB preview is active. This now uses the same overlay path and scene controls as the test asset.'
                                        : glbPreviewSource === 'test'
                                            ? 'Reference test GLB preview is active. Use it to compare camera feel, material handling, and scene framing.'
                                            : mode === '3d'
                                                ? 'Live BP3D editor is active. Switch to a GLB preview when you want to validate the exported mesh.'
                                                : 'Enter 3D mode or load a GLB preview from here.'}
                                </p>
                                {!currentRunId && (
                                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                                        Process a floorplan first to enable generated GLB preview.
                                    </p>
                                )}
                            </div>
                        </div>
                    </PanelSection>
                )}
            </div>
                </>
            )}
        </aside>
    )
}
