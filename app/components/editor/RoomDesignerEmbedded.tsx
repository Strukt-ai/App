'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { useFloorplanStore } from '@/store/floorplanStore'
import { FurnAIAssetsManager } from '@/components/editor/FurnAIAssetsManager'
import { shallow } from 'zustand/shallow'

type Bp3dInstance = any

const GLBOverlay = dynamic(() => import('@/components/editor/GLBOverlay').then(m => ({ default: m.GLBOverlay })), {
  ssr: false,
  loading: () => null
})

const CM_PER_M = 100
const cmToM = (v: number) => v / CM_PER_M
const mToCm = (v: number) => v * CM_PER_M

const DEFAULT_DOOR_MODEL = 'models/glb-legacy/door.glb'
const DEFAULT_WINDOW_MODEL = 'models/js/whitewindow.js'
const EMPTY_SERIALIZED = '{"floorplan":{"corners":{},"walls":[],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}'

const genId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const wallKey = (start: { x: number; y: number }, end: { x: number; y: number }) => {
  const a = `${start.x.toFixed(3)},${start.y.toFixed(3)}`
  const b = `${end.x.toFixed(3)},${end.y.toFixed(3)}`
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)

const distPointToSegment = (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
  const vx = b.x - a.x
  const vy = b.y - a.y
  const wx = p.x - a.x
  const wy = p.y - a.y
  const c1 = vx * wx + vy * wy
  if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const c2 = vx * vx + vy * vy
  if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y)
  const t = c1 / c2
  const proj = { x: a.x + t * vx, y: a.y + t * vy }
  return Math.hypot(p.x - proj.x, p.y - proj.y)
}

const pointInPolygon = (pt: { x: number; y: number }, poly: { x: number; y: number }[]) => {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
      (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + Number.EPSILON) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

const polygonArea = (pts: { x: number; y: number }[]) => {
  if (pts.length < 3) return 0
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y
  }
  return a / 2
}

const polygonCenter = (pts: { x: number; y: number }[]) => {
  if (pts.length === 0) return { x: 0, y: 0 }
  const sum = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: sum.x / pts.length, y: sum.y / pts.length }
}

const getWallEndpoints = (wall: any): { start: { x: number; y: number }; end: { x: number; y: number } } | null => {
  if (!wall) return null
  if (wall?.getStartX && wall?.getEndX) {
    return {
      start: { x: cmToM(wall.getStartX()), y: cmToM(wall.getStartY()) },
      end: { x: cmToM(wall.getEndX()), y: cmToM(wall.getEndY()) }
    }
  }
  if (wall?.getStart && wall?.getEnd) {
    const s = wall.getStart()
    const e = wall.getEnd()
    if (s && e) {
      return {
        start: { x: cmToM(s.x), y: cmToM(s.y) },
        end: { x: cmToM(e.x), y: cmToM(e.y) }
      }
    }
  }
  if (wall?.wall?.getStartX && wall?.wall?.getEndX) {
    return {
      start: { x: cmToM(wall.wall.getStartX()), y: cmToM(wall.wall.getStartY()) },
      end: { x: cmToM(wall.wall.getEndX()), y: cmToM(wall.wall.getEndY()) }
    }
  }
  return null
}

const mapWallToStoreId = (wall: any, storeWalls: { id: string; start: { x: number; y: number }; end: { x: number; y: number } }[]) => {
  const endpoints = getWallEndpoints(wall)
  if (!endpoints) return null
  const { start, end } = endpoints
  let bestId: string | null = null
  let best = Infinity
  storeWalls.forEach(w => {
    const d1 = dist(start, w.start) + dist(end, w.end)
    const d2 = dist(start, w.end) + dist(end, w.start)
    const d = Math.min(d1, d2)
    if (d < best) {
      best = d
      bestId = w.id
    }
  })
  return bestId
}

const inferOpeningType = (name?: string, modelUrl?: string) => {
  const s = `${name || ''} ${modelUrl || ''}`.toLowerCase()
  if (s.includes('door')) return 'door'
  if (s.includes('window')) return 'window'
  return null
}

const normalizeModelUrl = (url?: string) => {
  if (!url) return ''
  const isAbsolute = url.startsWith('http://') || url.startsWith('https://')
  if (!isAbsolute) return url
  return `/api/proxy-glb?url=${encodeURIComponent(url)}`
}

