'use client'

import { X, Mail, AlertTriangle, Loader2, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useFloorplanStore } from '@/store/floorplanStore'

interface FurnAIQueueModalProps {
    isOpen: boolean
    onClose: () => void
}

export function FurnAIQueueModal({ isOpen, onClose }: FurnAIQueueModalProps) {
    const { currentRunId, user } = useFloorplanStore()
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    // Auto-Submit for Logged In Users
    useEffect(() => {
        console.log("[Queue] Check Auto-Submit:", { user: user?.email, isOpen, submitted, isSubmitting })
        if (user?.email && isOpen && !submitted && !isSubmitting) {
            console.log("[Queue] Triggering Auto-Submit for", user.email)
            handleSubmit()
        }
    }, [isOpen, user, submitted, isSubmitting])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const targetEmail = email || user?.email

        if (!targetEmail || !currentRunId) return

        setIsSubmitting(true)
        try {
            // 1. Send Email to Backend
            const res = await fetch(`/api/runs/${currentRunId}/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail })
            })

            if (!res.ok) throw new Error('Failed to join queue')

            // 2. Trigger Floorplan Download (as promised)
            // ... (Download logic same as before)
            const downloadRes = await fetch(`/api/runs/${currentRunId}/svg`)
            if (downloadRes.ok) {
                const blob = await downloadRes.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `floorplan-${currentRunId}.svg`
                document.body.appendChild(a)
                a.click()
                a.remove()
            }

            setSubmitted(true)
            setTimeout(onClose, 3000) // Auto close after success
        } catch (err) {
            console.error(err)
            if (!user?.email) alert("Failed to join queue. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-card border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col p-6">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {!submitted ? (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-amber-500/10 p-3 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Workers Offline</h3>
                                <p className="text-xs text-amber-500/80 font-medium">HIGH DEMAND • SERVER BUSY</p>
                            </div>
                        </div>

                        {user?.email ? (
                            <div className="flex flex-col items-center py-6 animate-pulse">
                                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                                <p className="text-sm font-semibold text-foreground">Confirming spot for {user.name}...</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                    We are currently running short on compute power. Don't worry, your work isn't lost.
                                    <br /><br />
                                    Enter your email below. We will place you in the <strong>Priority Queue</strong> and
                                    email you the <span className="text-foreground font-semibold">.blend file</span> as soon as a worker becomes available.
                                </p>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-secondary/50 border border-border rounded-lg py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={cn(
                                            "w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all",
                                            "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20",
                                            isSubmitting && "opacity-70 cursor-wait"
                                        )}
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        {isSubmitting ? "Queueing..." : "Queue & Auto-Download Floorplan"}
                                    </button>
                                </form>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center py-8">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                            <Mail className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">You're on the list!</h3>
                        <p className="text-muted-foreground text-sm max-w-[260px]">
                            We've saved your spot. Check your inbox (and spam) folder in a few minutes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
