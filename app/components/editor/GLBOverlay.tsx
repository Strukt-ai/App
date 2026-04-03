'use client'

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Grid, OrbitControls, useGLTF } from '@react-three/drei'
import { Box3, DoubleSide, Mesh, Vector3 } from 'three'
import { useFloorplanStore } from '@/store/floorplanStore'

const TEST_GLB_URL = '/test/floorplan-20260331_134956_970900.glb'

function stageErrorMessage(status: number, fallback: string) {
  if (status === 401 || status === 403) {
    return 'Login expired. Sign in again to preview the generated GLB.'
  }
  if (status === 404) {
    return 'Generated GLB is not ready yet. Generate it once from the GLB export action, then preview it here.'
  }
  return fallback
}

function CameraFramer({
  focusPoint,
  focusSize,
  controlsRef,
}: {
  focusPoint: Vector3 | null
  focusSize: Vector3 | null
  controlsRef: RefObject<any>
}) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!focusPoint || !focusSize || !controlsRef.current) return

    const maxDim = Math.max(focusSize.x, focusSize.y, focusSize.z, 1)
    const distance = maxDim * 1.6 + 3
    const controlCamera = controlsRef.current.object

    controlCamera.near = 0.1
    controlCamera.far = Math.max(500, distance * 20)
    controlCamera.position.set(
      focusPoint.x + distance,
      focusPoint.y + distance * 0.72,
      focusPoint.z + distance
    )
    controlCamera.lookAt(focusPoint)
    controlCamera.updateProjectionMatrix()

    controlsRef.current.target.copy(focusPoint)
    controlsRef.current.update()
    invalidate()
  }, [controlsRef, focusPoint, focusSize, invalidate])

  return null
}

function GLBModel({
  url,
  onFrameReady,
}: {
  url: string
  onFrameReady: (center: Vector3, size: Vector3) => void
}) {
  const { scene } = useGLTF(url)

  const model = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    model.traverse((obj) => {
      if (!(obj instanceof Mesh) || !obj.material) return

      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
      const isGlass =
        obj.name.toLowerCase().includes('glass') ||
        materials.some((mat) => mat.name?.toLowerCase().includes('glass'))

      const nextMaterials = materials.map((mat) => {
        const nextMaterial = mat.clone()
        nextMaterial.side = DoubleSide
        nextMaterial.transparent = isGlass
        nextMaterial.opacity = isGlass ? 0.72 : 1
        nextMaterial.depthWrite = !isGlass
        nextMaterial.needsUpdate = true
        return nextMaterial
      })

      obj.material = Array.isArray(obj.material) ? nextMaterials : nextMaterials[0]

      obj.castShadow = true
      obj.receiveShadow = true
    })

    model.updateMatrixWorld(true)
    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    if (size.lengthSq() > 0) {
      const center = box.getCenter(new Vector3())
      onFrameReady(center, size)
    }
  }, [model, onFrameReady])

  return <primitive object={model} />
}

export function GLBOverlay() {
  const glbPreviewSource = useFloorplanStore(s => s.glbPreviewSource)
  const currentRunId = useFloorplanStore(s => s.currentRunId)
  const runStatus = useFloorplanStore(s => s.runStatus)
  const token = useFloorplanStore(s => s.token)

  const controlsRef = useRef<any>(null)
  const [assetUrl, setAssetUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusPoint, setFocusPoint] = useState<Vector3 | null>(null)
  const [focusSize, setFocusSize] = useState<Vector3 | null>(null)

  useEffect(() => {
    if (glbPreviewSource === 'none') {
      setAssetUrl(null)
      setError(null)
      setLoading(false)
      return
    }

    if (glbPreviewSource === 'test') {
      setAssetUrl(TEST_GLB_URL)
      setError(null)
      setLoading(false)
      return
    }

    if (!currentRunId) {
      setAssetUrl(null)
      setError('No processed floorplan is available yet.')
      setLoading(false)
      return
    }

    if (runStatus === 'processing') {
      setLoading(true)
      setError(null)
      return
    }

    let active = true
    let objectUrl: string | null = null

    const loadGeneratedGlb = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/runs/${currentRunId}/download/glb?t=${Date.now()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!response.ok) {
          const fallback = (await response.text().catch(() => 'Failed to load generated GLB.')) || 'Failed to load generated GLB.'
          throw new Error(stageErrorMessage(response.status, fallback))
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        if (!active) {
          URL.revokeObjectURL(objectUrl)
          return
        }

        setAssetUrl(objectUrl)
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Failed to load generated GLB.'
        setAssetUrl(null)
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadGeneratedGlb()

    return () => {
      active = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [currentRunId, glbPreviewSource, token, runStatus])

  const previewLabel = glbPreviewSource === 'generated' ? 'Generated GLB' : 'Test GLB'
  const previewHint =
    glbPreviewSource === 'generated'
      ? 'Generated floorplan mesh rendered with the same staged viewer as the reference asset.'
      : 'Reference test asset for checking camera feel, materials, and mesh readability.'

  return (
    <div className="absolute inset-0 z-10 overflow-hidden rounded-[28px] bg-slate-950/92">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.55),rgba(2,6,23,0.94))]" />

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [8, 6, 8], fov: 42 }}
        className="h-full w-full"
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.75} />
        <hemisphereLight args={['#dbeafe', '#0f172a', 0.6]} />
        <directionalLight
          castShadow
          position={[10, 16, 9]}
          intensity={1.35}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <Grid
          args={[80, 80]}
          position={[0, -0.01, 0]}
          cellColor="#1e293b"
          sectionColor="#334155"
          fadeDistance={140}
          fadeStrength={1}
          cellThickness={0.55}
          sectionThickness={0.9}
          infiniteGrid
        />

        {assetUrl && (
          <GLBModel
            key={assetUrl}
            url={assetUrl}
            onFrameReady={(center, size) => {
              setFocusPoint(center)
              setFocusSize(size)
            }}
          />
        )}

        <CameraFramer focusPoint={focusPoint} focusSize={focusSize} controlsRef={controlsRef} />

        <ContactShadows
          position={[0, -0.015, 0]}
          opacity={0.42}
          scale={30}
          blur={1.8}
          far={18}
          resolution={1024}
          color="#020617"
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          minDistance={1.5}
          maxDistance={160}
          maxPolarAngle={Math.PI / 2.02}
        />
      </Canvas>

      <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-2xl border border-white/10 bg-slate-950/72 px-4 py-3 backdrop-blur-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{previewLabel}</p>
        <p className="mt-1 text-sm font-medium text-white">Unified GLB preview stage</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">{previewHint}</p>
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
          <div className="rounded-full border border-cyan-400/20 bg-slate-950/78 px-4 py-2 text-xs font-medium text-cyan-100 backdrop-blur-md">
            Loading {previewLabel.toLowerCase()}...
          </div>
        </div>
      )}

      {error && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 backdrop-blur-md">
          {error}
        </div>
      )}
    </div>
  )
}