export function RoomDesignerEmbedded() {
  const mode = useFloorplanStore(s => s.mode)
  const testGLB = useFloorplanStore(s => s.testGLB)
  const activeTool = useFloorplanStore(s => s.activeTool)
  const selectedId = useFloorplanStore(s => s.selectedId)
  const walls = useFloorplanStore(s => s.walls)
  const rooms = useFloorplanStore(s => s.rooms)
  const furniture = useFloorplanStore(s => s.furniture)
  const replaceScene = useFloorplanStore(s => s.replaceScene)
  const selectObject = useFloorplanStore(s => s.selectObject)
  const setActiveTool = useFloorplanStore(s => s.setActiveTool)
  const updateFurniture = useFloorplanStore(s => s.updateFurniture)
  const deleteObject = useFloorplanStore(s => s.deleteObject)
  const saveHistory = useFloorplanStore(s => s.saveHistory)

  const bpRef = useRef<Bp3dInstance | null>(null)
  const syncRef = useRef<'bp3d' | 'store' | null>(null)
  const debounceRef = useRef<number | null>(null)
  const wallMapRef = useRef<Map<string, string>>(new Map())
  const roomMapRef = useRef<Map<string, string>>(new Map())
  const activeToolRef = useRef(activeTool)

  const [scriptsReady, setScriptsReady] = useState(false)
  const [bpReady, setBpReady] = useState(false)

  useEffect(() => {
    activeToolRef.current = activeTool
  }, [activeTool])

  useEffect(() => {
    if (typeof window === 'undefined') return
    ;(window as any).__BP3D_EMBED_MODE__ = true
    ;(window as any).__BP3D_AUTO_INIT__ = false
    return () => {
      delete (window as any).__BP3D_EMBED_MODE__
      delete (window as any).__BP3D_AUTO_INIT__
    }
  }, [])

  const scheduleSyncFromBp3d = () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      syncFromBp3d()
    }, 80)
  }

  const syncFromBp3d = () => {
    if (!bpRef.current) return
    if (syncRef.current === 'store') return
    syncRef.current = 'bp3d'

    const bp = bpRef.current
    const prev = useFloorplanStore.getState()
    const nextWalls = [] as typeof walls
    const nextRooms = [] as typeof rooms
    const nextFurniture = [] as typeof furniture

    wallMapRef.current = new Map()
    roomMapRef.current = new Map()

    // Walls
    const bpWalls = bp.model.floorplan.getWalls()
    const WALL_TOL = 0.05
    bpWalls.forEach((w: any) => {
      const start = { x: cmToM(w.getStartX()), y: cmToM(w.getStartY()) }
      const end = { x: cmToM(w.getEndX()), y: cmToM(w.getEndY()) }
      let matchedId: string | null = null
      let matchedPrev = null as any
      let best = Infinity
      prev.walls.forEach(pw => {
        const d1 = dist(start, pw.start) + dist(end, pw.end)
        const d2 = dist(start, pw.end) + dist(end, pw.start)
        const d = Math.min(d1, d2)
        if (d < best) {
          best = d
          matchedId = pw.id
          matchedPrev = pw
        }
      })
      if (best > WALL_TOL) {
        matchedId = null
        matchedPrev = null
      }

      const textureUrl = w.frontTexture?.url
      const id = matchedId || genId()
      // Always map BP wall id → store id so selections can resolve reliably
      if (w?.id) wallMapRef.current.set(w.id, id)

      nextWalls.push({
        id,
        start,
        end,
        thickness: cmToM(w.thickness || 15),
        height: cmToM(w.height || 250),
        textureDataUrl: textureUrl || matchedPrev?.textureDataUrl,
        textureTileWidthM: matchedPrev?.textureTileWidthM,
        textureTileHeightM: matchedPrev?.textureTileHeightM,
        color: matchedPrev?.color,
      })
    })

    // Rooms
    const bpRooms = bp.model.floorplan.getRooms()
    const ROOM_TOL = 0.5
    bpRooms.forEach((r: any, idx: number) => {
      const pts = (r.corners || []).map((c: any) => ({ x: cmToM(c.x), y: cmToM(c.y) }))
      if (pts.length < 3) return
      const center = polygonCenter(pts)
      const area = Math.abs(polygonArea(pts))

      let matchedId: string | null = null
      let matchedPrev = null as any
      let best = Infinity
      prev.rooms.forEach(pr => {
        const c = pr.center || polygonCenter(pr.points)
        const d = dist(center, c)
        const da = Math.abs(Math.abs(polygonArea(pr.points)) - area)
        const score = d + da
        if (score < best) {
          best = score
          matchedId = pr.id
          matchedPrev = pr
        }
      })
      if (best > ROOM_TOL) {
        matchedId = null
        matchedPrev = null
      }

      const tex = r.getTexture ? r.getTexture() : null
      const id = matchedId || genId()
      // Always map BP room uuid → store id so selections can resolve reliably
      if (r.getUuid) roomMapRef.current.set(r.getUuid(), id)

      nextRooms.push({
        id,
        name: matchedPrev?.name || `Room ${idx + 1}`,
        points: pts,
        color: matchedPrev?.color || '#ddd8d0',
        center,
        textureDataUrl: tex?.url || matchedPrev?.textureDataUrl,
        textureTileWidthM: matchedPrev?.textureTileWidthM,
        textureTileHeightM: matchedPrev?.textureTileHeightM,
      })
    })

    // Furniture
    const bpItems = bp.model.scene.getItems()
    bpItems.forEach((it: any) => {
      const meta = it.metadata || {}
      const existingId = meta.storeId
      const typeFromName = inferOpeningType(meta.itemName, meta.modelUrl)
      const id = existingId || genId()
      if (!meta.storeId) meta.storeId = id

      const prevItem = prev.furniture.find(f => f.id === id)

      nextFurniture.push({
        id,
        type: typeFromName || prevItem?.type || (meta.modelUrl ? 'imported' : 'furniture'),
        position: {
          x: cmToM(it.position.x),
          y: cmToM(it.position.y),
          z: cmToM(it.position.z),
        },
        rotation: { x: 0, y: it.rotation.y || 0, z: 0 },
        dimensions: {
          width: cmToM(it.getWidth()),
          height: cmToM(it.getHeight()),
          depth: cmToM(it.getDepth()),
        },
        modelUrl: meta.modelUrl || prevItem?.modelUrl,
        mtlUrl: meta.mtlUrl || prevItem?.mtlUrl,
        furnAiId: meta.furnAiId || prevItem?.furnAiId,
        label: meta.itemName || prevItem?.label,
        color: prevItem?.color,
      })
    })

    replaceScene({ walls: nextWalls, rooms: nextRooms, furniture: nextFurniture })
    saveHistory()

    requestAnimationFrame(() => {
      syncRef.current = null
    })
  }

  const applyStoreToBp3d = () => {
    if (!bpRef.current) return
    if (syncRef.current === 'bp3d') return
    syncRef.current = 'store'

    const bp = bpRef.current
    const store = useFloorplanStore.getState()

    // Configure global wall thickness/height (cm)
    try {
      const BP3D = (window as any).BP3D
      if (BP3D?.Core?.Configuration) {
        const avgThickness = store.walls.length > 0
          ? store.walls.reduce((a, w) => a + (w.thickness || 0.15), 0) / store.walls.length
          : 0.15
        BP3D.Core.Configuration.setValue(BP3D.Core.configWallThickness, mToCm(avgThickness))
        BP3D.Core.Configuration.setValue(BP3D.Core.configWallHeight, mToCm(2.5))
      }
    } catch {
      // ignore
    }

    // Build floorplan from store walls
    const corners: Record<string, { x: number; y: number }> = {}
    const cornerIdByKey = new Map<string, string>()
    let cornerIdx = 0

    const getCornerId = (p: { x: number; y: number }) => {
      const key = `${p.x.toFixed(3)}|${p.y.toFixed(3)}`
      let id = cornerIdByKey.get(key)
      if (!id) {
        id = `c_${cornerIdx++}`
        cornerIdByKey.set(key, id)
        corners[id] = { x: mToCm(p.x), y: mToCm(p.y) }
      }
      return id
    }

    const fpWalls = store.walls.map(w => {
      const c1 = getCornerId(w.start)
      const c2 = getCornerId(w.end)
      return {
        corner1: c1,
        corner2: c2,
        frontTexture: w.textureDataUrl ? { url: w.textureDataUrl, stretch: true, scale: 0 } : undefined,
        backTexture: w.textureDataUrl ? { url: w.textureDataUrl, stretch: true, scale: 0 } : undefined,
      }
    })

    const floorplan = {
      corners,
      walls: fpWalls,
      wallTextures: [],
      floorTextures: {},
      newFloorTextures: {},
    }

    bp.model.loadSerialized(JSON.stringify({ floorplan, items: [] }))

    // Build BP wall/room → store id maps so selection works in 2D floorplanner
    wallMapRef.current = new Map()
    roomMapRef.current = new Map()

    const bpWalls = bp.model.floorplan.getWalls()
    bpWalls.forEach((bw: any) => {
      const id = mapWallToStoreId(bw, store.walls)
      if (id && bw?.id) {
        wallMapRef.current.set(bw.id, id)
      }
    })

    const bpRoomsForMap = bp.model.floorplan.getRooms()
    bpRoomsForMap.forEach((br: any) => {
      const pts = (br?.corners || []).map((c: any) => ({ x: cmToM(c.x), y: cmToM(c.y) }))
      if (pts.length < 3) return
      const center = polygonCenter(pts)
      let bestId: string | null = null
      let bestDist = Infinity
      store.rooms.forEach(rm => {
        const c = rm.center || polygonCenter(rm.points)
        const d = dist(center, c)
        if (d < bestDist) {
          bestDist = d
          bestId = rm.id
        }
      })
      if (bestId && br?.getUuid) {
        roomMapRef.current.set(br.getUuid(), bestId)
      }
    })

    // Apply wall textures (best-effort)
    bpWalls.forEach((bw: any) => {
      const start = { x: cmToM(bw.getStartX()), y: cmToM(bw.getStartY()) }
      const end = { x: cmToM(bw.getEndX()), y: cmToM(bw.getEndY()) }
      const match = store.walls.find(w => {
        const d1 = dist(start, w.start) + dist(end, w.end)
        const d2 = dist(start, w.end) + dist(end, w.start)
        return Math.min(d1, d2) < 0.05
      })
      if (match?.textureDataUrl) {
        bw.frontTexture = { url: match.textureDataUrl, stretch: true, scale: 0 }
        bw.backTexture = { url: match.textureDataUrl, stretch: true, scale: 0 }
      }
    })

    // Add items from store
    const scene = bp.model.scene
    const THREE = (window as any).THREE
    if (scene && THREE) {
      store.furniture.forEach(f => {
        const opening = f.type === 'door' || f.type === 'window'
        const rawUrl = f.modelUrl || (f.type === 'door' ? DEFAULT_DOOR_MODEL : f.type === 'window' ? DEFAULT_WINDOW_MODEL : '')
        const modelUrl = normalizeModelUrl(rawUrl)
        if (!modelUrl) return

        const meta: any = {
          itemName: f.label || f.type || 'Item',
          resizable: true,
          modelUrl,
          itemType: 1,
          storeId: f.id,
          furnAiId: f.furnAiId,
          mtlUrl: f.mtlUrl,
          __targetDims: {
            w: mToCm(f.dimensions.width || 1),
            h: mToCm(f.dimensions.height || 1),
            d: mToCm(f.dimensions.depth || 1),
          },
        }

        const pos = new THREE.Vector3(mToCm(f.position.x), mToCm(f.position.y || 0), mToCm(f.position.z))
        const rot = f.rotation?.y || 0
        scene.addItem(1, modelUrl, meta, pos, rot, null, false)
      })
    }

    // Apply floor textures by proximity
    const bpRooms = bp.model.floorplan.getRooms()
    bpRooms.forEach((r: any) => {
      const pts = (r.corners || []).map((c: any) => ({ x: cmToM(c.x), y: cmToM(c.y) }))
      if (pts.length < 3) return
      const center = polygonCenter(pts)
      let best: any = null
      let bestDist = Infinity
      store.rooms.forEach(sr => {
        const c = sr.center || polygonCenter(sr.points)
        const d = dist(center, c)
        if (d < bestDist) {
          bestDist = d
          best = sr
        }
      })
      if (best?.textureDataUrl && r.setTexture) {
        r.setTexture(best.textureDataUrl, true, 300)
      }
    })

    requestAnimationFrame(() => {
      syncRef.current = null
    })
  }

  useEffect(() => {
    const bind = (bp: any) => {
      if (!bp) return
      bpRef.current = bp
      setBpReady(true)

      try {
        const THREE = (window as any).THREE
        if (THREE && bp?.three?.scene) {
          bp.three.scene.background = new THREE.Color(0x0b0f14)
        }
      } catch {
        // ignore
      }

      // Wire callbacks
      bp.model.floorplan.fireOnNewWall(scheduleSyncFromBp3d)
      bp.model.floorplan.fireOnNewCorner(scheduleSyncFromBp3d)
      bp.model.floorplan.fireOnRedraw(scheduleSyncFromBp3d)
      bp.model.floorplan.fireOnUpdatedRooms(scheduleSyncFromBp3d)

      const patchItem = (item: any) => {
        if (!item || item.__storePatched) return
        item.__storePatched = true

        const originalClickReleased = item.clickReleased?.bind(item)
        item.clickReleased = () => {
          if (originalClickReleased) originalClickReleased()
          scheduleSyncFromBp3d()
        }

        const originalResize = item.resize?.bind(item)
        if (originalResize) {
          item.resize = (h: number, w: number, d: number) => {
            originalResize(h, w, d)
            scheduleSyncFromBp3d()
          }
        }
      }

      bp.model.scene.itemLoadedCallbacks.add((item: any) => {
        if (!item) return
        if (!item.metadata) item.metadata = {}
        if (!item.metadata.storeId) item.metadata.storeId = genId()
        patchItem(item)

        const target = item.metadata?.__targetDims
        if (target && item.resize) {
          item.resize(target.h, target.w, target.d)
        }
        scheduleSyncFromBp3d()
      })

      bp.model.scene.itemRemovedCallbacks.add(() => scheduleSyncFromBp3d())

      // Selection sync
      bp.three.itemSelectedCallbacks.add((item: any) => {
        const id = item?.metadata?.storeId
        if (id) {
          selectObject(id)
          const tool = activeToolRef.current
          if (tool === 'delete') {
            deleteObject(id)
            setActiveTool('select')
            return
          }
          if (tool === 'label') {
            const current = item?.metadata?.itemName || item?.metadata?.label || ''
            const next = window.prompt('Enter label for this item:', current)
            if (next !== null) {
              updateFurniture(id, { label: next })
              if (item?.metadata) item.metadata.itemName = next
              scheduleSyncFromBp3d()
            }
            setActiveTool('select')
            return
          }
        }
      })
      bp.three.itemUnselectedCallbacks.add(() => selectObject(null))
      bp.three.nothingClicked?.add?.(() => {
        // Avoid clearing 2D selections from the floorplanner
        if (useFloorplanStore.getState().mode === '2d') return
        selectObject(null)
      })

      bp.three.wallClicked.add((wall: any) => {
        console.log('wallClicked triggered with wall:', wall)
        const mapped = wallMapRef.current.get(wall.id)
        console.log('mapped wall id:', mapped)
        if (mapped) {
          console.log('selecting mapped wall:', mapped)
          selectObject(mapped)
          return
        }

        let start: { x: number; y: number } | null = null
        let end: { x: number; y: number } | null = null

        if (wall?.getStartX && wall?.getEndX) {
          start = { x: cmToM(wall.getStartX()), y: cmToM(wall.getStartY()) }
          end = { x: cmToM(wall.getEndX()), y: cmToM(wall.getEndY()) }
        } else if (wall?.getStart && wall?.getEnd) {
          const s = wall.getStart()
          const e = wall.getEnd()
          if (s && e) {
            start = { x: cmToM(s.x), y: cmToM(s.y) }
            end = { x: cmToM(e.x), y: cmToM(e.y) }
          }
        } else if (wall?.wall?.getStartX && wall?.wall?.getEndX) {
          start = { x: cmToM(wall.wall.getStartX()), y: cmToM(wall.wall.getStartY()) }
          end = { x: cmToM(wall.wall.getEndX()), y: cmToM(wall.wall.getEndY()) }
        }

        console.log('extracted start/end:', start, end)

        if (!start || !end) return

        // Ensure store has latest walls from BP3D before matching.
        if (useFloorplanStore.getState().walls.length === 0) {
          console.log('syncing from BP3D')
          syncFromBp3d()
        }

        const storeWalls = useFloorplanStore.getState().walls
        console.log('store walls:', storeWalls)
        let bestId: string | null = null
        let best = Infinity
        storeWalls.forEach(w => {
          const d1 = dist(start, w.start) + dist(end, w.end)
          const d2 = dist(start, w.end) + dist(end, w.start)
          const d = Math.min(d1, d2)
          console.log(`wall ${w.id} distance: ${d}`)
          if (d < best) {
            best = d
            bestId = w.id
          }
        })

        console.log('best matched wall id:', bestId)
        if (bestId) {
          selectObject(bestId)
          return
        }

        // If mapping failed and no store wall is matched, fall back to first wall if any.
        if (storeWalls.length > 0) {
          console.log('falling back to first wall:', storeWalls[0].id)
          selectObject(storeWalls[0].id)
        }
      })

      bp.three.floorClicked.add((room: any) => {
        const rid = room?.getUuid ? room.getUuid() : null
        const mapped = rid ? roomMapRef.current.get(rid) : null
        if (mapped) {
          selectObject(mapped)
          return
        }
        const pts = (room?.corners || []).map((c: any) => ({ x: cmToM(c.x), y: cmToM(c.y) }))
        if (pts.length < 3) return
        const center = polygonCenter(pts)
        const storeRooms = useFloorplanStore.getState().rooms
        let bestId: string | null = null
        let bestDist = Infinity
        storeRooms.forEach(rm => {
          const c = rm.center || polygonCenter(rm.points)
          const d = dist(center, c)
          if (d < bestDist) {
            bestDist = d
            bestId = rm.id
          }
        })
        if (bestId) selectObject(bestId)
      })

      applyStoreToBp3d()
    }

    ;(window as any).__BP3D_READY__ = bind

    if ((window as any).__BP3D_INSTANCE__) {
      bind((window as any).__BP3D_INSTANCE__)
    }

    return () => {
      if ((window as any).__BP3D_READY__) delete (window as any).__BP3D_READY__
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize BP3D once scripts are ready
  useEffect(() => {
    if (!scriptsReady) return
    const init = (window as any).__BP3D_INIT__
    if (init) {
      const bp = init(
        {
          floorplannerElement: 'floorplanner-canvas',
          threeElement: '#viewer',
          threeCanvasElement: 'three-canvas',
          textureDir: 'models/textures/',
          widget: false,
        },
        { loadSample: false }
      )
      if (bp?.model?.loadSerialized) {
        bp.model.loadSerialized(EMPTY_SERIALIZED)
      }
    }
  }, [scriptsReady])

  // Sync store -> BP3D when external updates occur
  useEffect(() => {
    if (!bpReady) return
    const unsub = useFloorplanStore.subscribe(
      s => [s.walls, s.rooms, s.furniture],
      () => {
        if (syncRef.current === 'bp3d') return
        applyStoreToBp3d()
      },
      { equalityFn: shallow }
    )
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpReady])

  // Keep BP3D selection in sync with store selection
  useEffect(() => {
    if (!bpReady) return
    const bp = bpRef.current
    const controller = bp?.three?.getController?.()
    if (!controller) return
    const items = bp?.model?.scene?.getItems?.() || []
    const item = items.find((it: any) => it?.metadata?.storeId === selectedId) || null
    controller.setSelectedObject(item)
  }, [bpReady, selectedId])

  // 2D floorplanner click → store selection (walls/rooms) for calibration + edit tools
  useEffect(() => {
    if (!bpReady) return
    const bp = bpRef.current
    const fp = bp?.floorplanner
    const $ = (window as any).$
    if (!fp || !$) return
    const $canvas = fp.canvasElement || $('#floorplanner-canvas')
    if (!$canvas || !$canvas.length) return

    const ensureStoreSync = () => {
      const s = useFloorplanStore.getState()
      if (s.walls.length === 0 && bpRef.current?.model?.floorplan?.getWalls?.()?.length) {
        syncFromBp3d()
      }
    }

    const handleClick = (e: MouseEvent) => {
      ensureStoreSync()
      const store = useFloorplanStore.getState()
      if (store.mode !== '2d') return
      const tool = store.activeTool
      if (tool === 'wall' || tool === 'floor' || tool === 'delete') return

      const offset = $canvas.offset()
      if (!offset) return
      const mouseXcm = (e.clientX - offset.left) * fp.cmPerPixel + fp.originX * fp.cmPerPixel
      const mouseYcm = (e.clientY - offset.top) * fp.cmPerPixel + fp.originY * fp.cmPerPixel

      // Prefer active wall if available (floorplanner hover state)
      const fpWall = fp.activeWall || fp.floorplan?.overlappedWall?.(mouseXcm, mouseYcm)
      if (fpWall) {
        const mapped = wallMapRef.current.get(fpWall.id)
        const id = mapped || mapWallToStoreId(fpWall, store.walls)
        if (id) {
          selectObject(id)
          return
        }
      }

      // Fallback: nearest wall by distance to segment
      const point = { x: cmToM(mouseXcm), y: cmToM(mouseYcm) }
      let nearestWallId: string | null = null
      let nearestWallDist = Infinity
      store.walls.forEach(w => {
        const d = distPointToSegment(point, w.start, w.end)
        if (d < nearestWallDist) {
          nearestWallDist = d
          nearestWallId = w.id
        }
      })
      if (nearestWallId && nearestWallDist < 0.2) {
        selectObject(nearestWallId)
        return
      }

      // Rooms (point-in-polygon)
      const room = store.rooms.find(r => pointInPolygon(point, r.points))
      if (room) {
        selectObject(room.id)
        return
      }

      selectObject(null)
    }

    const handleHover = (e: MouseEvent) => {
      ensureStoreSync()
      const store = useFloorplanStore.getState()
      if (store.mode !== '2d') return
      if (store.activeTool !== 'ruler') return

      let pickedWallId: string | null = null

      // Use floorplanner hover wall when available
      const wall = fp.activeWall
      if (wall) {
        const mapped = wallMapRef.current.get(wall.id)
        pickedWallId = mapped || mapWallToStoreId(wall, store.walls)
      }

      // Fallback: nearest wall to cursor (for some imported template cases)
      if (!pickedWallId) {
        const offset = $canvas.offset()
        if (offset) {
          const mouseXcm = (e.clientX - offset.left) * fp.cmPerPixel + fp.originX * fp.cmPerPixel
          const mouseYcm = (e.clientY - offset.top) * fp.cmPerPixel + fp.originY * fp.cmPerPixel
          const point = { x: cmToM(mouseXcm), y: cmToM(mouseYcm) }

          let nearestWallId: string | null = null
          let nearestWallDist = Infinity
          store.walls.forEach(w => {
            const d = distPointToSegment(point, w.start, w.end)
            if (d < nearestWallDist) {
              nearestWallDist = d
              nearestWallId = w.id
            }
          })

          if (nearestWallId && nearestWallDist < 0.3) {
            pickedWallId = nearestWallId
          }
        }
      }

      if (pickedWallId && store.selectedId !== pickedWallId) {
        selectObject(pickedWallId)
      }
    }

    $canvas.on('mouseup.storeSelect', handleClick)
    $canvas.on('mousemove.storeSelect', handleHover)
    return () => {
      $canvas.off('mouseup.storeSelect', handleClick)
      $canvas.off('mousemove.storeSelect', handleHover)
    }
  }, [bpReady, selectObject])

  // Map mode/tool to BP3D UI
  useEffect(() => {
    if (!bpReady) return
    const $ = (window as any).$
    const BP3D = (window as any).BP3D
    const fp = bpRef.current?.floorplanner
    const controller = bpRef.current?.three?.getController?.()

    if ($) {
      if (mode === '2d') {
        $('#floorplan_tab').click()
      } else {
        $('#design_tab').click()
      }
    }

    if (mode === '2d' && fp && BP3D?.Floorplanner?.floorplannerModes) {
      if (activeTool === 'wall') fp.setMode(BP3D.Floorplanner.floorplannerModes.DRAW)
      else if (activeTool === 'delete') fp.setMode(BP3D.Floorplanner.floorplannerModes.DELETE)
      else fp.setMode(BP3D.Floorplanner.floorplannerModes.MOVE)
    }

    // Handle 3D design mode tools
    if (mode === '3d' && controller) {
      // For 3D mode, we need to manage controller state based on activeTool
      // Note: Blueprint3D controller handles basic interactions automatically,
      // but we can influence behavior through tool state
      if (activeTool === 'rotate' && controller.rotatePressed) {
        // Enable rotation mode
        controller.rotatePressed()
      } else if (activeTool === 'move') {
        // Default move/drag behavior is handled automatically by controller
        // when items are selected
      } else if (activeTool === 'resize') {
        // Resize is typically handled by item-specific drag handles
        // when items are selected
      } else if (activeTool === 'label') {
        // Label tool might need custom implementation
        // Could show/hide label editing UI
      } else if (activeTool === 'ruler') {
        // Ruler tool might need custom implementation
        // Could enable measurement mode
      } else if (activeTool === 'select') {
        // Default selection mode
      }
    }
  }, [bpReady, mode, activeTool])

  return (
    <div className="flex-1 h-full w-full overflow-hidden bg-transparent">
      <FurnAIAssetsManager />
      <link href="/css/bootstrap.css" rel="stylesheet" />
      <link href="/css/room-designer-embed.css" rel="stylesheet" />

      <Script src="/js/jquery.js" strategy="afterInteractive" />
      <Script src="/js/bootstrap.js" strategy="afterInteractive" />
      <Script src="/js/three.min.js" strategy="afterInteractive" />
      <Script src="/js/gltf-compat.js" strategy="afterInteractive" />
      <Script src="/js/GLTFLoader.js" strategy="afterInteractive" />
      <Script src="/js/MTLLoader.js" strategy="afterInteractive" />
      <Script src="/js/OBJLoader.js" strategy="afterInteractive" />
      <Script src="/js/OBJMTLLoader.js" strategy="afterInteractive" />
      <Script src="/js/blueprint3d.js" strategy="afterInteractive" />
      <Script src="/js/items.js" strategy="afterInteractive" />
      <Script
        src="/js/example.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsReady(true)}
      />

      {testGLB && mode === '3d' && (
        <Suspense fallback={null}>
          <GLBOverlay />
        </Suspense>
      )}
      <div className="bp3d-root h-full">
        <div className="container-fluid h-full">
          <div className="row main-row h-full">
            <div style={{ display: 'none' }}>
              <ul className="nav nav-sidebar">
                <li id="floorplan_tab"><a href="#">Edit Floorplan<span className="glyphicon glyphicon-chevron-right pull-right"></span></a></li>
                <li id="design_tab"><a href="#">Design<span className="glyphicon glyphicon-chevron-right pull-right"></span></a></li>
                <li id="items_tab"><a href="#">Add Items<span className="glyphicon glyphicon-chevron-right pull-right"></span></a></li>
              </ul>

              <div id="context-menu">
                <div style={{ margin: '0 20px' }}>
                  <span id="context-menu-name" className="lead"></span>
                  <br /><br />
                  <button className="btn btn-block btn-danger" id="context-menu-delete">
                    <span className="glyphicon glyphicon-trash"></span>
                    Delete Item
                  </button>
                  <br />
                  <div className="panel panel-default">
                    <div className="panel-heading">Adjust Size</div>
                    <div className="panel-body" style={{ color: '#333333' }}>
                      <div className="form form-horizontal" style={{ fontSize: '1.1em' }}>
                        <div className="form-group">
                          <label className="col-sm-5 control-label">Width</label>
                          <div className="col-sm-6">
                            <input type="number" className="form-control" id="item-width" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="col-sm-5 control-label">Depth</label>
                          <div className="col-sm-6">
                            <input type="number" className="form-control" id="item-depth" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="col-sm-5 control-label">Height</label>
                          <div className="col-sm-6">
                            <input type="number" className="form-control" id="item-height" />
                          </div>
                        </div>
                      </div>
                      <small><span className="text-muted">Measurements in inches.</span></small>
                    </div>
                  </div>
                  <label><input type="checkbox" id="fixed" /> Lock in place</label>
                  <br /><br />
                </div>
              </div>

              <div id="floorTexturesDiv" style={{ display: 'none', padding: '0 20px' }}>
                <div className="panel panel-default">
                  <div className="panel-heading">Adjust Floor</div>
                  <div className="panel-body" style={{ color: '#333333' }}>
                    <div className="col-sm-6" style={{ padding: '3px' }}>
                      <a href="#" className="thumbnail texture-select-thumbnail" data-texture-url="rooms/textures/light_fine_wood.jpg" data-texture-stretch="false" data-texture-scale="300">
                        <img alt="Thumbnail light fine wood" src="rooms/thumbnails/thumbnail_light_fine_wood.jpg" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div id="wallTextures" style={{ display: 'none', padding: '0 20px' }}>
                <div className="panel panel-default">
                  <div className="panel-heading">Adjust Wall</div>
                  <div className="panel-body" style={{ color: '#333333' }}>
                    <div className="col-sm-6" style={{ padding: '3px' }}>
                      <a href="#" className="thumbnail texture-select-thumbnail" data-texture-url="rooms/textures/marbletiles.jpg" data-texture-stretch="false" data-texture-scale="300">
                        <img alt="Thumbnail marbletiles" src="rooms/thumbnails/thumbnail_marbletiles.jpg" />
                      </a>
                    </div>
                    <div className="col-sm-6" style={{ padding: '3px' }}>
                      <a href="#" className="thumbnail texture-select-thumbnail" data-texture-url="rooms/textures/wallmap_yellow.png" data-texture-stretch="true" data-texture-scale="">
                        <img alt="Thumbnail wallmap yellow" src="rooms/thumbnails/thumbnail_wallmap_yellow.png" />
                      </a>
                    </div>
                    <div className="col-sm-6" style={{ padding: '3px' }}>
                      <a href="#" className="thumbnail texture-select-thumbnail" data-texture-url="rooms/textures/light_brick.jpg" data-texture-stretch="false" data-texture-scale="100">
                        <img alt="Thumbnail light brick" src="rooms/thumbnails/thumbnail_light_brick.jpg" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xs-12 main">
              <div id="viewer">
                <div id="camera-controls">
                  <a href="#" className="btn btn-default bottom" id="zoom-out"><span className="glyphicon glyphicon-zoom-out"></span></a>
                  <a href="#" className="btn btn-default bottom" id="reset-view"><span className="glyphicon glyphicon glyphicon-home"></span></a>
                  <a href="#" className="btn btn-default bottom" id="zoom-in"><span className="glyphicon glyphicon-zoom-in"></span></a>
                  <span>&nbsp;</span>
                  <a className="btn btn-default bottom" href="#" id="move-left"><span className="glyphicon glyphicon-arrow-left"></span></a>
                  <span className="btn-group-vertical">
                    <a className="btn btn-default" href="#" id="move-up"><span className="glyphicon glyphicon-arrow-up"></span></a>
                    <a className="btn btn-default" href="#" id="move-down"><span className="glyphicon glyphicon-arrow-down"></span></a>
                  </span>
                  <a className="btn btn-default bottom" href="#" id="move-right"><span className="glyphicon glyphicon-arrow-right"></span></a>
                </div>

                <div id="loading-modal">
                  <h1>Loading...</h1>
                </div>
              </div>

              <div id="floorplanner">
                <canvas id="floorplanner-canvas"></canvas>
                <div id="floorplanner-controls">
                  <button id="move" className="btn btn-sm btn-default">
                    <span className="glyphicon glyphicon-move"></span>
                    Move Walls
                  </button>
                  <button id="draw" className="btn btn-sm btn-default">
                    <span className="glyphicon glyphicon-pencil"></span>
                    Draw Walls
                  </button>
                  <button id="delete" className="btn btn-sm btn-default">
                    <span className="glyphicon glyphicon-remove"></span>
                    Delete Walls
                  </button>
                  <span className="pull-right">
                    <button className="btn btn-primary btn-sm" id="update-floorplan">Done &raquo;</button>
                  </span>
                </div>
                <div id="draw-walls-hint">Press the &quot;Esc&quot; key to stop drawing walls</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
