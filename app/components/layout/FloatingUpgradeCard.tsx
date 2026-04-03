'use client'


import { Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingUpgradeCardProps {
    onUpgrade: () => void
    onClose: () => void
    className?: string
}

export function FloatingUpgradeCard({ onUpgrade, onClose, className }: FloatingUpgradeCardProps) {
    return (
        <div className={cn("absolute bottom-5 left-5 z-40 hidden animate-in slide-in-from-bottom-5 duration-500 lg:block", className)}>
            <div className="group relative w-[292px] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/78 p-4 shadow-[0_24px_70px_rgba(2,6,23,0.65)] backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_46%)]" />

                {/* Close Button - appears on hover */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full border border-white/10 bg-slate-900/90 p-1 text-slate-400 opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:text-white"
                >
                    <X className="w-3 h-3" />
                </button>

                {/* Header with Icon */}
                <div className="relative mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-300">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200/75">FurnAI</span>
                            <span className="block text-sm font-semibold text-white tracking-tight">AI Object Lift</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="relative mb-4 text-[12px] leading-relaxed text-slate-300">
                    Pull a product or object out of a reference image, generate a 3D asset, and drop it straight into the scene.
                </p>

                {/* Upgrade Button */}
                <button
                    onClick={onUpgrade}
                    className="relative w-full rounded-xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:brightness-110"
                >
                    Upgrade
                </button>
            </div>
        </div>
    )
}
