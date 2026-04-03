'use client'

import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import { useEffect } from 'react'
import { DoubleSide, Mesh } from 'three'

function GLBModel() {
  const url = '/test/floorplan-20260331_134956_970900.glb'
  
  console.log('GLBModel loading URL:', url)
  const { scene } = useGLTF(url)

  console.log('GLBModel scene loaded:', scene ? 'yes' : 'no')

  useEffect(() => {
    if (!scene) return
    console.log('Processing GLB scene with', scene.children.length, 'children')
    
    scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
          const name = obj.name.toLowerCase()
          const isGlass = name.includes("glass") || materials.some(
            (m) => m.name && m.name.toLowerCase().includes("glass")
          )

          materials.forEach(mat => {
            mat.side = DoubleSide
            if (isGlass) {
              mat.transparent = true
              mat.opacity = 0.7
            }
          })
        }
      }
    })
  }, [scene])

  if (!scene) return null

  return <primitive object={scene} />
}

export function GLBOverlay() {
  console.log('GLBOverlay rendering')
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        pointerEvents: 'auto'
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 5, 10], fov: 50 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        {/* Avoid external HDR load failure in constrained environments */}
        {/* <Environment preset="city" /> */}
        <GLBModel />
        <OrbitControls />
      </Canvas>
    </div>
  )
}
