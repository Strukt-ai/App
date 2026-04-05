'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import {
    Upload, Play, Ruler, Hammer, Layers, Box,
    ArrowUp, ArrowDown, ChevronRight, X, Minimize2, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = ['upload', 'process', 'calibration', 'correction', 'rooms', 'floor_review'] as const
type Step = typeof STEPS[number]

interface StepConfig {
    index: number          // 1-based
    color: string          // tailwind accent
    glow: string           // box-shadow glow
    border: string
    iconBg: string
    iconColor: string
    dotActive: string
    icon: React.ReactNode
    title: string
    body: string
    arrow: 'up' | 'down' | null   // which direction to pulse the arrow
    arrowLabel: string             // tiny label next to the arrow
}

const STEP_CONFIG: Record<Step, StepConfig> = {
    upload: {
        index: 1,
        color: 'emerald',
        glow: '0 0 32px 0 rgba(16,185,129,0.18)',
        border: 'border-emerald-500/40',
        iconBg: 'bg-emerald-500/15',
        iconColor: 'text-emerald-400',
        dotActive: 'bg-emerald-500',
        icon: <Upload className="w-5 h-5" />,
        title: 'Upload your floorplan',
        body: 'Hit the Load button in the top-right corner to upload a floorplan image.',
        arrow: 'up',
        arrowLabel: 'Load button → top right',
    },
    process: {
        index: 2,
        color: 'cyan',
        glow: '0 0 32px 0 rgba(6,182,212,0.18)',
        border: 'border-cyan-500/40',
        iconBg: 'bg-cyan-500/15',
        iconColor: 'text-cyan-400',
        dotActive: 'bg-cyan-500',
        icon: <Play className="w-5 h-5" />,
        title: 'Process the image',
        body: 'Click Process Floorplan. The AI will detect walls, doors, and windows.',
        arrow: 'up',
        arrowLabel: 'Process Floorplan → top bar',
    },
    calibration: {
        index: 3,
        color: 'yellow',
        glow: '0 0 32px 0 rgba(234,179,8,0.18)',
        border: 'border-yellow-500/40',
        iconBg: 'bg-yellow-500/15',
        iconColor: 'text-yellow-400',
        dotActive: 'bg-yellow-500',
        icon: <Ruler className="w-5 h-5" />,
        title: 'Calibrate the scale',
        body: 'Pick the Ruler tool (C), click any wall, then type its real-world length.',
        arrow: 'down',
        arrowLabel: 'Ruler tool → toolbar below',
    },
    correction: {
        index: 4,
        color: 'blue',
        glow: '0 0 32px 0 rgba(59,130,246,0.18)',
        border: 'border-blue-500/40',
        iconBg: 'bg-blue-500/15',
        iconColor: 'text-blue-400',
        dotActive: 'bg-blue-500',
        icon: <Hammer className="w-5 h-5" />,
        title: 'Fix the layout',
        body: 'Add missing walls or doors using the toolbar. When it looks right, find rooms.',
        arrow: 'down',
        arrowLabel: 'Drawing tools → toolbar below',
    },
    rooms: {
        index: 5,
        color: 'purple',
        glow: '0 0 32px 0 rgba(168,85,247,0.18)',
        border: 'border-purple-500/40',
        iconBg: 'bg-purple-500/15',
        iconColor: 'text-purple-400',
        dotActive: 'bg-purple-500',
        icon: <Layers className="w-5 h-5" />,
        title: 'Detect rooms',
        body: 'Run room detection so the AI labels each space before 3D generation.',
        arrow: null,
        arrowLabel: '',
    },
    floor_review: {
        index: 6,
        color: 'green',
        glow: '0 0 32px 0 rgba(34,197,94,0.18)',
        border: 'border-green-500/40',
        iconBg: 'bg-green-500/15',
        iconColor: 'text-green-400',
        dotActive: 'bg-green-500',
        icon: <Box className="w-5 h-5" />,
        title: 'Generate 3D!',
        body: 'Your floorplan is ready. Click 3D View in the top bar to build the model.',
        arrow: 'up',
        arrowLabel: '3D View → top bar',
    },
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
                            ? cn('w-1.5 h-1.5', dotActive, 'opacity-60')
                            : i === current
                                ? cn('w-2.5 h-2', dotActive)
                                : 'w-1.5 h-1.5 bg-white/15',
                    )}
                />
            ))}
        </div>
    )
}

// ─── Animated arrow beacon ────────────────────────────────────────────────────

