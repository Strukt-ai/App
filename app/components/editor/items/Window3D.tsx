'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface WindowProps {
    width: number
    height: number
    depth: number
    isSelected?: boolean
    mode?: '2d' | '3d'
}

export function Window3D({ width, height, depth, isSelected, mode }: WindowProps) {
    const frameThickness = 0.08
    const frameDepth = depth

    // Materials — clean minimal look
    const upvcMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: isSelected ? '#3b82f6' : '#f0eeeb',
        roughness: 0.35,
        metalness: 0.0,
        clearcoat: 0.4,
        clearcoatRoughness: 0.25,
    }), [isSelected])

    const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#b8d4e8',
        metalness: 0,
        roughness: 0.02,
        transmission: 0.75,
        thickness: 0.08,
        ior: 1.5,
        envMapIntensity: 1.2,
        transparent: true,
        opacity: 0.6,
        specularIntensity: 0.6,
        specularColor: new THREE.Color('#c8dce8'),
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

            {/* 2D-only blue indicator — only rendered in top-down view */}
            {mode === '2d' && (
                <mesh position={[0, height + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[width, depth]} />
                    <meshBasicMaterial color="#2196F3" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            )}
        </group>
    )
}
