'use client'

import { useState } from 'react'
import { X, Sparkles, Wand2, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabMode = 'texture' | 'pbr'

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
    const [tileWidthFt, setTileWidthFt] = useState('')
    const [tileHeightFt, setTileHeightFt] = useState('')
    const [isApplying, setIsApplying] = useState(false)

    if (!isOpen) return null

    const w = parseFloat(tileWidthFt)
    const h = parseFloat(tileHeightFt)
    const validDims = Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0

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

                    {/* Shared tile dimensions */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block">Tile Width (ft)</label>
                            <input
                                type="number"
                                value={tileWidthFt}
                                onChange={(e) => setTileWidthFt(e.target.value)}
                                placeholder="e.g. 1"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block">Tile Height (ft)</label>
                            <input
                                type="number"
                                value={tileHeightFt}
                                onChange={(e) => setTileHeightFt(e.target.value)}
                                placeholder="e.g. 1"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                            />
                        </div>
                    </div>
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
                                alert('Tile Width and Height must be positive numbers (feet).')
                                return
                            }
                            try {
                                setIsApplying(true)
                                if (tab === 'texture') {
                                    if (!file) { alert('Please upload a texture image.'); return }
                                    await onApply(file, w, h)
                                } else {
                                    if (!pbrFile) { alert('Please upload a PBR texture.'); return }
                                    await onApplyPbr(pbrFile, w, h)
                                }
                                onClose()
                                setFile(null)
                                setPbrFile(null)
                                setTileWidthFt('')
                                setTileHeightFt('')
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
