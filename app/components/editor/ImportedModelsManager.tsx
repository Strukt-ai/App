'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFloorplanStore } from '@/store/floorplanStore'
import { Box3, Vector3 } from 'three'

function ImportedInstance({
    url, x, y, z, rotY,
    targetWidth, targetDepth
}: {
    url: string; x: number; y: number; z: number; rotY: number;
    targetWidth: number; targetDepth: number;
}) {
    const gltf = useGLTF(url)

    const { object, scale } = useMemo(() => {
        const cloned = gltf.scene.clone(true)

        // Compute native bounding box of the GLTF model
        const box = new Box3().setFromObject(cloned)
        const size = new Vector3()
        box.getSize(size)

        const nativeW = Math.max(size.x, 0.001)
        const nativeD = Math.max(size.z, 0.001)
        const nativeH = Math.max(size.y, 0.001)

        // Calculate scale factors from 2D dimensions
        const sx = targetWidth / nativeW
        const sz = targetDepth / nativeD
        // Uniform height scale = average of width/depth scales to keep proportions
        const sy = Math.max(sx, sz)

        return { object: cloned, scale: [sx, sy, sz] as [number, number, number] }
    }, [gltf.scene, targetWidth, targetDepth])

    return <primitive object={object} position={[x, y, z]} rotation={[0, rotY, 0]} scale={scale} />
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

                    // S3 presigned URLs are absolute — fetch directly, no auth header needed
                    const isAbsolute = rel.startsWith('http://') || rel.startsWith('https://')
                    const fetchUrl = isAbsolute ? rel : `/api/runs/${runId}/assets/${encodeURI(rel)}`
                    const fetchHeaders = isAbsolute ? {} : headers

                    const res = await fetch(fetchUrl, { headers: fetchHeaders })
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
                        key={`${it.id}-${it.dimensions.width}-${it.dimensions.depth}`}
                        url={url}
                        x={it.position.x}
                        y={it.position.y || 0}
                        z={it.position.z}
                        rotY={it.rotation?.y || 0}
                        targetWidth={it.dimensions.width || 1}
                        targetDepth={it.dimensions.depth || 1}
                    />
                )
            })}
        </group>
    )
}
