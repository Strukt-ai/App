'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GlobalToast() {
    const toast = useFloorplanStore(s => s.toast)

    if (!toast) return null

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
            <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md min-w-[320px]",
                "bg-[#0f0f13]/90 border-white/10 text-white"
            )}>
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}

                <span className="text-sm font-medium tracking-wide">{toast.message}</span>
            </div>
        </div>
    )
}
