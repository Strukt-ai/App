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

    // Materials
    const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#5D4037', // Dark Brown Frame
        roughness: 0.3,
        metalness: 0.05
    }), [])

    const doorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: isSelected ? '#3b82f6' : '#8B4513', // Saddle Brown (#8B4513) or selection blue
        roughness: 0.6,
        metalness: 0.1
    }), [isSelected])

    const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#cccccc', // Chrome
        roughness: 0.1,
        metalness: 0.9
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
