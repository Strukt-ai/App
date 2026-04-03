'use client'

import { useGLTF } from '@react-three/drei'
import { useFloorplanStore } from '@/store/floorplanStore'
import { useEffect } from 'react'
import { DoubleSide, Mesh } from 'three'

export function Model3D() {
    const { mode, currentRunId, runStatus } = useFloorplanStore()

    if (mode !== '3d' || !currentRunId || runStatus !== 'completed') return null

    return <GLBLoader runId={currentRunId} />
}

function GLBLoader({ runId }: { runId: string }) {
    // Generate a unique URL to avoid caching issues when regenerating and re-viewing the 3D model
    const url = `/api/runs/${runId}/download/glb?t=${Date.now()}`
    const { scene } = useGLTF(url)

    useEffect(() => {
        if (!scene) return
        scene.traverse((obj) => {
            if (obj instanceof Mesh) {
                if (obj.material) {
                    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
                    const name = obj.name.toLowerCase()
                    const isGlass = name.includes("glass") || materials.some(
                        (m) => m.name && m.name.toLowerCase().includes("glass")
                    )
                    const isWall = name.includes("wall")

                    materials.forEach((mat) => {
                        if (isGlass) {
                            // Glass: keep transparent but ensure proper depth
                            mat.side = DoubleSide
                            mat.transparent = true
                            mat.opacity = 0.3
                            mat.depthWrite = false
                            mat.depthTest = true
                        } else if (isWall) {
                            // Walls: FrontSide to avoid z-fighting on angled walls,
                            // fully opaque, no alpha blending
                            mat.side = DoubleSide
                            mat.transparent = false
                            mat.opacity = 1.0
                            mat.depthWrite = true
                            mat.depthTest = true
                            mat.alphaTest = 0
                            // Force polygon offset to prevent z-fighting on coplanar faces
                            mat.polygonOffset = true
                            mat.polygonOffsetFactor = 1
                            mat.polygonOffsetUnits = 1
                        } else {
                            // Everything else: solid, double-sided
                            mat.side = DoubleSide
                            mat.transparent = false
                            mat.opacity = 1.0
                            mat.depthWrite = true
                            mat.depthTest = true
                            mat.alphaTest = 0
                        }
                        mat.needsUpdate = true
                    })
                }
                obj.castShadow = true
                obj.receiveShadow = true

                // Push render order: walls first, then doors/windows on top
                const n = obj.name.toLowerCase()
                if (n.includes("wall")) {
                    obj.renderOrder = 0
                } else if (n.includes("door") || n.includes("window") || n.includes("glass")) {
                    obj.renderOrder = 1
                } else {
                    obj.renderOrder = 2
                }
            }
        })
    }, [scene])

    return (
        <primitive
            object={scene}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
        />
    )
}
