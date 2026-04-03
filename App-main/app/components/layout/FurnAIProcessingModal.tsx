'use client'

import { Sparkles, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FurnAIProcessingModalProps {
    isOpen: boolean
}

export function FurnAIProcessingModal({ isOpen }: FurnAIProcessingModalProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (isOpen) {
            setProgress(0)
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 1, 100))
            }, 480)
            return () => clearInterval(interval)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col items-center text-center p-6">

                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-lg font-bold text-foreground">
                        Strukt AI Processing
                    </span>
                </div>

                {/* Video / Visual */}
                <div className="w-full aspect-video bg-muted rounded-xl mb-6 overflow-hidden relative border border-border group">
                    <video
                        className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
                        autoPlay
                        loop
                        muted
                        playsInline
                        src="/step1.mp4"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                </div>

                {/* Description */}
                <h3 className="text-foreground font-medium mb-2">Analyzing Geometry</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-[90%]">
                    Our AI is converting your floorplan measurements into a 3D environment. This may take a moment.
                </p>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-primary transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing...</span>
                </div>

            </div>
        </div>
    )
}
