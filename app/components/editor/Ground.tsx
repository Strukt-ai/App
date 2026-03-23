'use client'

import { useFloorplanStore } from '@/store/floorplanStore'

export function Ground() {
    const mode = useFloorplanStore(s => s.mode)

    return (
        <mesh
            name="Ground"
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.15, 0]}
            receiveShadow
        >
            <planeGeometry args={[100, 100]} />
            {mode === '3d' ? (
                <meshPhysicalMaterial
                    color="#2a2a2a"
                    roughness={0.75}
                    metalness={0.0}
                    clearcoat={0.05}
                    clearcoatRoughness={0.6}
                    envMapIntensity={0.3}
                />
            ) : (
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={1}
                    metalness={0}
                />
            )}
        </mesh>
    )
}
