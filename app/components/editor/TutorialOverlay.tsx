'use client'

import { useEffect, useRef, useState } from 'react'
import { useFloorplanStore } from '@/store/floorplanStore'
import {
    Upload, Play, Ruler, Hammer, Box,
    ChevronRight, X, Minimize2, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Step definitions ────────────────────────────────────────────────────────

// 'rooms' removed — Find Rooms is a single button in the toolbar, not a step
const STEPS = ['upload', 'process', 'calibration', 'correction', 'floor_review'] as const
type Step = typeof STEPS[number]

interface StepConfig {
    index: number
    color: string
    glow: string
    border: string
    iconBg: string
    iconColor: string
    dotActive: string
    icon: React.ReactNode
    title: string
    body: string
    /** DOM id of the element to highlight with a pointer ring */
    targetId: string | null
}

const STEP_CONFIG: Record<Step, StepConfig> = {
    upload: {
        index: 1,
        color: 'emerald',
        glow: '0 0 28px 0 rgba(16,185,129,0.18)',
        border: 'border-emerald-500/40',
        iconBg: 'bg-emerald-500/15',
        iconColor: 'text-emerald-400',
        dotActive: 'bg-emerald-500',
        icon: <Upload className="w-4 h-4" />,
        title: 'Upload your floorplan',
        body: 'Click the Load button (top-right) to upload a floorplan image.',
        targetId: 'tutorial-load-btn',
    },
    process: {
        index: 2,
        color: 'cyan',
        glow: '0 0 28px 0 rgba(6,182,212,0.18)',
        border: 'border-cyan-500/40',
        iconBg: 'bg-cyan-500/15',
        iconColor: 'text-cyan-400',
        dotActive: 'bg-cyan-500',
        icon: <Play className="w-4 h-4" />,
        title: 'Process the image',
        body: 'Click Process Floorplan. The AI will detect walls, doors, and windows.',
        targetId: 'tutorial-process-btn',
    },
    calibration: {
        index: 3,
        color: 'yellow',
        glow: '0 0 28px 0 rgba(234,179,8,0.18)',
        border: 'border-yellow-500/40',
        iconBg: 'bg-yellow-500/15',
        iconColor: 'text-yellow-400',
        dotActive: 'bg-yellow-500',
        icon: <Ruler className="w-4 h-4" />,
        title: 'Calibrate the scale',
        body: 'Select the Ruler tool (C), click a wall, then enter its real-world length.',
        targetId: 'tutorial-ruler-btn',
    },
    correction: {
        index: 4,
        color: 'blue',
        glow: '0 0 28px 0 rgba(59,130,246,0.18)',
        border: 'border-blue-500/40',
        iconBg: 'bg-blue-500/15',
        iconColor: 'text-blue-400',
        dotActive: 'bg-blue-500',
        icon: <Hammer className="w-4 h-4" />,
        title: 'Fix the layout & find rooms',
        body: 'Add missing walls or doors, then hit Find Rooms to label each space.',
        targetId: 'tutorial-find-rooms-btn',
    },
    floor_review: {
        index: 5,
        color: 'green',
        glow: '0 0 28px 0 rgba(34,197,94,0.18)',
        border: 'border-green-500/40',
        iconBg: 'bg-green-500/15',
        iconColor: 'text-green-400',
        dotActive: 'bg-green-500',
        icon: <Box className="w-4 h-4" />,
        title: 'Generate 3D!',
        body: 'Floorplan ready. Switch to 3D View in the top bar to build the model.',
        targetId: null,
    },
}

// ─── Pointer ring ─────────────────────────────────────────────────────────────

interface RingPos { top: number; left: number; width: number; height: number }

function PointerRing({ targetId, colorClass }: { targetId: string; colorClass: string }) {
    const [pos, setPos] = useState<RingPos | null>(null)
    const rafRef = useRef<number>(0)

    useEffect(() => {
        const measure = () => {
            const el = document.getElementById(targetId)
            if (el) {
                const r = el.getBoundingClientRect()
                setPos({ top: r.top, left: r.left, width: r.width, height: r.height })
            }
            rafRef.current = requestAnimationFrame(measure)
        }
        rafRef.current = requestAnimationFrame(measure)
        return () => cancelAnimationFrame(rafRef.current)
    }, [targetId])

    if (!pos) return null

    const PAD = 6
    return (
        <div
            className="fixed pointer-events-none z-[9998]"
            style={{
                top: pos.top - PAD,
                left: pos.left - PAD,
                width: pos.width + PAD * 2,
                height: pos.height + PAD * 2,
            }}
        >
            {/* Pulsing ring */}
            <div
                className={cn('absolute inset-0 rounded-xl border-2 animate-ping opacity-70', colorClass)}
            />
            {/* Static ring */}
            <div
                className={cn('absolute inset-0 rounded-xl border-2 opacity-80', colorClass)}
            />
        </div>
    )
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ current, dotActive }: { current: number; dotActive: string }) {
    return (
        <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'rounded-full transition-all duration-300',
                        i < current
                            ? cn('w-1.5 h-1.5', dotActive, 'opacity-50')
                            : i === current
                                ? cn('w-2 h-1.5', dotActive)
                                : 'w-1.5 h-1.5 bg-white/15',
                    )}
                />
            ))}
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TutorialOverlay() {
    const tutorialStep      = useFloorplanStore(s => s.tutorialStep)
    const tutorialMinimized = useFloorplanStore(s => s.tutorialMinimized)
    const setTutorialMinimized = useFloorplanStore(s => s.setTutorialMinimized)
    const completeTutorial  = useFloorplanStore(s => s.completeTutorial)
    const triggerDetectRooms = useFloorplanStore(s => s.triggerDetectRooms)

    if (tutorialStep === 'none') return null
    // If backend returns 'rooms' step (legacy), treat it as 'correction'
    const rawStep = tutorialStep === 'rooms' ? 'correction' : tutorialStep
    if (!(rawStep in STEP_CONFIG)) return null

    const step = rawStep as Step
    const cfg  = STEP_CONFIG[step]
    const idx  = STEPS.indexOf(step)
    const progress = ((idx + 1) / STEPS.length) * 100

    // ── Pointer ring color class maps to border color ─────────────────────────
    const borderColor: Record<string, string> = {
        'text-emerald-400': 'border-emerald-400',
        'text-cyan-400':    'border-cyan-400',
        'text-yellow-400':  'border-yellow-400',
        'text-blue-400':    'border-blue-400',
        'text-green-400':   'border-green-400',
    }
    const ringColor = borderColor[cfg.iconColor] ?? 'border-white'

    // ── Minimized pill ────────────────────────────────────────────────────────
    if (tutorialMinimized) {
        return (
            <>
                {cfg.targetId && <PointerRing targetId={cfg.targetId} colorClass={ringColor} />}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button
                        onClick={() => setTutorialMinimized(false)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md',
                            'bg-[#0d0d14]/90 shadow-xl transition-all hover:brightness-110',
                            cfg.border,
                        )}
                        style={{ boxShadow: cfg.glow }}
                    >
                        <div className={cn('w-1.5 h-1.5 rounded-full animate-pulse', cfg.dotActive)} />
                        <span className="text-[11px] font-medium text-white/80">
                            {cfg.index}/{STEPS.length} — {cfg.title}
                        </span>
                        <ChevronUp className="w-3 h-3 text-white/40" />
                    </button>
                </div>
            </>
        )
    }

    // ── Action buttons ────────────────────────────────────────────────────────
    const actionButton = (step === 'correction') ? (
        <button
            onClick={() => triggerDetectRooms()}
            className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shrink-0',
                'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30',
            )}
        >
            Find Rooms
            <ChevronRight className="w-3 h-3 opacity-60" />
        </button>
    ) : step === 'floor_review' ? (
        <button
            onClick={completeTutorial}
            className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shrink-0',
                'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/30',
            )}
        >
            Got it!
            <ChevronRight className="w-3 h-3 opacity-60" />
        </button>
    ) : null

    // ── Full HUD bar ──────────────────────────────────────────────────────────
    return (
        <>
            {/* Pointer ring on target button */}
            {cfg.targetId && <PointerRing targetId={cfg.targetId} colorClass={ringColor} />}

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[min(480px,90vw)]">
                <div
                    className={cn(
                        'relative flex flex-col rounded-xl border backdrop-blur-xl overflow-hidden',
                        'bg-[#0d0d14]/95 shadow-2xl animate-in slide-in-from-bottom-3 duration-300',
                        cfg.border,
                    )}
                    style={{ boxShadow: cfg.glow + ', 0 16px 40px rgba(0,0,0,0.5)' }}
                >
                    {/* Progress bar */}
                    <div className="h-0.5 w-full bg-white/5">
                        <div
                            className={cn('h-full transition-all duration-500', cfg.dotActive)}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Body */}
                    <div className="flex items-center gap-3 px-4 py-3">

                        {/* Icon */}
                        <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                            cfg.iconBg, cfg.border, cfg.iconColor,
                        )}>
                            {cfg.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn('text-[9px] font-mono uppercase tracking-widest opacity-50', cfg.iconColor)}>
                                    {cfg.index} / {STEPS.length}
                                </span>
                                <ProgressDots current={idx} dotActive={cfg.dotActive} />
                            </div>
                            <p className="text-xs font-semibold text-white leading-tight">{cfg.title}</p>
                            <p className="text-[11px] text-white/50 leading-snug mt-0.5">{cfg.body}</p>
                        </div>

                        {/* Action */}
                        {actionButton}

                        {/* Controls */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                                onClick={() => setTutorialMinimized(true)}
                                className="p-1 rounded-lg hover:bg-white/10 text-white/25 hover:text-white/60 transition-colors"
                                title="Minimize"
                            >
                                <Minimize2 className="w-3 h-3" />
                            </button>
                            <button
                                onClick={completeTutorial}
                                className="p-1 rounded-lg hover:bg-white/10 text-white/25 hover:text-red-400 transition-colors"
                                title="Dismiss tutorial"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
