'use client'

import { Html } from '@react-three/drei'
import { useFloorplanStore } from '@/store/floorplanStore'
import { Trash2, Tag } from 'lucide-react'
import { useState, useEffect } from 'react'

export function FloatingMenu() {
    const { selectedId, walls, furniture, deleteObject, updateLabel, mode } = useFloorplanStore()
    const [label, setLabel] = useState('')

    const selectedWall = walls.find(w => w.id === selectedId)
    const selectedFurn = furniture.find(f => f.id === selectedId)
    const target = selectedWall || selectedFurn

    useEffect(() => {
        if (target) {
            setLabel(target.label || '')
        }
    }, [selectedId, target])

    if (mode !== '2d' || !target) return null

    // Calculate center point
    let pos: [number, number, number] = [0, 0, 0]
    if (selectedWall) {
        pos = [
            (selectedWall.start.x + selectedWall.end.x) / 2,
            0.1, // Slightly above ground
            (selectedWall.start.y + selectedWall.end.y) / 2
        ]
    } else if (selectedFurn) {
        pos = [selectedFurn.position.x, 0.5, selectedFurn.position.z]
    }

    const onLabelChange = (val: string) => {
        setLabel(val)
        if (selectedId) updateLabel(selectedId, val)
    }

    return (
        <Html position={pos} center distanceFactor={15}>
            <div className="bg-[#111]/95 backdrop-blur-sm border border-[#2a2a2a] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.45)] p-3 flex flex-col gap-3 min-w-[200px] select-none">
                <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Tag className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="leading-tight">
                            <div className="text-[11px] font-semibold text-foreground">
                                {selectedWall ? 'Wall' : 'Object'}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
                                Quick edit
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-[0.18em]">
                        2D
                    </span>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 px-1 uppercase tracking-[0.12em]">
                        Label
                    </label>
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => onLabelChange(e.target.value)}
                        placeholder="e.g. Living Room"
                        className="w-full bg-[#0b0b0b] border border-[#2f2f2f] focus:border-primary/70 focus:ring-2 focus:ring-primary/30 rounded-xl px-3 py-2 text-sm text-white transition-all outline-none shadow-inner shadow-black/30"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        onClick={() => deleteObject(selectedId!)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 rounded-xl py-2 text-[11px] font-semibold transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
            </div>
        </Html>
    )
}
