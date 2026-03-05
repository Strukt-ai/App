'use client'

import { useState, useRef, useEffect } from 'react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { Move, Minus, Plus, Maximize, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ReferenceOverlay() {
    const uploadedImage = useFloorplanStore(s => s.uploadedImage)
    const showBackground = useFloorplanStore(s => s.showBackground)
    const toggleBackground = useFloorplanStore(s => s.toggleBackground)
    const mode = useFloorplanStore(s => s.mode) // Check mode

    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDraggingImage, setIsDraggingImage] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Window Position (simple draggable implementation)
    // We'll use a fixed initial position (bottom-right) and transform it
    const [windowPos, setWindowPos] = useState({ x: 0, y: 0 }) // Offset from default bottom-right
    const [isDraggingWindow, setIsDraggingWindow] = useState(false)
    const windowRef = useRef<HTMLDivElement>(null)

    // Global Mouse Move/Up for Drags (MOVED UP to fix Hooks error)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingImage) {
                setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                })
            }
            if (isDraggingWindow) {
                setWindowPos({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                })
            }
        }

        const handleMouseUp = () => {
            setIsDraggingImage(false)
            setIsDraggingWindow(false)
        }

        if (isDraggingImage || isDraggingWindow) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDraggingImage, isDraggingWindow, dragStart])


    if (!uploadedImage || !showBackground || mode === '3d') return null

    // --- Image Pan/Zoom Handlers ---

    const handleWheel = (e: React.WheelEvent) => {
        // Prevent page scroll
        e.stopPropagation()
        // Determine zoom direction
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setScale(s => Math.min(Math.max(s * delta, 1), 8)) // Clamp 1x to 8x
    }

    const handleImageMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            e.preventDefault()
            setIsDraggingImage(true)
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
        }
    }

    // --- Window Drag Handlers ---
    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDraggingWindow(true)
        setDragStart({ x: e.clientX - windowPos.x, y: e.clientY - windowPos.y })
    }


    return (
        <div
            ref={windowRef}
            className="absolute z-50 flex flex-col bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden"
            style={{
                bottom: '20px',
                right: '20px',
                width: '400px', // Default
                height: 'auto',
                minWidth: '200px',
                minHeight: '200px',
                resize: 'both', // Allows resizing
                transform: `translate(${windowPos.x}px, ${windowPos.y}px)`,
            }}
            onWheel={(e) => e.stopPropagation()} // Stop zoom reaching canvas
        >
            {/* Header / Drag Handle */}
            <div
                className="h-8 bg-white/5 border-b border-white/10 flex items-center justify-between px-2 cursor-move select-none"
                onMouseDown={handleHeaderMouseDown}
            >
                <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                    <Move className="w-3 h-3" />
                    <span>Reference View</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }) }}
                        className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded text-[10px] text-white/50 hover:text-white transition-colors"
                        title="Reset Zoom & Pan"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                    </button>
                    <button
                        onClick={toggleBackground}
                        className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded text-[10px] text-white/50 hover:text-red-400 transition-colors"
                        title="Hide Reference"
                    >
                        <X className="w-3 h-3" />
                        <span>Close</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div
                className={cn(
                    "flex-1 overflow-hidden relative bg-[#111] flex items-center justify-center",
                    scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                )}
                onWheel={handleWheel}
                onMouseDown={handleImageMouseDown}
            >
                <img
                    src={uploadedImage}
                    alt="Ref"
                    draggable={false}
                    className="max-w-full max-h-full object-contain transition-transform duration-75"
                    style={{
                        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`
                    }}
                />

                {/* Scale Indicator */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white/50 pointer-events-none">
                    {Math.round(scale * 100)}%
                </div>
            </div>
        </div>
    )
}
