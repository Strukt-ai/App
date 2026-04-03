'use client'

import { useFloorplanStore } from '@/store/floorplanStore'

export function Ground() {
    const mode = useFloorplanStore(s => s.mode)

    return (
        <group>
            <mesh
                name="Ground"
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.15, 0]}
                receiveShadow
            >
                <planeGeometry args={[100, 100]} />
                {mode === '3d' ? (
                    <meshPhysicalMaterial
                        color="#3a3a3a"
                        roughness={0.85}
                        metalness={0.0}
                        clearcoat={0.03}
                        clearcoatRoughness={0.8}
                        envMapIntensity={0.25}
                    />
                ) : (
                    <meshStandardMaterial
                        color="#1a1a1a"
                        roughness={1}
                        metalness={0}
                    />
                )}
            </mesh>

            {mode === '3d' && (
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -0.16, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[500, 500]} />
                    <meshStandardMaterial
                        color="#5a6555"
                        roughness={0.95}
                        metalness={0.0}
                    />
                </mesh>
            )}
        </group>
    )
}
