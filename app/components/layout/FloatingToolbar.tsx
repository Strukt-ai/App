'use client'

import {
    MousePointer2, Hand, PenTool, DoorOpen, AppWindow,
    Ruler, Tag, Trash2, Undo2, Redo2, Square, Box,
    type LucideIcon
} from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'

type ToolDef = {
    id: string
    icon: LucideIcon
    label: string
    shortcut: string
    action: () => void
    isActive?: boolean
    dividerAfter?: boolean
    danger?: boolean
}

export function FloatingToolbar() {
    const {
        activeTool, setActiveTool, mode, selectedId, deleteObject,
        undo, redo, addFurniture, tutorialStep, triggerDetectRooms, currentRunId
    } = useFloorplanStore()

    // Only show in 2D mode
    if (mode === '3d') return null

    const tools: ToolDef[] = [
        {
            id: 'select',
            icon: MousePointer2,
            label: 'Select',
            shortcut: 'V',
            action: () => setActiveTool('select'),
            isActive: activeTool === 'select',
        },
        {
            id: 'move',
            icon: Hand,
            label: 'Move',
            shortcut: 'M',
            action: () => setActiveTool('move'),
            isActive: activeTool === 'move',
        },
        {
            id: 'wall',
            icon: PenTool,
            label: 'Draw Wall',
            shortcut: 'W',
            action: () => setActiveTool('wall'),
            isActive: activeTool === 'wall',
        },
        {
            id: 'floor',
            icon: Square,
            label: 'Draw Floor',
            shortcut: 'F',
            action: () => setActiveTool('floor'),
            isActive: activeTool === 'floor',
        },
        {
            id: 'door',
            icon: DoorOpen,
            label: 'Add Door',
            shortcut: 'D',
            action: () => { addFurniture('door', { x: 0, y: 0 }); setActiveTool('select') },
        },
        {
            id: 'window',
            icon: AppWindow,
            label: 'Add Window',
            shortcut: 'I',
            action: () => { addFurniture('window', { x: 0, y: 0 }); setActiveTool('select') },
        },
        {
            id: 'ruler',
            icon: Ruler,
            label: 'Calibrate',
            shortcut: 'C',
            action: () => setActiveTool(activeTool === 'ruler' ? 'select' : 'ruler'),
            isActive: activeTool === 'ruler',
        },
        {
            id: 'label',
            icon: Tag,
            label: 'Label',
            shortcut: 'L',
            action: () => setActiveTool('label'),
            isActive: activeTool === 'label',
            dividerAfter: true,
        },
        {
            id: 'find-rooms',
            icon: Box,
            label: 'Find Rooms',
            shortcut: '',
            action: () => triggerDetectRooms(),
            isActive: false,
        },
        {
            id: 'delete',
            icon: Trash2,
            label: 'Delete',
            shortcut: 'Del',
            action: () => { if (selectedId) deleteObject(selectedId) },
            danger: true,
            dividerAfter: true,
        },
        {
            id: 'undo',
            icon: Undo2,
            label: 'Undo',
            shortcut: 'Ctrl+Z',
            action: () => undo(),
        },
        {
            id: 'redo',
            icon: Redo2,
            label: 'Redo',
            shortcut: 'Ctrl+Y',
            action: () => redo(),
        },
    ]

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-0.5 px-2 py-1.5 rounded-2xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
                {tools.map((tool) => (
                    <div key={tool.id} className="flex items-center">
                        <button
                            onClick={tool.action}
                            disabled={
                                (tool.id === 'delete' && !selectedId) ||
                                (tool.id === 'find-rooms' && (!currentRunId || tutorialStep === 'calibration'))
                            }
                            className={cn(
                                "relative group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150",
                                tool.isActive
                                    ? "bg-white/15 text-white shadow-inner"
                                    : tool.danger
                                        ? "text-white/40 hover:text-red-400 hover:bg-red-500/10"
                                        : "text-white/40 hover:text-white hover:bg-white/8",
                                (tool.id === 'delete' && !selectedId) && "opacity-30 cursor-not-allowed",
                                (tool.id === 'find-rooms' && !currentRunId) && "opacity-30 cursor-not-allowed",
                                tutorialStep === 'calibration' && tool.id === 'ruler' && "ring-1 ring-blue-400 animate-pulse"
                            )}
                        >
                            {(() => { const Icon = tool.icon; return <Icon className={cn("w-4 h-4 transition-colors", tool.isActive && "text-blue-400")} /> })()}
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
                                <div className="bg-[#111] text-white text-[10px] font-medium px-2 py-1 rounded-lg border border-white/10 shadow-lg flex items-center gap-1.5">
                                    {tool.label}
                                    {tool.shortcut && (
                                        <kbd className="text-[9px] text-white/40 bg-white/5 px-1 py-0.5 rounded">{tool.shortcut}</kbd>
                                    )}
                                </div>
                            </div>
                        </button>
                        {tool.dividerAfter && (
                            <div className="w-px h-5 bg-white/10 mx-1" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
