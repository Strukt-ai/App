'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import { ArrowLeft, Ruler, Hammer, Layers } from 'lucide-react'

export function TutorialOverlay() {
    const tutorialStep = useFloorplanStore(s => s.tutorialStep)
    const completeTutorial = useFloorplanStore(s => s.completeTutorial)
    const triggerDetectRooms = useFloorplanStore(s => s.triggerDetectRooms)

    if (tutorialStep === 'none') return null

    return (
        <div className="absolute top-4 right-4 z-50 pointer-events-none flex flex-col items-end space-y-4">
            {/* Calibration Step (manual) */}
            {tutorialStep === 'calibration' && (
                <div className="bg-[#111]/90 border border-yellow-500/50 p-6 rounded-2xl shadow-2xl max-w-sm text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-500/30">
                        <Ruler className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Step 1: Please Calibrate</h2>
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
                <div className="bg-[#111]/90 border border-blue-500/50 p-6 rounded-2xl shadow-2xl max-w-sm text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                        <Hammer className="w-6 h-6 text-blue-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Step 2: Fix Layout</h2>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                        The AI might have missed some details.
                        <br /><br />
                        Use the tools to add missing walls or fix doors.
                        <br />
                        Once you are ready, click below to find rooms.
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
                <div className="bg-[#111]/90 border border-purple-500/50 p-6 rounded-2xl shadow-2xl max-w-sm text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                        <Layers className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Step 3: Find Rooms</h2>
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
                <div className="bg-[#111]/90 border border-green-500/50 p-6 rounded-2xl shadow-2xl max-w-sm text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30">
                        <Layers className="w-6 h-6 text-green-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">Floor Generated!</h2>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                        The floor geometry is ready.
                        <br /><br />
                        You can now generate the full 3D model.
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
