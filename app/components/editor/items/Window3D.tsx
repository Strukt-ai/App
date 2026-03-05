'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface WindowProps {
    width: number
    height: number
    depth: number
    isSelected?: boolean
}

export function Window3D({ width, height, depth, isSelected }: WindowProps) {
    const frameThickness = 0.08
    const frameDepth = Math.max(depth, 0.25) // Ensure it's thicker than standard 0.2 walls

    // Materials
    const upvcMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: isSelected ? '#3b82f6' : '#0000FF', // Pure Blue (#0000FF)
        roughness: 0.2,
        metalness: 0.1
    }), [isSelected])

    const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0,
        transmission: 0.95, // Glass transparency
        thickness: 0.05, // Refraction
        envMapIntensity: 1,
        transparent: true,
        opacity: 0.3 // Fallback
    }), [])

    return (
        <group>
            {/* Outer Frame - Top */}
            <mesh position={[0, height - frameThickness / 2, 0]} material={upvcMaterial} castShadow>
                <boxGeometry args={[width, frameThickness, frameDepth]} />
            </mesh>
            {/* Outer Frame - Bottom */}
            <mesh position={[0, frameThickness / 2, 0]} material={upvcMaterial} castShadow>
                <boxGeometry args={[width, frameThickness, frameDepth]} />
            </mesh>
            {/* Outer Frame - Left */}
            <mesh position={[-width / 2 + frameThickness / 2, height / 2, 0]} material={upvcMaterial} castShadow>
                <boxGeometry args={[frameThickness, height, frameDepth]} />
            </mesh>
            {/* Outer Frame - Right */}
            <mesh position={[width / 2 - frameThickness / 2, height / 2, 0]} material={upvcMaterial} castShadow>
                <boxGeometry args={[frameThickness, height, frameDepth]} />
            </mesh>

            {/* Vertical Divider (Mullion) */}
            <mesh position={[0, height / 2, 0]} material={upvcMaterial} castShadow>
                <boxGeometry args={[frameThickness * 0.8, height - frameThickness * 2, frameDepth * 0.8]} />
            </mesh>

            {/* Glass Panels */}
            {/* Left Pane */}
            <mesh position={[-width / 4, height / 2, 0]} material={glassMaterial}>
                <boxGeometry args={[width / 2 - frameThickness * 2, height - frameThickness * 2, 0.02]} />
            </mesh>
            {/* Right Pane */}
            <mesh position={[width / 4, height / 2, 0]} material={glassMaterial}>
                <boxGeometry args={[width / 2 - frameThickness * 2, height - frameThickness * 2, 0.02]} />
            </mesh>
        </group>
    )
}
