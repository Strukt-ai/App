'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFloorplanStore } from '@/store/floorplanStore'

type FurnAIAssetManifest = {
    version?: number
    run_id?: string
    updated_at?: string
    items?: Record<
        string,
        {
            item_id?: string
            category?: string
            job_id?: string
            glb?: string
            pose_px?: { x_px: number; y_px: number } | null
            updated_at?: string
        }
    >
}

function AssetInstance({ url, x, z }: { url: string; x: number; z: number }) {
    const gltf = useGLTF(url)

    const object = useMemo(() => {
        // Clone so multiple instances can coexist safely.
        return gltf.scene.clone(true)
    }, [gltf.scene])

    return <primitive object={object} position={[x, 0.02, z]} />
}

export function FurnAIAssetsManager() {
    const mode = useFloorplanStore(s => s.mode)
    const currentRunId = useFloorplanStore(s => s.currentRunId)
    const token = useFloorplanStore(s => s.token)
    const pxToM = useFloorplanStore(s => s.calibrationFactor)

    const [manifest, setManifest] = useState<FurnAIAssetManifest | null>(null)
    const [offsetPx, setOffsetPx] = useState<{ x: number; y: number } | null>(null)
    const [blobUrls, setBlobUrls] = useState<Record<string, string>>({})

    useEffect(() => {
        // Cleanup blob URLs when run changes/unmounts
        return () => {
            for (const u of Object.values(blobUrls)) {
                try {
                    URL.revokeObjectURL(u)
                } catch {
                    // ignore
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRunId])

    useEffect(() => {
        const runId = currentRunId
        if (!runId || !token || mode !== '3d') {
            setManifest(null)
            setOffsetPx(null)
            setBlobUrls({})
            return
        }

        let cancelled = false
            ; (async () => {
                try {
                    const headers: Record<string, string> = { Authorization: `Bearer ${token}` }

                    const [mRes, svgRes] = await Promise.all([
                        fetch(`/api/runs/${runId}/furniture/assets`, { headers }),
                        fetch(`/api/runs/${runId}/svg`, { headers }),
                    ])

                    if (!mRes.ok) throw new Error(`manifest ${mRes.status}`)
                    if (!svgRes.ok) throw new Error(`svg ${svgRes.status}`)

                    const mJson = await mRes.json()
                    const m = (mJson?.manifest || null) as FurnAIAssetManifest | null

                    const svgText = await svgRes.text()
                    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
                    const svgEl = doc.querySelector('svg')
                    const vb = svgEl?.getAttribute('viewBox')
                    let ox = 0
                    let oy = 0
                    if (vb) {
                        const parts = vb
                            .split(/[\s,]+/)
                            .map(p => parseFloat(p))
                            .filter(n => !isNaN(n))
                        if (parts.length === 4) {
                            ox = parts[0] + parts[2] / 2
                            oy = parts[1] + parts[3] / 2
                        }
                    }

                    if (cancelled) return
                    setManifest(m)
                    setOffsetPx({ x: ox, y: oy })

                    // Download GLBs as blobs so we can include auth headers.
                    const items = m?.items || {}
                    const nextUrls: Record<string, string> = {}
                    for (const [key, it] of Object.entries(items)) {
                        const rel = (it?.glb || '').trim()
                        if (!rel) continue

                        const path = encodeURI(rel)
                        const glbRes = await fetch(`/api/runs/${runId}/assets/${path}`, { headers })
                        if (!glbRes.ok) continue

                        const blob = await glbRes.blob()
                        const url = URL.createObjectURL(blob)
                        nextUrls[key] = url
                    }

                    if (cancelled) return

                    // Revoke previous URLs (avoid leaks)
                    for (const u of Object.values(blobUrls)) {
                        try {
                            URL.revokeObjectURL(u)
                        } catch {
                            // ignore
                        }
                    }

                    setBlobUrls(nextUrls)
                } catch (e) {
                    console.error('[FurnAIAssetsManager] Failed to load assets', e)
                    if (!cancelled) {
                        setManifest(null)
                        setOffsetPx(null)
                        setBlobUrls({})
                    }
                }
            })()

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRunId, token])

    if (mode !== '3d') return null
    if (!manifest || !offsetPx) return null

    const items = manifest.items || {}

    return (
        <group name="FurnAIAssets">
            {Object.entries(items).map(([key, it]) => {
                const pose = it?.pose_px
                const url = blobUrls[key]
                if (!pose || !url) return null

                const x = (pose.x_px - offsetPx.x) * pxToM
                const z = (pose.y_px - offsetPx.y) * pxToM

                return <AssetInstance key={key} url={url} x={x} z={z} />
            })}
        </group>
    )
}
