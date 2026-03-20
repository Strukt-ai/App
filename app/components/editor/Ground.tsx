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
                    roughness={0.95}
                    metalness={0.0}
                    clearcoat={0.02}
                    clearcoatRoughness={0.9}
                    envMapIntensity={0.15}
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
