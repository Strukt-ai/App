'use client'

import { useState } from 'react'
import { X, Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TexturizeModalProps {
    isOpen: boolean
    onClose: () => void
    targetName: string
    onApply: (file: File, tileWidthFt: number, tileHeightFt: number) => Promise<void>
}

export function TexturizeModal({ isOpen, onClose, targetName, onApply }: TexturizeModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [tileWidthFt, setTileWidthFt] = useState('')
    const [tileHeightFt, setTileHeightFt] = useState('')
    const [isApplying, setIsApplying] = useState(false)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[450px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-pink-500/10 to-transparent">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <h2 className="text-sm font-semibold text-white tracking-wide">Texturize AI <span className="text-white/30 font-normal">| {targetName}</span></h2>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-4">
                        <label className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block">Upload Texture Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const f = e.target.files?.[0] || null
                                setFile(f)
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white/80 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                        />
                    </div>

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
                            const w = parseFloat(tileWidthFt)
                            const h = parseFloat(tileHeightFt)
                            if (!file) {
                                console.error('[TexturizeModal] missing file')
                                alert('Please upload a texture image.')
                                return
                            }
                            if (!Number.isFinite(w) || w <= 0) {
                                console.error('[TexturizeModal] invalid tile width', tileWidthFt)
                                alert('Tile Width must be a positive number (feet).')
                                return
                            }
                            if (!Number.isFinite(h) || h <= 0) {
                                console.error('[TexturizeModal] invalid tile height', tileHeightFt)
                                alert('Tile Height must be a positive number (feet).')
                                return
                            }

                            try {
                                setIsApplying(true)
                                await onApply(file, w, h)
                                onClose()
                                setFile(null)
                                setTileWidthFt('')
                                setTileHeightFt('')
                            } finally {
                                setIsApplying(false)
                            }
                        }}
                        disabled={isApplying || !file || !tileWidthFt.trim() || !tileHeightFt.trim()}
                        className={cn(
                            "px-6 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-lg flex items-center gap-2",
                            !isApplying && file && tileWidthFt.trim() && tileHeightFt.trim()
                                ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 shadow-pink-900/20"
                                : "bg-white/10 text-white/30 cursor-not-allowed"
                        )}
                    >
                        <Wand2 className="w-3 h-3" />
                        {isApplying ? 'Applying...' : 'Apply Texture'}
                    </button>
                </div>
            </div>
        </div>
    )
}