function ArrowBeacon({ direction, label, colorClass }: { direction: 'up' | 'down'; label: string; colorClass: string }) {
    const Icon = direction === 'up' ? ArrowUp : ArrowDown
    return (
        <div className="flex flex-col items-center gap-0.5">
            <div className={cn('flex items-center gap-1 text-[10px] font-medium opacity-60', colorClass)}>
                {label}
            </div>
            <Icon className={cn('w-4 h-4 animate-bounce', colorClass)} />
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TutorialOverlay() {
    const tutorialStep    = useFloorplanStore(s => s.tutorialStep)
    const tutorialMinimized = useFloorplanStore(s => s.tutorialMinimized)
    const setTutorialMinimized = useFloorplanStore(s => s.setTutorialMinimized)
    const completeTutorial = useFloorplanStore(s => s.completeTutorial)
    const triggerDetectRooms = useFloorplanStore(s => s.triggerDetectRooms)

    if (tutorialStep === 'none') return null

    const step = tutorialStep as Step
    const cfg  = STEP_CONFIG[step]
    const idx  = STEPS.indexOf(step)      // 0-based
    const progress = ((idx + 1) / STEPS.length) * 100

    // ── Minimized pill (bottom-center) ────────────────────────────────────────
    if (tutorialMinimized) {
        return (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                <button
                    onClick={() => setTutorialMinimized(false)}
                    className={cn(
                        'flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-md',
                        'bg-[#0d0d14]/90 shadow-xl transition-all hover:brightness-110',
                        cfg.border,
                    )}
                    style={{ boxShadow: cfg.glow }}
                >
                    <div className={cn('w-2 h-2 rounded-full animate-pulse', cfg.dotActive)} />
                    <span className="text-xs font-medium text-white/80">
                        Step {cfg.index} of {STEPS.length} — {cfg.title}
                    </span>
                    <ChevronUp className="w-3 h-3 text-white/40" />
                </button>
            </div>
        )
    }

    // ── Action buttons for specific steps ─────────────────────────────────────
    const actionButton = (step === 'correction' || step === 'rooms') ? (
        <button
            onClick={() => triggerDetectRooms()}
            className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all',
                'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 shrink-0',
            )}
        >
            <Layers className="w-4 h-4" />
            Find Rooms
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
    ) : step === 'floor_review' ? (
        <button
            onClick={completeTutorial}
            className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all',
                'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/30 shrink-0',
            )}
        >
            <Box className="w-4 h-4" />
            Got it!
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
    ) : null

    // ── Full HUD bar ──────────────────────────────────────────────────────────
    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[min(560px,90vw)]">

            {/* Arrow beacon above card (points up) */}
            {cfg.arrow === 'up' && (
                <div className="flex justify-center mb-2">
                    <ArrowBeacon direction="up" label={cfg.arrowLabel} colorClass={cfg.iconColor} />
                </div>
            )}

            {/* Main card */}
            <div
                className={cn(
                    'relative flex flex-col gap-0 rounded-2xl border backdrop-blur-xl overflow-hidden',
                    'bg-[#0d0d14]/95 shadow-2xl animate-in slide-in-from-bottom-4 duration-300',
                    cfg.border,
                )}
                style={{ boxShadow: cfg.glow + ', 0 24px 48px rgba(0,0,0,0.5)' }}
            >
                {/* Progress bar */}
                <div className="h-0.5 w-full bg-white/5">
                    <div
                        className={cn('h-full transition-all duration-500', cfg.dotActive)}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Body */}
                <div className="flex items-center gap-4 px-5 py-4">

                    {/* Icon */}
                    <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
                        cfg.iconBg, cfg.border, cfg.iconColor,
                    )}>
                        {cfg.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn('text-[10px] font-mono uppercase tracking-widest opacity-50', cfg.iconColor)}>
                                {cfg.index} / {STEPS.length}
                            </span>
                            <ProgressDots current={idx} dotActive={cfg.dotActive} />
                        </div>
                        <p className="text-sm font-semibold text-white leading-tight truncate">{cfg.title}</p>
                        <p className="text-xs text-white/50 leading-relaxed mt-0.5 line-clamp-2">{cfg.body}</p>
                    </div>

                    {/* Action button */}
                    {actionButton}

                    {/* Controls */}
                    <div className="flex flex-col gap-1 shrink-0">
                        <button
                            onClick={() => setTutorialMinimized(true)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                            title="Minimize"
                        >
                            <Minimize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={completeTutorial}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-red-400 transition-colors"
                            title="Dismiss tutorial"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Arrow beacon below card (points down) */}
            {cfg.arrow === 'down' && (
                <div className="flex justify-center mt-2">
                    <ArrowBeacon direction="down" label={cfg.arrowLabel} colorClass={cfg.iconColor} />
                </div>
            )}
        </div>
    )
}
