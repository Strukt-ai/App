'use client'

import {
    RotateCw, Maximize2, Trash2, Copy, Lock, Unlock,
    ArrowLeftRight, Box, Tag
} from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

export function ContextToolbar() {
    const {
        selectedId, walls, furniture, rooms,
        deleteObject, setActiveTool, activeTool,
        updateFurniture, copyObject, pasteObject,
        mode
    } = useFloorplanStore()

    const selectedWall = useMemo(() => walls.find(w => w.id === selectedId), [walls, selectedId])
    const selectedFurn = useMemo(() => furniture.find(f => f.id === selectedId), [furniture, selectedId])
    const selectedRoom = useMemo(() => rooms.find(r => r.id === selectedId), [rooms, selectedId])

    // Only show in 2D when something is selected
    if (!selectedId || mode === '3d') return null
    if (!selectedWall && !selectedFurn && !selectedRoom) return null

    const isDoorWindow = selectedFurn && (selectedFurn.type === 'door' || selectedFurn.type === 'window')
    const selectedType = selectedWall ? 'Wall' : selectedRoom ? selectedRoom.name || 'Room' : selectedFurn?.label || selectedFurn?.type || 'Object'

    const actions = [
        // Rotate (furniture only)
        ...(selectedFurn ? [{
            id: 'rotate',
            icon: RotateCw,
            label: 'Rotate 90°',
            shortcut: 'R',
            action: () => {
                const current = selectedFurn.rotation?.y || 0
                updateFurniture(selectedId, { rotation: { ...selectedFurn.rotation, y: current + Math.PI / 2 } })
            },
        }] : []),
        // Resize
        {
            id: 'resize',
            icon: Maximize2,
            label: 'Resize',
            shortcut: 'S',
            action: () => setActiveTool('resize'),
            isActive: activeTool === 'resize',
        },
        // Swap door/window
        ...(isDoorWindow ? [{
            id: 'swap',
            icon: ArrowLeftRight,
            label: `Swap to ${selectedFurn.type === 'door' ? 'Window' : 'Door'}`,
            shortcut: '',
            action: () => updateFurniture(selectedId, { type: selectedFurn.type === 'door' ? 'window' : 'door' }),
        }] : []),
        // Join walls (wall only)
        ...(selectedWall ? [{
            id: 'join',
            icon: Box,
            label: 'Join Walls',
            shortcut: '',
            action: () => useFloorplanStore.getState().setJoinMode(true),
        }] : []),
        // Label
        ...(selectedFurn ? [{
            id: 'label',
            icon: Tag,
            label: 'Label',
            shortcut: 'L',
            action: () => setActiveTool('label'),
            isActive: activeTool === 'label',
        }] : []),
        // Duplicate
        {
            id: 'duplicate',
            icon: Copy,
            label: 'Duplicate',
            shortcut: 'Ctrl+D',
            action: () => { copyObject(); pasteObject() },
        },
        // Delete
        {
            id: 'delete',
            icon: Trash2,
            label: 'Delete',
            shortcut: 'Del',
            action: () => deleteObject(selectedId),
            danger: true,
        },
    ]

    return (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
                {/* Selection indicator */}
                <span className="text-[10px] text-white/50 font-medium mr-2 whitespace-nowrap">
                    {selectedType}
                </span>
                <div className="w-px h-5 bg-white/10 mr-1" />

                {actions.map((act) => (
                    <button
                        key={act.id}
                        onClick={act.action}
                        className={cn(
                            "relative group flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150",
                            act.isActive
                                ? "bg-white/15 text-blue-400"
                                : act.danger
                                    ? "text-white/40 hover:text-red-400 hover:bg-red-500/10"
                                    : "text-white/40 hover:text-white hover:bg-white/8"
                        )}
                    >
                        <act.icon className="w-3.5 h-3.5" />
                        {/* Tooltip */}
                        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
                            <div className="bg-[#111] text-white text-[9px] font-medium px-2 py-1 rounded-lg border border-white/10 shadow-lg flex items-center gap-1.5">
                                {act.label}
                                {act.shortcut && (
                                    <kbd className="text-[8px] text-white/40 bg-white/5 px-1 py-0.5 rounded">{act.shortcut}</kbd>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
