'use client'

import { useEffect, useState } from 'react'
import { useFloorplanStore } from '@/store/floorplanStore'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII='

export function FloorplanOverlay() {
    const { mode, currentRunId, runStatus, calibrationFactor, token, imageWorldWidth, imageWorldHeight, imageDimensions } = useFloorplanStore()

    const [blobUrl, setBlobUrl] = useState<string | null>(null)

    // Load SVG as a blob URL so TextureLoader can read it
    useEffect(() => {
        if (mode !== '2d') return
        if (!currentRunId || runStatus !== 'completed' || !token) {
            setBlobUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return null
            })
            return
        }

        let cancelled = false
            ; (async () => {
                try {
                    const res = await fetch(`/api/runs/${currentRunId}/svg`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    if (!res.ok) throw new Error(`svg ${res.status}`)
                    const svgText = await res.text()

                    const blob = new Blob([svgText], { type: 'image/svg+xml' })
                    const url = URL.createObjectURL(blob)
                    if (cancelled) {
                        URL.revokeObjectURL(url)
                        return
                    }
                    setBlobUrl((prev) => {
                        if (prev) URL.revokeObjectURL(prev)
                        return url
                    })
                } catch (e) {
                    console.error('[FloorplanOverlay] Failed to load SVG', e)
                    setBlobUrl((prev) => {
                        if (prev) URL.revokeObjectURL(prev)
                        return null
                    })
                }
            })()

        return () => {
            cancelled = true
        }
    }, [mode, currentRunId, runStatus, token])

    const texture = useLoader(TextureLoader, blobUrl || _EMPTY_TEX_DATA_URL)

    if (mode !== '2d' || !currentRunId || runStatus !== 'completed' || !blobUrl) return null

    // Match the exact same scaling logic as BackgroundPlane so they perfectly align
    const factor = calibrationFactor > 0 ? calibrationFactor : 0.02
    const width = imageWorldWidth != null ? imageWorldWidth : (imageDimensions?.width || 0) * factor
    const height = imageWorldHeight != null ? imageWorldHeight : (imageDimensions?.height || 0) * factor

    if (width === 0 || height === 0) return null

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.15}
                depthWrite={false}
                toneMapped={false}
                // Color mapping to simulate grayscale/invert if needed, though raw SVG is usually fine
                color={0xffffff}
            />
        </mesh>
    )
}
