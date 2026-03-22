'use client'

import { useState, useEffect, useCallback } from 'react'
import { useFloorplanStore } from '@/store/floorplanStore'

export interface TokenPool {
    used: number
    limit: number
    remaining: number
}

export interface SubscriptionData {
    tier: string
    window_days: number
    tokens: {
        floorplan: TokenPool
        furn3d: TokenPool
    }
    limits: Record<string, any>
    pro_price_inr: number
    razorpay_customer_id?: string
    tier_expires_at?: string
}

const DEFAULT_SUB: SubscriptionData = {
    tier: 'free',
    window_days: 14,
    tokens: {
        floorplan: { used: 0, limit: 5, remaining: 5 },
        furn3d: { used: 0, limit: 10, remaining: 10 },
    },
    limits: {},
    pro_price_inr: 300,
}

export function useSubscription() {
    const token = useFloorplanStore(s => s.token)
    const [sub, setSub] = useState<SubscriptionData>(DEFAULT_SUB)
    const [loading, setLoading] = useState(false)

    const refresh = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const res = await fetch('/api/user/subscription', {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store',
            })
            if (res.ok) {
                const data = await res.json()
                setSub(data)
            }
        } catch (e) {
            console.error('[Subscription] fetch failed:', e)
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        refresh()
    }, [refresh])

    const canUseFloorplan = sub.tokens.floorplan.remaining > 0
    const canUseFurn3d = sub.tokens.furn3d.remaining > 0
    const isPro = sub.tier === 'pro'

    return {
        sub,
        loading,
        refresh,
        canUseFloorplan,
        canUseFurn3d,
        isPro,
    }
}

/**
 * Parse a 429 error response and return a user-friendly message.
 */
export function parse429Error(responseText: string): string {
    try {
        const data = JSON.parse(responseText)
        return data.detail || 'Token limit reached. Upgrade to Pro for more.'
    } catch {
        if (responseText.includes('token')) return responseText
        return 'Usage limit reached. Upgrade to Pro for more tokens.'
    }
}
