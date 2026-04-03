'use client'

import { useState } from 'react'
import { X, Sparkles, Wand2, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabMode = 'texture' | 'pbr'
type Unit = 'cm' | 'in' | 'ft'

const UNIT_TO_FEET: Record<Unit, number> = {
    cm: 1 / 30.48,
    in: 1 / 12,
    ft: 1,
}

interface TexturizeModalProps {
    isOpen: boolean
    onClose: () => void
    targetName: string
    onApply: (file: File, tileWidthFt: number, tileHeightFt: number) => Promise<void>
    onApplyPbr: (file: File, tileWidthFt: number, tileHeightFt: number) => Promise<void>
}

export function TexturizeModal({ isOpen, onClose, targetName, onApply, onApplyPbr }: TexturizeModalProps) {
    const [tab, setTab] = useState<TabMode>('texture')
    const [file, setFile] = useState<File | null>(null)
    const [pbrFile, setPbrFile] = useState<File | null>(null)
    const [tileWidth, setTileWidth] = useState('')
    const [tileHeight, setTileHeight] = useState('')
    const [unit, setUnit] = useState<Unit>('cm')
    const [isApplying, setIsApplying] = useState(false)

    if (!isOpen) return null

    const w = parseFloat(tileWidth)
    const h = parseFloat(tileHeight)
    const validDims = Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0

    // Convert to feet for the callback (backend/store expects feet)
    const wFt = validDims ? w * UNIT_TO_FEET[unit] : 0
    const hFt = validDims ? h * UNIT_TO_FEET[unit] : 0
    // Show meters for user reference
    const wM = validDims ? wFt * 0.3048 : 0
    const hM = validDims ? hFt * 0.3048 : 0

    const canApplyTexture = !isApplying && file && validDims
    const canApplyPbr = !isApplying && pbrFile && validDims

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[480px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-pink-500/10 to-transparent">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <h2 className="text-sm font-semibold text-white tracking-wide">Materials <span className="text-white/30 font-normal">| {targetName}</span></h2>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setTab('texture')}
                        className={cn(
                            "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                            tab === 'texture' ? "text-pink-400 border-b-2 border-pink-500 bg-pink-500/5" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        <Wand2 className="w-3 h-3 inline mr-1.5" />Texture
                    </button>
                    <button
                        onClick={() => setTab('pbr')}
                        className={cn(
                            "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                            tab === 'pbr' ? "text-orange-400 border-b-2 border-orange-500 bg-orange-500/5" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        <Layers className="w-3 h-3 inline mr-1.5" />Upload PBR
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {tab === 'texture' && (
                        <div className="mb-4">
                            <label className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block">Upload Texture Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white/80 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                            />
                        </div>
                    )}

                    {tab === 'pbr' && (
                        <div className="mb-4">
                            <label className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block">Upload PBR Material (ZIP)</label>
                            <input
                                type="file"
                                accept=".zip,application/zip,application/x-zip-compressed"
                                onChange={(e) => setPbrFile(e.target.files?.[0] || null)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white/80 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                            />
                            <p className="text-[10px] text-white/30 mt-2">Upload a ZIP from ambientCG or similar. Maps are auto-detected from filenames (Color, Normal, Roughness, Metallic, AO).</p>
                        </div>
                    )}

                    {/* Unit selector */}
                    <div className="mb-3">
                        <label className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block">Tile Size Unit</label>
                        <div className="flex gap-1">
                            {(['cm', 'in', 'ft'] as Unit[]).map(u => (
                                <button
                                    key={u}
                                    onClick={() => setUnit(u)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                        unit === u
                                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                                            : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                                    )}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tile dimensions */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block">Tile Width ({unit})</label>
                            <input
                                type="number"
                                value={tileWidth}
                                onChange={(e) => setTileWidth(e.target.value)}
                                placeholder={unit === 'cm' ? 'e.g. 60' : unit === 'in' ? 'e.g. 24' : 'e.g. 2'}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block">Tile Height ({unit})</label>
                            <input
                                type="number"
                                value={tileHeight}
                                onChange={(e) => setTileHeight(e.target.value)}
                                placeholder={unit === 'cm' ? 'e.g. 60' : unit === 'in' ? 'e.g. 24' : 'e.g. 2'}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                            />
                        </div>
                    </div>

                    {/* Live preview of actual size */}
                    {validDims && (
                        <div className="mt-2 text-[10px] text-white/30">
                            Tile: {wM.toFixed(2)}m x {hM.toFixed(2)}m ({(wFt).toFixed(2)}ft x {(hFt).toFixed(2)}ft)
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            if (!validDims) {
                                alert('Tile Width and Height must be positive numbers.')
                                return
                            }
                            try {
                                setIsApplying(true)
                                if (tab === 'texture') {
                                    if (!file) { alert('Please upload a texture image.'); return }
                                    await onApply(file, wFt, hFt)
                                } else {
                                    if (!pbrFile) { alert('Please upload a PBR texture.'); return }
                                    await onApplyPbr(pbrFile, wFt, hFt)
                                }
                                onClose()
                                setFile(null)
                                setPbrFile(null)
                                setTileWidth('')
                                setTileHeight('')
                            } finally {
                                setIsApplying(false)
                            }
                        }}
                        disabled={tab === 'texture' ? !canApplyTexture : !canApplyPbr}
                        className={cn(
                            "px-6 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-lg flex items-center gap-2",
                            (tab === 'texture' ? canApplyTexture : canApplyPbr)
                                ? tab === 'pbr'
                                    ? "bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 shadow-orange-900/20"
                                    : "bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 shadow-pink-900/20"
                                : "bg-white/10 text-white/30 cursor-not-allowed"
                        )}
                    >
                        {tab === 'pbr' ? <Layers className="w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                        {isApplying ? 'Applying...' : tab === 'pbr' ? 'Apply PBR' : 'Apply Texture'}
                    </button>
                </div>
            </div>
        </div>
    )
}
