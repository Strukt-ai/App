'use client'

import { useEffect, useRef, useState } from 'react'
import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useFloorplanStore } from '@/store/floorplanStore'
import * as THREE from 'three'

export function SelectionTransform() {
    const { selectedId, updateFurniture, mode: viewMode } = useFloorplanStore()
    const { scene, camera, gl } = useThree()
    const [target, setTarget] = useState<THREE.Object3D | null>(null)
    const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate')

    // Find the object in the scene when selectedId changes
    useEffect(() => {
        if (!selectedId) {
            setTarget(null)
            return
        }

        let found: THREE.Object3D | null = null
        scene.traverse((obj) => {
            if (obj.userData && obj.userData.id === selectedId) {
                found = obj
            }
        })

        setTarget(found)
    }, [selectedId, scene])

    // Keyboard shortcuts for modes
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') setTransformMode('rotate')
            if (e.key.toLowerCase() === 't') setTransformMode('translate')
            if (e.key.toLowerCase() === 'm') setTransformMode('translate') // M also for Move
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    if (!target) return null
    if (viewMode !== '2d' && viewMode !== '3d') return null // Works in both now? User said "everyhing"

    return (
        <group>
            <TransformControls
                object={target}
                mode={transformMode}
                space="local"
                onChange={() => {
                    // Sync back to store
                    // We need to know WHAT we are updating. userData helps.
                    if (target.userData.isFurniture) {
                        updateFurniture(target.userData.id, {
                            position: {
                                x: target.position.x,
                                y: target.position.y,
                                z: target.position.z
                            },
                            rotation: {
                                x: target.rotation.x,
                                y: target.rotation.y,
                                z: target.rotation.z
                            }
                        })
                    }
                }}
            />

            {/* Simple UI hints for mode switching - attached to camera or screen? */}
            {/* R3F HTML? Maybe overkill. Sidebar has buttons? */}
        </group>
    )
}
