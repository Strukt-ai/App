'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFloorplanStore } from '@/store/floorplanStore'

function ImportedInstance({ url, x, y, z, rotY }: { url: string; x: number; y: number; z: number; rotY: number }) {
    const gltf = useGLTF(url)

    const object = useMemo(() => {
        return gltf.scene.clone(true)
    }, [gltf.scene])

    return <primitive object={object} position={[x, y, z]} rotation={[0, rotY, 0]} />
}

export function ImportedModelsManager() {
    const mode = useFloorplanStore(s => s.mode)
    const currentRunId = useFloorplanStore(s => s.currentRunId)
    const token = useFloorplanStore(s => s.token)
    const furniture = useFloorplanStore(s => s.furniture)

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
        if (!runId || !token) {
            setBlobUrls({})
            return
        }

        let cancelled = false
        ;(async () => {
            try {
                const headers: Record<string, string> = { Authorization: `Bearer ${token}` }

                const nextUrls: Record<string, string> = {}
                for (const it of furniture) {
                    const rel = (it.modelUrl || '').trim()
                    if (!rel) continue
                    const safe = encodeURI(rel)

                    const res = await fetch(`/api/runs/${runId}/assets/${safe}`, { headers })
                    if (!res.ok) continue
                    const blob = await res.blob()
                    nextUrls[it.id] = URL.createObjectURL(blob)
                }

                if (cancelled) return

                for (const u of Object.values(blobUrls)) {
                    try {
                        URL.revokeObjectURL(u)
                    } catch {
                        // ignore
                    }
                }

                setBlobUrls(nextUrls)
            } catch (e) {
                console.error('[ImportedModelsManager] Failed to load imported models', e)
                if (!cancelled) setBlobUrls({})
            }
        })()

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRunId, token, furniture.map(f => `${f.id}:${f.modelUrl}`).join('|')])

    if (mode !== '3d') return null

    return (
        <group name="ImportedModels">
            {furniture.map(it => {
                const url = blobUrls[it.id]
                if (!url) return null

                return (
                    <ImportedInstance
                        key={it.id}
                        url={url}
                        x={it.position.x}
                        y={it.position.y || 0}
                        z={it.position.z}
                        rotY={it.rotation?.y || 0}
                    />
                )
            })}
        </group>
    )
}
