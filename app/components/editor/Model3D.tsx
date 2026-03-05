'use client'

import { useGLTF } from '@react-three/drei'
import { useFloorplanStore } from '@/store/floorplanStore'

export function Model3D() {
    const { mode, currentRunId, runStatus } = useFloorplanStore()

    if (mode !== '3d' || !currentRunId || runStatus !== 'completed') return null

    return <GLBLoader runId={currentRunId} />
}

function GLBLoader({ runId }: { runId: string }) {
    // Generate a unique URL to avoid caching issues when regenerating and re-viewing the 3D model
    const url = `/api/runs/${runId}/download/glb?t=${Date.now()}`
    const { scene } = useGLTF(url)

    return (
        <primitive
            object={scene}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
        />
    )
}
