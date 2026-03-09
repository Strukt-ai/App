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
                    color="#1a1a1a"
                    roughness={0.85}
                    metalness={0.05}
                    clearcoat={0.15}
                    clearcoatRoughness={0.4}
                    envMapIntensity={0.5}
                />
            ) : (
                <meshStandardMaterial
                    color="#151515"
                    roughness={1}
                    metalness={0}
                />
            )}
        </mesh>
    )
}
