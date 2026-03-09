'use client'


import { X, Crown, Play } from 'lucide-react'


interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Modal Container */}
            <div
                className="relative w-[600px] bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                style={{
                    boxShadow: '0 0 40px -10px rgba(124, 58, 237, 0.2), 0 0 20px -10px rgba(124, 58, 237, 0.1)'
                }}
            >
                {/* Background Glow Effects */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 flex flex-col items-center text-center relative z-0">

                    {/* Video Placeholder */}
                    <div className="w-full aspect-video bg-black/40 rounded-xl border border-white/5 mb-8 flex items-center justify-center group cursor-pointer relative overflow-hidden">

                        {/* Fake Video Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                        {/* Play Button */}
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>

                        {/* Progress Bar (Fake) */}
                        <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-white/80 rounded-full" />
                        </div>
                    </div>

                    {/* Gradient Text */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI Reconstruction</span>
                    </h2>

                    <p className="text-white/60 mb-8 max-w-sm text-sm leading-relaxed">
                        Transform your 2D sketches into stunning 3D models instantly.
                        Get access to advanced furniture recognition and high-quality renders.
                    </p>

                    {/* Upgrade Button */}
                    <button className="w-full max-w-xs group relative overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-3 text-sm font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900">
                            <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                            Upgrade to Premium
                        </span>

                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>

                    <button
                        onClick={onClose}
                        className="mt-4 text-xs text-white/30 hover:text-white/50 transition-colors"
                    >
                        Dismiss
                    </button>

                </div>
            </div>
        </div>
    )
}
