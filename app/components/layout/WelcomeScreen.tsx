'use client'

import { useState } from 'react'
import { ArrowRight, Box, Layers, MousePointer2, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google' // Import GoogleLogin
import { jwtDecode } from 'jwt-decode' // Import decoder
import { useFloorplanStore } from '@/store/floorplanStore' // Import Store
import { TermsModal } from './TermsModal' // Import Modal

interface WelcomeScreenProps {
    onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
    const [isExiting, setIsExiting] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false) // T&C State
    const [showTerms, setShowTerms] = useState(false) // Modal State

    const { setToken, setUser, setProjectsModalOpen } = useFloorplanStore()

    const handleStart = () => {
        setIsExiting(true)
        setTimeout(onStart, 500) // Wait for exit animation
    }

    const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
        if (!termsAccepted) {
            alert("Please accept the Terms and Conditions to proceed.")
            return
        }
        if (credentialResponse.credential) {
            const decoded: any = jwtDecode(credentialResponse.credential)
            setToken(credentialResponse.credential)
            setUser({
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture
            })
            // Open Projects Modal immediately
            setProjectsModalOpen(true)
            handleStart()
        }
    }

    return (
        <div className={cn(
            "fixed inset-0 z-[100] bg-[#0A0A0A] overflow-y-auto transition-opacity duration-500",
            isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-500/10 blur-[120px] rounded-full animate-pulse opacity-50" />
                <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[100px] rounded-full opacity-50" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
            </div>

            <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col items-center text-center min-h-full justify-center py-8 mx-auto">

                {/* Logo / Badge */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono tracking-widest uppercase backdrop-blur-sm">
                        <Box className="w-3 h-3 text-purple-400" />
                        <span>Strukt AI BETA</span>
                    </div>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    Transform 2D Plans into <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
                        Editable 3D Spaces
                    </span>
                </h1>

                <p className="text-lg text-white/50 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 leading-relaxed">
                    The world's first AI-powered platform for interior designers. Calculate costs, apply materials, and visualize in seconds.
                </p>

                {/* Feature Grid (Mini) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                    {[
                        { icon: MousePointer2, title: "Texturize", desc: "Access our library of real-world brochures. Apply authentic laminates and deliver exactly what you specify." },
                        { icon: Wand2, title: "Floorplan to 3D", desc: "Convert any floorplan into 3D instantly. Export fully editable models directly to Blender." },
                        { icon: Layers, title: "Furn AI", desc: "Turn any furniture reference image to 3D" }
                    ].map((feature, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-left flex flex-col gap-3 group">
                            <div className="p-2 w-fit rounded-lg bg-white/5 text-white/80 group-hover:text-white transition-colors">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white/90">{feature.title}</h3>
                                <p className="text-xs text-white/40">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button or Login */}
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">

                    {/* T&C Checkbox */}
                    <div className="flex items-center gap-2 mb-2 bg-black/40 px-3 py-2 rounded-lg border border-white/5 backdrop-blur-sm">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50 cursor-pointer accent-purple-500"
                        />
                        <label htmlFor="terms" className="text-[11px] text-white/60 cursor-pointer select-none">
                            I agree to the <span onClick={(e) => { e.preventDefault(); setShowTerms(true) }} className="text-white underline decoration-white/30 hover:decoration-white hover:text-purple-300 transition-colors">Terms & Conditions</span> regarding data privacy.
                        </label>
                    </div>

                    <div className={cn("transition-opacity duration-300 flex flex-col items-center gap-4", !termsAccepted && "opacity-50 grayscale pointer-events-none")}>
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-white/40 text-xs uppercase tracking-widest mb-1">Sign in to get started</span>
                            <div className="scale-110">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => console.log('Login Failed')}
                                    theme="filled_black"
                                    shape="pill"
                                    text="signin_with"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-white/20 text-xs animate-in fade-in duration-1000 delay-700">
                    Press <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/40">Space</kbd> or Click to Start
                </div>

            </div>

            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        </div>
    )
}
