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
    const frameDepth = depth

    // Materials — upgraded for realism
    const upvcMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: isSelected ? '#3b82f6' : '#f5f5f5', // White UPVC (realistic)
        roughness: 0.3,
        metalness: 0.0,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
    }), [isSelected])

    const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#2196F3',
        metalness: 0,
        roughness: 0.05,
        transmission: 0.6,
        thickness: 0.1,
        ior: 1.52,
        envMapIntensity: 1.0,
        transparent: true,
        opacity: 0.7,
        specularIntensity: 0.8,
        specularColor: new THREE.Color('#a8d4f5'),
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
