'use client'

import React, { useState, useEffect } from 'react'
import { X, CreditCard, Box } from 'lucide-react'
import Script from 'next/script'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'

interface RenderPaymentModalProps {
    isOpen: boolean
    onClose: () => void
}

const renderPackages = [
    { label: '1 Render', value: 1, price: 99 },
    { label: '5 Renders', value: 5, price: 399 },
    { label: '20 Renders', value: 20, price: 799 }
]

export function RenderPaymentModal({ isOpen, onClose }: RenderPaymentModalProps) {
    const [selectedPackage, setSelectedPackage] = useState(renderPackages[2]) // Default 20 Renders
    const [isProcessing, setIsProcessing] = useState(false)
    const showToast = useFloorplanStore(s => s.showToast)

    // Stop propagation so clicking inside doesn't trigger outside click
    if (!isOpen) return null

    const handlePayment = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch('/internal-api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: selectedPackage.price })
            })
            const data = await response.json()
            
            if (data.orderId) {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_demo",
                    amount: selectedPackage.price * 100,
                    currency: "INR",
                    name: "Strukt AI",
                    description: `Realistic Render Option - ${selectedPackage.label}`,
                    order_id: data.orderId,
                    handler: function (response: any) {
                        showToast(`Payment successful! Render process started.`, 'success')
                        onClose()
                    },
                    theme: {
                        color: "#2563eb" // Tailwind Blue-600
                    }
                }
                const rzp1 = new (window as any).Razorpay(options)
                rzp1.open()
            }
        } catch (error) {
            console.error("Payment error:", error)
            showToast("Something went wrong with the payment mechanism.", 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300 pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
        >
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            {/* Modal Container */}
            <div className="bg-[#0b0e14] border border-white/10 rounded-2xl w-full max-w-4xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col sm:flex-row relative">
                
                {/* Left Side: Summary & Preview */}
                <div className="w-full sm:w-5/12 p-8 bg-[#10131a] border-r border-white/5 flex flex-col relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div className="text-white text-xl font-bold font-heading tracking-tight leading-tight">
                            Make your interior<br/>designs realistic!
                        </div>
                        <button onClick={onClose} className="sm:hidden text-zinc-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Preview Box - Glass style */}
                    <div className="w-full aspect-[4/3] relative bg-[#161a21]/50 border border-white/5 rounded-xl overflow-hidden mb-8 flex items-center justify-center shadow-inner group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                        <div className="z-10 bg-black/60 backdrop-blur-md text-white/80 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider absolute bottom-3 left-3">
                            Editor Preview
                        </div>
                        {/* 3D Wireframe icon */}
                        <div className="z-10 bg-blue-500/10 border border-blue-500/30 w-24 h-24 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <Box className="w-10 h-10 text-blue-400 opacity-80" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">How many renders do you need?</label>
                        <select 
                            className="bg-[#161a21] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none hover:border-white/20 transition-all cursor-pointer appearance-none shadow-sm"
                            value={selectedPackage.value}
                            onChange={(e) => setSelectedPackage(renderPackages.find(p => p.value === Number(e.target.value))!)}
                        >
                            {renderPackages.map(pkg => (
                                <option key={pkg.value} value={pkg.value}>{pkg.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 mt-auto flex items-center justify-between relative z-10">
                        <span className="text-sm text-zinc-400 font-medium">Total Price</span>
                        <span className="text-2xl font-bold text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
                            ₹{selectedPackage.price}
                        </span>
                    </div>
                </div>

                {/* Right Side: Payment Form */}
                <div className="w-full sm:w-7/12 p-8 sm:p-10 flex flex-col relative bg-[#0b0e14]">
                    <button onClick={onClose} className="hidden sm:flex absolute top-6 right-6 w-8 h-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-20">
                        <X className="w-4 h-4" />
                    </button>
                    
                    {/* Fake Payment Method Selector */}
                    <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-4 border-blue-500/30 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div></div>
                            <span className="font-bold text-sm text-white">Cards, UPI & Netbanking</span>
                        </div>
                    </div>

                    {/* Interactive Mock Form */}
                    <div className="flex flex-col gap-5 flex-1 justify-center">
                        <div>
                            <div className="flex items-center gap-3 bg-[#161a21] border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-sm">
                                <CreditCard className="w-5 h-5 text-zinc-500" />
                                <input type="text" placeholder="Card Number" className="bg-transparent border-none outline-none w-full text-sm text-white placeholder:text-zinc-600" />
                            </div>
                        </div>
                        
                        <div>
                            <input type="text" placeholder="Name on card" className="bg-[#161a21] border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 w-full text-sm text-white placeholder:text-zinc-600 transition-all shadow-sm" />
                        </div>
                        
                        <div className="flex gap-5">
                            <input type="text" placeholder="MM / YY" className="bg-[#161a21] border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 w-1/2 text-sm text-white placeholder:text-zinc-600 transition-all shadow-sm" />
                            <input type="text" placeholder="CVV" className="bg-[#161a21] border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 w-1/2 text-sm text-white placeholder:text-zinc-600 transition-all shadow-sm" />
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-3">
                        <button 
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={cn("w-full py-4 rounded-xl text-[15px] font-bold transition-all flex items-center justify-center gap-2", 
                                isProcessing ? "bg-blue-600/50 text-white/50 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)] shadow-lg"
                            )}
                        >
                            {isProcessing ? 'Connecting Server...' : 'Pay with Razorpay'}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-3 rounded-xl text-[14px] font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel & Go Back
                        </button>
                        <p className="text-center text-[11px] text-zinc-600 font-medium mt-2 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> Secured by standard encryption
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
