'use client'


import { Sparkles, X } from 'lucide-react'

interface FloatingUpgradeCardProps {
    onUpgrade: () => void
    onClose: () => void
}

export function FloatingUpgradeCard({ onUpgrade, onClose }: FloatingUpgradeCardProps) {
    return (
        <div className="absolute bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-[#121217] border border-white/5 rounded-2xl p-4 shadow-2xl w-[280px] backdrop-blur-md relative group">

                {/* Close Button - appears on hover */}
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:text-white p-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                >
                    <X className="w-3 h-3" />
                </button>

                {/* Header with Icon */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-white tracking-wide">FurnAI</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">
                    Turn your reference images to 3D.
                </p>

                {/* Upgrade Button */}
                <button
                    onClick={onUpgrade}
                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] hover:opacity-90 transition-opacity text-xs font-semibold text-white shadow-lg shadow-purple-900/20"
                >
                    Upgrade
                </button>
            </div>
        </div>
    )
}
