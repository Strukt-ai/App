'use client'

import { useState } from 'react'
import { Send, Ruler, X } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'

/**
 * Floating calibration panel — appears in the center of the canvas when the
 * Ruler tool is active, so users don't have to look at the left sidebar.
 */
export function CalibrationPanel() {
    const { activeTool, selectedId, walls, calibrate, setActiveTool, currentRunId } = useFloorplanStore()
    const [realLen, setRealLen] = useState('')

    const selectedWall = walls.find(w => w.id === selectedId)

    if (activeTool !== 'ruler') return null

    const onCalibrate = async () => {
        if (!selectedWall || !realLen) return
        const val = parseFloat(realLen)
        if (isNaN(val) || val <= 0) {
            alert('Please enter a valid length in millimeters')
            return
        }
        calibrate(selectedWall.id, val / 1000)

        try {
            if (currentRunId) {
                const store = useFloorplanStore.getState()
                const scale = store.exportScale || store.calibrationFactor
                await fetch(`/api/runs/${currentRunId}/meta`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.token || ''}` },
                    body: JSON.stringify({
                        scale,
                        calibration_mm: val,
                        calibration_wall_id: selectedWall.id,
                    }),
                })
            }
        } catch (e) {
            console.error('Failed to persist calibration meta', e)
        }

        setRealLen('')
        setActiveTool('none')
    }

    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[min(380px,88vw)]">
            <div className="rounded-2xl border border-yellow-500/30 bg-[#0d0d14]/95 backdrop-blur-xl shadow-2xl"
                style={{ boxShadow: '0 0 32px 0 rgba(234,179,8,0.15), 0 16px 32px rgba(0,0,0,0.5)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center">
                            <Ruler className="w-3.5 h-3.5 text-yellow-400" />
                        </div>
                        <span className="text-xs font-semibold text-white/90">Calibrate Scale</span>
                    </div>
                    <button
                        onClick={() => setActiveTool('none')}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                        title="Exit calibration"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-4 py-3">
                    {selectedWall ? (
                        <div className="space-y-2.5">
                            <p className="text-[11px] text-yellow-400/80">
                                Wall selected — enter its real-world length:
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Length in mm (e.g. 3500)"
                                    value={realLen}
                                    onChange={(e) => setRealLen(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onCalibrate() }}
                                    className={cn(
                                        'flex-1 bg-[#1a1a26] border border-white/12 rounded-xl px-3 py-2 text-sm text-white',
                                        'placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-yellow-500/50',
                                    )}
                                    autoFocus
                                />
                                <button
                                    onClick={onCalibrate}
                                    disabled={!realLen}
                                    className={cn(
                                        'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                                        'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-900/30',
                                        !realLen && 'opacity-40 cursor-not-allowed',
                                    )}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Set
                                </button>
                            </div>
                            <p className="text-[10px] text-white/30">
                                Tip: measure in millimeters. e.g. a 3.5 m wall = 3500 mm
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-3">
                            <p className="text-[11px] text-white/50">
                                Click any wall on the canvas to select it, then enter its real-world length.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
