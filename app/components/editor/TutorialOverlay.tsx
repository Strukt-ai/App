'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import { ArrowLeft, ArrowRight, Ruler, Hammer, Layers, Upload, Play, Box, ChevronDown, ChevronUp, X, Minimize2 } from 'lucide-react'

const STEP_ORDER = ['upload', 'process', 'calibration', 'correction', 'rooms', 'floor_review'] as const

export function TutorialOverlay() {
    const tutorialStep = useFloorplanStore(s => s.tutorialStep)
    const tutorialMinimized = useFloorplanStore(s => s.tutorialMinimized)
    const setTutorialMinimized = useFloorplanStore(s => s.setTutorialMinimized)
    const completeTutorial = useFloorplanStore(s => s.completeTutorial)
    const triggerDetectRooms = useFloorplanStore(s => s.triggerDetectRooms)

    if (tutorialStep === 'none') return null

    const currentIdx = STEP_ORDER.indexOf(tutorialStep as any)
    const totalSteps = STEP_ORDER.length
    const progress = currentIdx >= 0 ? ((currentIdx + 1) / totalSteps) * 100 : 0

    // Minimized pill
    if (tutorialMinimized) {
        return (
            <button
                onClick={() => setTutorialMinimized(false)}
                className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-[#111]/90 border border-purple-500/40 rounded-full shadow-xl backdrop-blur-md hover:border-purple-500/70 transition-all group animate-in fade-in duration-200"
            >
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-medium text-white/80 group-hover:text-white">
                    Step {currentIdx + 1}/{totalSteps}
                </span>
                <ChevronDown className="w-3 h-3 text-white/50" />
            </button>
        )
    }

    // Card header with minimize + skip
    const CardHeader = ({ color, stepNum }: { color: 'emerald' | 'cyan' | 'yellow' | 'blue' | 'purple' | 'green'; stepNum: number }) => {
        const textColors = {
            emerald: 'text-emerald-400/70',
            cyan: 'text-cyan-400/70',
            yellow: 'text-yellow-400/70',
            blue: 'text-blue-400/70',
            purple: 'text-purple-400/70',
            green: 'text-green-400/70'
        }
        const bgColors = {
            emerald: 'bg-emerald-500',
            cyan: 'bg-cyan-500',
            yellow: 'bg-yellow-500',
            blue: 'bg-blue-500',
            purple: 'bg-purple-500',
            green: 'bg-green-500'
        }
        return (
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${textColors[color]}`}>
                        Step {stepNum} of {totalSteps}
                    </span>
                    {/* Progress dots */}
                    <div className="flex gap-1">
                        {STEP_ORDER.map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= currentIdx ? bgColors[color] : 'bg-white/10'}`}
                            />
                        ))}
                    </div>
                </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setTutorialMinimized(true)}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white/70 transition-colors"
                    title="Minimize"
                >
                    <Minimize2 className="w-3 h-3" />
                </button>
                <button
                    onClick={completeTutorial}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white/70 transition-colors"
                    title="Skip tutorial"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
        )
    }

    return (
        <div className="absolute top-4 right-4 z-50 pointer-events-none flex flex-col items-end space-y-4 max-w-[90vw] sm:max-w-sm">

            {/* Upload Step */}
            {tutorialStep === 'upload' && (
                <div className="bg-[#111]/90 border border-emerald-500/50 p-5 rounded-2xl shadow-2xl text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <CardHeader color="emerald" stepNum={1} />
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                        <Upload className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Upload Your Floorplan</h2>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                        Click the <span className="text-white/90 font-semibold">&quot;Load&quot;</span> button in the top bar to upload your floorplan image.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                        <ArrowRight className="w-3 h-3 animate-pulse" />
                        Look for <span className="text-emerald-400/80 font-semibold">Load</span> button in the top-right
                    </div>
                </div>
            )}

            {/* Process Step */}
            {tutorialStep === 'process' && (
                <div className="bg-[#111]/90 border border-cyan-500/50 p-5 rounded-2xl shadow-2xl text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <CardHeader color="cyan" stepNum={2} />
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-500/30">
                        <Play className="w-6 h-6 text-cyan-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Process Your Image</h2>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                        Click <span className="text-white/90 font-semibold">&quot;Process Floorplan&quot;</span> to start the AI analysis.
                        <br /><br />
                        The AI will detect walls, doors, and other elements automatically.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                        <ArrowRight className="w-3 h-3 animate-pulse" />
                        Click the green <span className="text-green-400/80 font-semibold">Process Floorplan</span> button
                    </div>
                </div>
            )}

            {/* Calibration Step */}
            {tutorialStep === 'calibration' && (
                <div className="bg-[#111]/90 border border-yellow-500/50 p-5 rounded-2xl shadow-2xl text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <CardHeader color="yellow" stepNum={3} />
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-500/30">
                        <Ruler className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Calibrate Scale</h2>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                        Select the <span className="text-white/90 font-semibold">Ruler Tool</span>, click a wall, and enter the real length.
                        <br /><br />
                        After calibration, editing tools will unlock.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                        <ArrowLeft className="w-3 h-3" />
                        Look for <span className="text-white/80">Ruler Tool</span> in the left panel
                    </div>
                </div>
            )}

            {/* Correction Step */}
            {tutorialStep === 'correction' && (
                <div className="bg-[#111]/90 border border-blue-500/50 p-5 rounded-2xl shadow-2xl text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <CardHeader color="blue" stepNum={4} />
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                        <Hammer className="w-6 h-6 text-blue-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Fix Layout</h2>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                        The AI might have missed some details.
                        <br /><br />
                        Use the tools to add missing walls or fix doors.
                        Once ready, click below to find rooms.
                    </p>
                    <button
                        onClick={() => triggerDetectRooms()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-lg shadow-purple-900/20 w-full text-sm"
                    >
                        Find Rooms (Postprocess + OCR)
                    </button>
                </div>
            )}

            {/* Rooms Step */}
            {tutorialStep === 'rooms' && (
                <div className="bg-[#111]/90 border border-purple-500/50 p-5 rounded-2xl shadow-2xl text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <CardHeader color="purple" stepNum={5} />
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                        <Layers className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Find Rooms</h2>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                        This will postprocess your current SVG, compare it with the image, and run OCR to detect room labels.
                    </p>
                    <button
                        onClick={() => triggerDetectRooms()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-lg shadow-purple-900/20 w-full text-sm"
                    >
                        Find Rooms (Postprocess + OCR)
                    </button>
                </div>
            )}

            {/* Floor Review Step */}
            {tutorialStep === 'floor_review' && (
                <div className="bg-[#111]/90 border border-green-500/50 p-5 rounded-2xl shadow-2xl text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <CardHeader color="green" stepNum={6} />
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30">
                        <Box className="w-6 h-6 text-green-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Generate 3D!</h2>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                        The floor geometry is ready.
                        <br /><br />
                        Click <span className="text-white/90 font-semibold">&quot;3D View&quot;</span> in the top bar to generate your 3D model.
                    </p>
                    <button
                        onClick={completeTutorial}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-lg shadow-green-900/20 w-full text-sm"
                    >
                        Unlock 3D Generation
                    </button>
                </div>
            )}
        </div>
    )
}
