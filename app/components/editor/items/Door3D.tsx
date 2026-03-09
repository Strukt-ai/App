'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface DoorProps {
    width: number
    height: number
    depth: number
    isSelected?: boolean
}

export function Door3D({ width, height, depth, isSelected }: DoorProps) {
    const frameThickness = 0.1
    const frameDepth = depth
    const doorThickness = 0.05

    // Materials — upgraded to MeshPhysicalMaterial for realism
    const frameMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#5D4037',
        roughness: 0.4,
        metalness: 0.02,
        clearcoat: 0.3,
        clearcoatRoughness: 0.5,
    }), [])

    const doorMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: isSelected ? '#3b82f6' : '#8B4513',
        roughness: 0.5,
        metalness: 0.05,
        clearcoat: 0.2,
        clearcoatRoughness: 0.4,
        sheen: 0.3,
        sheenColor: new THREE.Color('#4a2800'),
        sheenRoughness: 0.8,
    }), [isSelected])

    const handleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#e0e0e0',
        roughness: 0.05,
        metalness: 0.95,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 1.0,
    }), [])

    return (
        <group>
            {/* Frame - Top */}
            <mesh position={[0, height - frameThickness / 2, 0]} material={frameMaterial} castShadow receiveShadow>
                <boxGeometry args={[width, frameThickness, frameDepth]} />
            </mesh>
            {/* Frame - Left */}
            <mesh position={[-width / 2 + frameThickness / 2, height / 2, 0]} material={frameMaterial} castShadow receiveShadow>
                <boxGeometry args={[frameThickness, height, frameDepth]} />
            </mesh>
            {/* Frame - Right */}
            <mesh position={[width / 2 - frameThickness / 2, height / 2, 0]} material={frameMaterial} castShadow receiveShadow>
                <boxGeometry args={[frameThickness, height, frameDepth]} />
            </mesh>

            {/* Door Leaf (Slightly recessed) */}
            <mesh
                position={[0, height / 2, 0]}
                material={doorMaterial}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[width - frameThickness * 2, height - frameThickness, doorThickness]} />
            </mesh>

            {/* Handle */}
            <group position={[width / 2 - 0.2, height / 2, doorThickness / 2 + 0.02]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={handleMaterial} castShadow>
                    <cylinderGeometry args={[0.01, 0.01, 0.05]} />
                </mesh>
                <mesh position={[-0.06, 0, 0.03]} rotation={[0, 0, Math.PI / 2]} material={handleMaterial} castShadow>
                    <cylinderGeometry args={[0.01, 0.01, 0.12]} />
                </mesh>
            </group>
        </group>
    )
}
