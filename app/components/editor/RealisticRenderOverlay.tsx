'use client'

import React, { useState } from 'react'
import { ChevronLeft, Maximize, Settings2 } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { RenderPaymentModal } from './RenderPaymentModal'
import { cn } from '@/lib/utils'

export function RealisticRenderOverlay() {
    const isRealisticRenderActive = useFloorplanStore(s => s.isRealisticRenderActive)
    const setRealisticRenderActive = useFloorplanStore(s => s.setRealisticRenderActive)
    const setRenderMaximized = useFloorplanStore(s => s.setRenderMaximized)
    const isRenderMaximized = useFloorplanStore(s => s.isRenderMaximized)
    const [aspectRatio, setAspectRatio] = useState('16:9')
    const [resolution, setResolution] = useState('Full HD 1920x1080')
    const [resolutionDropdownOpen, setResolutionDropdownOpen] = useState(false)
    const [paymentModalOpen, setPaymentModalOpen] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const toggleFullscreen = () => {
        const editorArea = document.getElementById('editor-main-area') || document.documentElement;
        if (!document.fullscreenElement) {
            editorArea.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
            setRenderMaximized(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
            setRenderMaximized(false);
        }
    }

    if (!isRealisticRenderActive) return null

    return (
        <div className="absolute inset-0 z-[150] pointer-events-none flex flex-col justify-between overflow-hidden">
            
            {/* Top Bar (Interactive) */}
            <div className="h-14 bg-[#1e1e1f]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 pointer-events-auto">
                
                {/* Left Side: Back */}
                <button 
                    onClick={() => {
                        setRealisticRenderActive(false)
                        setRenderMaximized(false)
                        if (document.fullscreenElement && document.exitFullscreen) {
                            document.exitFullscreen().catch(() => {});
                        }
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>

                {/* Center: Aspect Ratios */}
                <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/5 gap-1">
                    {['16:9', '4:3', '1:1'].map((ratio) => (
                        <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-semibold transition-colors",
                                aspectRatio === ratio ? "bg-white text-black" : "text-zinc-400 hover:text-zinc-200"
                            )}
                        >
                            {ratio}
                        </button>
                    ))}
                    <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
                    <button 
                        onClick={toggleFullscreen}
                        className={cn("px-2 hover:text-white transition-colors", isFullscreen ? "text-white" : "text-zinc-400")}
                        title="Toggle Fullscreen"
                    >
                        <Maximize className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setResolutionDropdownOpen(!resolutionDropdownOpen)}
                            className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 transition-all"
                        >
                            <Settings2 className="w-4 h-4 text-zinc-500" />
                            {resolution}
                        </button>
                        
                        {resolutionDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#0c0d12]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex flex-col p-1.5">
                                    {['HD 1280x720', 'Full HD 1920x1080', '4K 3840x2160', '8K 7680x4320'].map((res) => (
                                        <button
                                            key={res}
                                            onClick={() => {
                                                setResolution(res);
                                                setResolutionDropdownOpen(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-all",
                                                resolution === res ? "bg-blue-600/20 text-blue-400" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                            )}
                                        >
                                            {res}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Render Button */}
                <button 
                    onClick={() => setPaymentModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all"
                >
                    Render
                </button>
            </div>

            {/* Bottom Controls (Interactive) */}
            <div className="p-4 flex justify-end pointer-events-auto">
                <button className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                    Save View
                    <Maximize className="w-4 h-4" />
                </button>
            </div>

            {/* Render Payment Modal */}
            {paymentModalOpen && (
                <div className="pointer-events-auto">
                    <RenderPaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
                </div>
            )}
        </div>
    )
}
