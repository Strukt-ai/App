'use client'

import { X, Crown, Zap, Box, Sparkles } from 'lucide-react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { useSubscription } from '@/hooks/useSubscription'
import { useEffect, useState } from 'react'

interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
}

function useRazorpayScript() {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return
        if ((window as any).Razorpay) {
            setLoaded(true)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => setLoaded(true)
        document.head.appendChild(script)

        return () => { }
    }, [])

    return loaded
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const token = useFloorplanStore(s => s.token)
    const showToast = useFloorplanStore(s => s.showToast)
    const { sub, isPro, refresh } = useSubscription()
    const [upgrading, setUpgrading] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const razorpayReady = useRazorpayScript()

    if (!isOpen) return null

    const handleUpgrade = async () => {
        if (!token) {
            showToast('Please sign in first.', 'error')
            return
        }
        if (!razorpayReady) {
            showToast('Payment gateway loading, please wait...', 'error')
            return
        }

        setUpgrading(true)
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            })

            if (!res.ok) {
                const err = await res.text()
                console.error('[Checkout]', err)
                showToast('Checkout unavailable. Please try again later.', 'error')
                setUpgrading(false)
                return
            }

            const data = await res.json()
            const options = {
                key: data.razorpay_key_id,
                subscription_id: data.subscription_id,
                name: 'StruktAI',
                description: 'Pro Plan — Monthly',
                image: '/favicon.ico',
                handler: async (response: any) => {
                    try {
                        const verifyRes = await fetch('/api/checkout/verify', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_subscription_id: response.razorpay_subscription_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        })

                        if (verifyRes.ok) {
                            showToast('🎉 Welcome to Pro! Your tokens have been upgraded.', 'success')
                            refresh()
                            onClose()
                        } else {
                            showToast('Payment verification failed. Contact support.', 'error')
                        }
                    } catch {
                        showToast('Payment successful but verification failed. Contact support.', 'error')
                    }
                },
                modal: {
                    ondismiss: () => {
                        setUpgrading(false)
                    },
                },
                theme: {
                    color: '#7c3aed',
                },
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch {
            showToast('Failed to start checkout.', 'error')
            setUpgrading(false)
        }
    }

    const handleCancel = async () => {
        if (!token) return

        setCancelling(true)
        try {
            const res = await fetch('/api/billing/cancel', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            })

            if (res.ok) {
                showToast('Subscription cancelled. You\'ll retain access until the end of your billing period.', 'success')
                refresh()
            } else {
                showToast('Failed to cancel subscription.', 'error')
            }
        } catch {
            showToast('Failed to cancel subscription.', 'error')
        } finally {
            setCancelling(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-[520px] bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                style={{
                    boxShadow: '0 0 40px -10px rgba(124, 58, 237, 0.2), 0 0 20px -10px rgba(124, 58, 237, 0.1)'
                }}
            >
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 relative z-0">
                    <div className="mb-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            <span className="font-semibold text-white">Your Usage ({sub.window_days}-day window)</span>
                            {isPro && (
                                <span className="ml-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-0.5 text-xs font-bold text-white">PRO</span>
                            )}
                        </div>

                        <div className="mb-3">
                            <div className="mb-1 flex justify-between text-sm">
                                <span className="flex items-center gap-1.5 text-white/70">
                                    <Sparkles className="h-3.5 w-3.5" /> Floorplan Tokens
                                </span>
                                <span className="font-mono text-white/90">
                                    {sub.tokens.floorplan.remaining}/{sub.tokens.floorplan.limit}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(sub.tokens.floorplan.remaining / Math.max(1, sub.tokens.floorplan.limit)) * 100}%`,
                                        background: sub.tokens.floorplan.remaining > 0
                                            ? 'linear-gradient(90deg, #a855f7, #6366f1)'
                                            : '#ef4444',
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-1 flex justify-between text-sm">
                                <span className="flex items-center gap-1.5 text-white/70">
                                    <Box className="h-3.5 w-3.5" /> FurnAI 3D Tokens
                                </span>
                                <span className="font-mono text-white/90">
                                    {sub.tokens.furn3d.remaining}/{sub.tokens.furn3d.limit}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(sub.tokens.furn3d.remaining / Math.max(1, sub.tokens.furn3d.limit)) * 100}%`,
                                        background: sub.tokens.furn3d.remaining > 0
                                            ? 'linear-gradient(90deg, #a855f7, #6366f1)'
                                            : '#ef4444',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="mb-2 text-sm font-semibold text-white/60">Free</div>
                            <div className="space-y-1 text-xs text-white/50">
                                <div>5 floorplans / 2 weeks</div>
                                <div>10 FurnAI 3D / 2 weeks</div>
                                <div>All exports (GLB, Blend, IFC, DAE)</div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
                            <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-purple-300">
                                <Crown className="h-3.5 w-3.5 text-yellow-500" /> Pro
                            </div>
                            <div className="space-y-1 text-xs text-white/70">
                                <div>15 floorplans / 2 weeks</div>
                                <div>30 FurnAI 3D / 2 weeks</div>
                                <div>All exports (GLB, Blend, IFC, DAE)</div>
                                <div>Priority queue</div>
                            </div>
                        </div>
                    </div>

                    {isPro ? (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full rounded-xl bg-white/10 py-3 text-sm font-medium text-white/80 transition-all hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                        </button>
                    ) : (
                        <button
                            onClick={handleUpgrade}
                            disabled={upgrading}
                            className="group relative w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
                        >
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                            <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-slate-950 px-8 py-3 text-sm font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900">
                                <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                                {upgrading ? 'Opening Razorpay...' : 'Upgrade to Pro — ₹300/mo'}
                            </span>
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="mt-3 w-full text-xs text-white/30 transition-colors hover:text-white/50"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    )
}
