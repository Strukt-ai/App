'use client'

import { useState, useRef, useEffect } from 'react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { Upload, X, Loader2, Sparkles, Trash2, Layers, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FurnAIModalProps {
    isOpen: boolean
    onClose: () => void
}

type AnnotationPoint = {
    x: number
    y: number // Normalized 0-1
    id: string
}

type AnnotationLabel = {
    id: string
    name: string
    color: string
    points: AnnotationPoint[]
    polygon?: number[][] | null
}

const COLORS = [
    '#F472B6', // Pink
    '#60A5FA', // Blue
    '#34D399', // Emerald
    '#FBBF24', // Amber
    '#A78BFA', // Violet
    '#F87171', // Red
]

export function FurnAIModal({ isOpen, onClose }: FurnAIModalProps) {
    const [image, setImage] = useState<string | null>(null)

    const [labels, setLabels] = useState<AnnotationLabel[]>([])
    const [activePoints, setActivePoints] = useState<AnnotationPoint[]>([])
    const { currentRunId, token } = useFloorplanStore()

    const warmupRequestedRef = useRef(false)

    // Temporary mask preview
    const [previewPolygon, setPreviewPolygon] = useState<number[][] | null>(null)

    // UI State
    const [labelInput, setLabelInput] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusMsg, setStatusMsg] = useState('')

    const imgRef = useRef<HTMLImageElement>(null)
    const imageFileRef = useRef<File | null>(null)

    const handleClose = () => {
        if (currentRunId) {
            fetch('/api/sam3d/unload-model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ run_id: currentRunId }),
            }).catch(() => { })
        }
        onClose()
    }

    useEffect(() => {
        if (!isOpen) {
            warmupRequestedRef.current = false
            return
        }

        if (!currentRunId || warmupRequestedRef.current) return
        warmupRequestedRef.current = true

        fetch('/api/sam3d/load-model', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ run_id: currentRunId }),
        }).catch(() => { })
    }, [isOpen, currentRunId, token])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            setImage(url)
            imageFileRef.current = file  // Keep the actual File for SAM uploads
            // Reset state
            setLabels([])
            setActivePoints([])
        }
    }

    const handleImageClick = (e: React.MouseEvent) => {
        if (!image || !imgRef.current) return

        const rect = imgRef.current.getBoundingClientRect()
        const nx = (e.clientX - rect.left) / rect.width
        const ny = (e.clientY - rect.top) / rect.height

        const newPoint = { x: nx, y: ny, id: Math.random().toString(36).substr(2, 9) }



        if (e.shiftKey) {
            // Add to active group (Multi-select)
            setActivePoints(prev => [...prev, newPoint])
        } else {
            // New selection - clear previous unless shifting
            setActivePoints([newPoint])
            setPreviewPolygon(null)
        }

        // Send the actual uploaded image directly to the SAM daemon for segmentation.
        // This bypasses the server pipeline which would use the stored floor plan instead.
        if (imageFileRef.current) {
            setIsProcessing(true)
            setStatusMsg('')

            const pixelX = Math.round(newPoint.x * (imgRef.current.naturalWidth || 1))
            const pixelY = Math.round(newPoint.y * (imgRef.current.naturalHeight || 1))

            const tryClick = async () => {
                // Proxy through the backend /api/sam3d/segment-click which forwards to SAM daemon
                const samFormData = new FormData()
                samFormData.append('image', imageFileRef.current!)
                samFormData.append('x', pixelX.toString())
                samFormData.append('y', pixelY.toString())

                const res = await fetch('/api/sam3d/segment-click', {
                    method: 'POST',
                    body: samFormData,
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                })
                const result = await res.json().catch(() => ({} as any))

                setIsProcessing(false)
                setStatusMsg('')
                if (result?.polygon && result.polygon.length > 0) {
                    setPreviewPolygon(result.polygon)
                    console.log("[FurnAI] Received Polygon:", result.polygon.length, "points")
                } else {
                    setStatusMsg('No mask found. Try clicking on a different area.')
                }
            }

            Promise.resolve(tryClick())
                .catch(err => {
                    console.error("[FurnAI] Segment Click Failed", err)
                    setStatusMsg('Segmentation failed: ' + err.message)
                    setIsProcessing(false)
                })
        }
    }

    const handleAddLabel = () => {
        if (!labelInput.trim() || activePoints.length === 0) return

        const newLabel: AnnotationLabel = {
            id: Math.random().toString(36).substr(2, 9),
            name: labelInput,
            color: COLORS[labels.length % COLORS.length],
            points: activePoints,
            polygon: previewPolygon
        }

        setLabels([...labels, newLabel])
        setActivePoints([]) // Clear active
        setLabelInput('')
    }

    const handleDeleteLabel = (id: string) => {
        setLabels(labels.filter(l => l.id !== id))
    }

    const handleSendToBackend = async () => {
        console.log("handleSendToBackend clicked", { currentRunId, labels: labels.length })

        if (!currentRunId || !token || labels.length === 0) {
            if (activePoints.length > 0) {
                alert("You have a selection (mask) but haven't added it to the list yet!\n\n1. Type a name (e.g. 'Chair')\n2. Click the (+) button\n3. THEN click Generate.")
            } else {
                alert("Please add at least one furniture item before sending (and ensure you are logged in).")
            }
            return
        }

        setIsProcessing(true)
        setStatusMsg("Starting upload...")

        try {
            const formData = new FormData()
            formData.append('run_id', currentRunId)

            // Serialize items
            const itemsPayload = labels.map(l => ({
                id: l.id,
                name: l.name,
                color: l.color,
                points: l.points.map(pt => ({
                    ...pt,
                    x: Math.round(pt.x * (imgRef.current?.naturalWidth || 1)),
                    y: Math.round(pt.y * (imgRef.current?.naturalHeight || 1))
                })),
                polygon: l.polygon ?? []
            }))
            formData.append('items', JSON.stringify(itemsPayload))

            // Image handling (Blob or File)
            let hasImage = false
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput?.files?.[0]) {
                formData.append('image', fileInput.files[0])
                hasImage = true
            } else if (image && image.startsWith('blob:')) {
                try {
                    const blob = await fetch(image).then(r => r.blob())
                    formData.append('image', blob, 'image.png')
                    hasImage = true
                } catch (e) {
                    console.error("Blob fetch failed", e)
                }
            }

            console.log("Sending request...", { hasImage, itemCount: itemsPayload.length })
            const res = await fetch('/api/sam3d/submit-batch', {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData
            })

            console.log("Response status:", res.status)
            const data = await res.json()

            if (res.ok) {
                alert(`Success! Queued ${data.jobs?.length || 0} jobs. Check your email for results.`)
                setStatusMsg(`Success! Queued.`)
                setTimeout(() => {
                    setIsProcessing(false)
                    onClose()
                }, 1500)
            } else {
                alert(`Server Error: ${data.detail || 'Unknown error'}`)
                setStatusMsg(`Error: ${data.detail}`)
                setIsProcessing(false)
            }
        } catch (e: any) {
            console.error(e)
            alert(`Network Error: ${e.message}`)
            setStatusMsg("Network error.")
            setIsProcessing(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-[90vw] h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Left: Image Canvas */}
                <div className="flex-1 relative bg-[#111] flex items-center justify-center overflow-hidden group">
                    {!image ? (
                        <div className="flex flex-col items-center gap-4">
                            <label className="flex flex-col items-center gap-4 cursor-pointer p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
                                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-purple-400" />
                                </div>
                                <div className="text-center">
                                    <span className="text-sm font-semibold text-white block">Upload Reference Image</span>
                                    <span className="text-xs text-white/40 block mt-1">Click to browse</span>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                    ) : (
                        <div className="relative w-full h-full p-8 flex items-center justify-center">
                            <div className="relative inline-block shadow-2xl">
                                <img
                                    ref={imgRef}
                                    src={image}
                                    alt="Reference"
                                    className="max-w-full max-h-[75vh] object-contain rounded-lg border border-white/10 cursor-crosshair"
                                    onClick={handleImageClick}
                                    draggable={false}
                                />

                                {/* Render Existing Labels Points */}
                                {labels.map(label => (
                                    label.points.map(pt => (
                                        <div
                                            key={pt.id}
                                            className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{
                                                left: `${pt.x * 100}%`,
                                                top: `${pt.y * 100}%`,
                                                backgroundColor: label.color
                                            }}
                                        />
                                    ))
                                ))}

                                {/* Render Active Points */}
                                {activePoints.map(pt => (
                                    <div
                                        key={pt.id}
                                        className="absolute w-3 h-3 rounded-full bg-white border border-purple-500 shadow-sm transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"
                                        style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%` }}
                                    />
                                ))}

                                {/* Render Active Polygon Preview */}
                                {previewPolygon && (
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        <polygon
                                            points={previewPolygon.map(p => {
                                                const img = imgRef.current
                                                const rect = img?.getBoundingClientRect()

                                                const natW = img?.naturalWidth || 1
                                                const natH = img?.naturalHeight || 1
                                                const dispW = rect?.width || 1
                                                const dispH = rect?.height || 1

                                                const a = p?.[0] ?? 0
                                                const b = p?.[1] ?? 0

                                                // Backend SAM output is usually in natural pixel coordinates
                                                const nx = a / natW
                                                const ny = b / natH

                                                const x = nx * dispW
                                                const y = ny * dispH

                                                const safeX = Number.isFinite(x) ? x : 0
                                                const safeY = Number.isFinite(y) ? y : 0
                                                return `${safeX},${safeY}`
                                            }).join(' ')}
                                            fill="rgba(168, 85, 247, 0.4)"
                                            stroke="#A855F7"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                )}

                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white/50 hover:text-white rounded-md hover:bg-red-500/50 transition-colors"
                                    title="Remove Image"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="w-80 border-l border-white/10 bg-[#0F0F0F] flex flex-col">
                    {/* Header */}
                    <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-gradient-to-r from-purple-900/10 to-transparent">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="font-semibold text-sm text-white">Furn AI</span>
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">PRO</span>
                        </div>
                        <button onClick={handleClose}><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
                    </div>

                    {/* Tools */}
                    <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">

                        {statusMsg && (
                            <div className="text-xs text-center py-2 px-3 rounded-lg border border-white/10 bg-white/5 text-white/70">
                                {statusMsg}
                            </div>
                        )}

                        {/* Instruction Banner */}
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                            <Layers className="w-4 h-4 text-purple-400" />
                            <div className="text-left">
                                <span className="text-xs font-semibold block text-white/90">Selection Mode</span>
                                <span className="text-[10px] text-white/50 block">Click to select single item.<br />Hold <strong className="text-purple-300">Shift</strong> to group multiple parts.</span>
                            </div>
                        </div>

                        {/* Active Selection Input */}
                        <div className={cn(
                            "p-3 rounded-lg border border-white/10 bg-white/5 space-y-3 transition-all",
                            activePoints.length > 0 ? "opacity-100" : "opacity-50 pointer-events-none"
                        )}>
                            <div className="flex items-center justify-between text-xs text-white/70">
                                <span>Selected Points: {activePoints.length}</span>
                                <button onClick={() => setActivePoints([])} className="hover:text-red-400">Clear</button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Label name (e.g. Chair)"
                                    value={labelInput}
                                    onChange={(e) => setLabelInput(e.target.value)}
                                    className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                                />
                                <button
                                    onClick={handleAddLabel}
                                    disabled={!labelInput.trim()}
                                    className="p-1.5 bg-purple-600 rounded hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Labels List */}
                        <div className="space-y-2 mt-2">
                            <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Labeled Items</span>
                            {labels.length === 0 && (
                                <p className="text-xs text-center py-4 text-white/20 italic">No labels added yet.</p>
                            )}
                            {labels.map(label => (
                                <div key={label.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 group hover:border-white/10">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                                        <span className="text-xs text-white/80 font-medium truncate">{label.name}</span>
                                        <span className="text-[9px] text-white/30">({label.points.length} pts)</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteLabel(label.id)}
                                        className="text-white/20 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <button
                            onClick={handleSendToBackend}
                            disabled={isProcessing}
                            className={cn(
                                "w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg",
                                isProcessing
                                    ? "bg-purple-900/50 text-purple-200 cursor-wait"
                                    : "bg-purple-600 hover:bg-purple-500 text-white"
                            )}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing Segment...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate 3D Models
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
