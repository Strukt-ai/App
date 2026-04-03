'use client'

import Image from 'next/image'
import { Box, Compass, MousePointer2, Sparkles, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type WalkthroughModalProps = {
    open: boolean
    onClose: () => void
}

const featureCards = [
    {
        icon: Upload,
        title: 'Reference Intake',
        body: 'Load a floorplan image, calibrate the scale, and keep the traced geometry synced with the source.',
    },
    {
        icon: MousePointer2,
        title: 'Dock Rails',
        body: 'Hover the left or right dock to expand controls. Click back into the editor to collapse both rails and recover full canvas space.',
    },
    {
        icon: Compass,
        title: 'Editor Stage',
        body: 'Use the center stage for 2D tracing, Blueprint3D editing, and unified GLB preview without losing viewport space to static sidebars.',
    },
    {
        icon: Box,
        title: '3D Preview',
        body: 'Switch between live 3D, the reference test GLB, and the generated floorplan GLB from the right dock preview controls.',
    },
    {
        icon: Sparkles,
        title: 'AI Tools',
        body: 'Run room detection, Furn AI extraction, texture generation, and export flows without leaving the editor shell.',
    },
]

export function EditorWalkthroughModal({ open, onClose }: WalkthroughModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-md">
            <button
                type="button"
                className="absolute inset-0"
                aria-label="Close walkthrough"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] shadow-[0_40px_120px_rgba(2,6,23,0.7)]">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                            <Image src="/logo.png" alt="Strukt AI" width={28} height={28} className="h-7 w-7 object-contain" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-100/80">Editor Walkthrough</p>
                            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Editor map</h2>
                            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
                                This is the stable layout map for the editor. The center stage stays primary, while rails and processing tools stay available without taking permanent screen width.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                        aria-label="Close walkthrough"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-3">
                    {featureCards.map(({ icon: Icon, title, body }) => (
                        <article
                            key={title}
                            className={cn(
                                "rounded-[24px] border border-white/10 bg-slate-950/58 p-5",
                                "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                            )}
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    )
}
