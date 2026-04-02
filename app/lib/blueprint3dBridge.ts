/**
 * Blueprint3D Bridge - Synchronization layer between Blueprint3D editor and Zustand store
 * 
 * This module provides bidirectional synchronization between:
 * - Blueprint3D JavaScript instance (running in iframe/embedded)
 * - Zustand floorplan store (React state management)
 * 
 * Purpose:
 * - Listen to Blueprint3D events (items added, walls changed, floors updated)
 * - Sync changes to floorplan store
 * - Allow store to update Blueprint3D when needed
 * - Maintain two-way consistency between 3D scene and application state
 */

import { useFloorplanStore, Wall, FurnItem, Room } from '@/store/floorplanStore'

// Blueprint3D event types
interface Bp3dEvent extends Event {
  item?: Record<string, unknown>
  wall?: Record<string, unknown>
  itemId?: string
  wallId?: string
  roomId?: string
  floorId?: string
  position?: Record<string, number>
  rotation?: Record<string, number>
  dimensions?: Record<string, number>
  updates?: Record<string, unknown>
}

// Blueprint3D instance type
interface Bp3dInstance {
  model?: {
    addEventListener?: (eventName: string, handler: (e: Bp3dEvent) => void) => void
    items?: Record<string, unknown>[]
    walls?: Record<string, unknown>[]
    rooms?: Record<string, unknown>[]
    floorTextures?: Record<string, unknown>
    newFloorTextures?: Record<string, unknown>
  }
}

/**
 * Initialize Blueprint3D event listeners and sync mechanisms
 * Call this once when Blueprint3D instance is ready
 */
export function initBlueprint3DBridge(bp3dInstance: Bp3dInstance): void {
  if (!bp3dInstance || !bp3dInstance.model) {
    console.warn('Blueprint3D instance not properly initialized')
    return
  }

  // Attach event listeners to Blueprint3D
  attachEventListeners(bp3dInstance)
  console.log('Blueprint3D bridge initialized')
}

/**
 * Attach listeners to all Blueprint3D events that affect the scene
 */
function attachEventListeners(bp3dInstance: Bp3dInstance): void {
  const model = bp3dInstance.model
  if (!model) return

  // ===== ITEM EVENTS =====
  // Item creation
  if (model.addEventListener) {
    model.addEventListener('itemAdded', (event: Bp3dEvent) => {
      handleItemAdded(event)
    })
    model.addEventListener('itemRemoved', (event: Bp3dEvent) => {
      handleItemRemoved(event)
    })
    model.addEventListener('itemMoved', (event: Bp3dEvent) => {
      handleItemMoved(event)
    })
    model.addEventListener('itemRotated', (event: Bp3dEvent) => {
      handleItemRotated(event)
    })
    model.addEventListener('itemScaled', (event: Bp3dEvent) => {
      handleItemScaled(event)
    })

    // ===== WALL EVENTS =====
    model.addEventListener('wallAdded', (event: Bp3dEvent) => {
      handleWallAdded(event)
    })
    model.addEventListener('wallRemoved', (event: Bp3dEvent) => {
      handleWallRemoved(event)
    })
    model.addEventListener('wallModified', (event: Bp3dEvent) => {
      handleWallModified(event)
    })

    // ===== FLOOR EVENTS =====
    model.addEventListener('floorModified', (event: Bp3dEvent) => {
      handleFloorModified(event)
    })
  }
}

/**
 * ===== ITEM EVENT HANDLERS =====
 */

function handleItemAdded(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const item = event.item

  // Don't add if already exists to avoid duplicates
  if (store.furniture.some(f => f.id === item?.id as string)) return

  const furnItem: FurnItem = {
    id: (item?.id as string) || `furn_${Date.now()}_${Math.random()}`,
    type: (item?.type as string) || 'furniture',
    position: {
      x: (item?.position as Record<string, number>)?.x || 0,
      y: (item?.position as Record<string, number>)?.y || 0,
      z: (item?.position as Record<string, number>)?.z || 0
    },
    rotation: {
      x: (item?.rotation as Record<string, number>)?.x || 0,
      y: (item?.rotation as Record<string, number>)?.y || 0,
      z: (item?.rotation as Record<string, number>)?.z || 0
    },
    dimensions: {
      width: (item?.dimensions as Record<string, number>)?.width || 1,
      height: (item?.dimensions as Record<string, number>)?.height || 1,
      depth: (item?.dimensions as Record<string, number>)?.depth || 1
    },
    modelUrl: item?.modelUrl as string,
    mtlUrl: item?.mtlUrl as string,
    furnAiId: item?.furnAiId as string,
    label: (item?.label as string) || (item?.name as string)
  }

  store.addFurniture(furnItem.type, furnItem.position)
  console.log('Item added via Blueprint3D:', furnItem.id)
}

function handleItemRemoved(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const itemId = event.itemId

  if (itemId && store.furniture.some(f => f.id === itemId)) {
    store.deleteObject(itemId)
    console.log('Item removed via Blueprint3D:', itemId)
  }
}

function handleItemMoved(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const itemId = event.itemId
  const newPos = event.position

  if (itemId) {
    store.updateFurniturePosition(itemId, {
      x: newPos?.x,
      y: newPos?.y,
      z: newPos?.z
    })
    console.log('Item moved via Blueprint3D:', itemId)
  }
}

function handleItemRotated(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const itemId = event.itemId
  const newRotation = event.rotation

  if (itemId) {
    store.updateFurniture(itemId, {
      rotation: {
        x: newRotation?.x || 0,
        y: newRotation?.y || 0,
        z: newRotation?.z || 0
      }
    })
    console.log('Item rotated via Blueprint3D:', itemId)
  }
}

function handleItemScaled(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const itemId = event.itemId
  const newDimensions = event.dimensions

  if (itemId) {
    store.updateFurniture(itemId, {
      dimensions: {
        width: newDimensions?.width || 1,
        height: newDimensions?.height || 1,
        depth: newDimensions?.depth || 1
      }
    })
    console.log('Item scaled via Blueprint3D:', itemId)
  }
}

/**
 * ===== WALL EVENT HANDLERS =====
 */

function handleWallAdded(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const wall = event.wall

  // Don't add if already exists
  if (store.walls.some(w => w.id === wall?.id as string)) return

  const wallStart = (wall?.start as { x: number; y: number } | undefined) || { x: 0, y: 0 }
  const wallEnd = (wall?.end as { x: number; y: number } | undefined) || { x: 1, y: 0 }

  const newWall: Wall = {
    id: (wall?.id as string) || `wall_${Date.now()}_${Math.random()}`,
    start: wallStart,
    end: wallEnd,
    thickness: (wall?.thickness as number) || 0.15,
    height: (wall?.height as number) || 2.5,
    label: wall?.label as string | undefined,
    color: wall?.color as string | undefined,
    textureDataUrl: wall?.textureDataUrl as string | undefined,
    textureTileWidthM: wall?.textureTileWidthM as number | undefined,
    textureTileHeightM: wall?.textureTileHeightM as number | undefined,
    pbrNormalUrl: wall?.pbrNormalUrl as string | undefined,
    pbrRoughnessUrl: wall?.pbrRoughnessUrl as string | undefined,
    pbrAoUrl: wall?.pbrAoUrl as string | undefined,
    pbrMetalnessUrl: wall?.pbrMetalnessUrl as string | undefined
  }

  // Manually add to store
  useFloorplanStore.setState((state) => {
    state.walls.push(newWall)
  })
  console.log('Wall added via Blueprint3D:', newWall.id)
}

function handleWallRemoved(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const wallId = event.wallId

  if (wallId && store.walls.some(w => w.id === wallId)) {
    store.deleteObject(wallId)
    console.log('Wall removed via Blueprint3D:', wallId)
  }
}

function handleWallModified(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const wallId = event.wallId
  const updates = event.updates

  if (wallId && updates) {
    store.updateWall(wallId, updates as Partial<Wall>)
    console.log('Wall modified via Blueprint3D:', wallId)
  }
}

/**
 * ===== FLOOR EVENT HANDLERS =====
 */

function handleFloorModified(event: Bp3dEvent): void {
  const store = useFloorplanStore.getState()
  const roomId = event.roomId || event.floorId
  const updates = event.updates

  if (roomId && updates) {
    store.updateRoom(roomId, updates as Partial<Room>)
    console.log('Floor/Room modified via Blueprint3D:', roomId)
  }
}

/**
 * ===== REVERSE SYNC (Store → Blueprint3D) =====
 * These functions allow store actions to update Blueprint3D
 */

/**
 * Sync a furniture item to Blueprint3D (create or update)
 */
export function syncFurnitureToBlueprint3D(
  bp3dInstance: Bp3dInstance,
  furniture: FurnItem
): void {
  if (!bp3dInstance || !bp3dInstance.model) return

  const { model } = bp3dInstance
  
  // Check if item exists in Blueprint3D
  const existingItem = model.items?.find((item: Record<string, unknown>) => item.id === furniture.id)

  if (existingItem) {
    // Update existing item
    existingItem.position = furniture.position
    existingItem.rotation = furniture.rotation
    existingItem.dimensions = furniture.dimensions
    existingItem.label = furniture.label
    existingItem.modelUrl = furniture.modelUrl
  } else {
    // Add new item
    const newItem = {
      id: furniture.id,
      type: furniture.type,
      position: furniture.position,
      rotation: furniture.rotation,
      dimensions: furniture.dimensions,
      modelUrl: furniture.modelUrl,
      mtlUrl: furniture.mtlUrl,
      label: furniture.label
    }
    model.items?.push(newItem)
  }
}

/**
 * Sync a wall to Blueprint3D (create or update)
 */
export function syncWallToBlueprint3D(
  bp3dInstance: Bp3dInstance,
  wall: Wall
): void {
  if (!bp3dInstance || !bp3dInstance.model) return

  const { model } = bp3dInstance
  
  // Check if wall exists in Blueprint3D
  const existingWall = model.walls?.find((w: Record<string, unknown>) => w.id === wall.id)

  if (existingWall) {
    // Update existing wall
    existingWall.start = wall.start
    existingWall.end = wall.end
    existingWall.thickness = wall.thickness
    existingWall.height = wall.height
    existingWall.label = wall.label
    existingWall.color = wall.color
    existingWall.textureDataUrl = wall.textureDataUrl
  } else {
    // Add new wall
    const newWall = {
      id: wall.id,
      start: wall.start,
      end: wall.end,
      thickness: wall.thickness,
      height: wall.height,
      label: wall.label,
      color: wall.color,
      textureDataUrl: wall.textureDataUrl
    }
    model.walls?.push(newWall)
  }
}

/**
 * Sync a room/floor to Blueprint3D (create or update)
 */
export function syncRoomToBlueprint3D(
  bp3dInstance: Bp3dInstance,
  room: Room
): void {
  if (!bp3dInstance || !bp3dInstance.model) return

  const { model } = bp3dInstance
  
  // Check if room exists in Blueprint3D
  const existingRoom = model.rooms?.find((r: Record<string, unknown>) => r.id === room.id)

  if (existingRoom) {
    // Update existing room
    existingRoom.points = room.points
    existingRoom.center = room.center
    existingRoom.color = room.color
    existingRoom.textureDataUrl = room.textureDataUrl
  } else {
    // Add new room
    const newRoom = {
      id: room.id,
      name: room.name,
      points: room.points,
      color: room.color,
      center: room.center,
      textureDataUrl: room.textureDataUrl
    }
    model.rooms?.push(newRoom)
  }
}

/**
 * Full scene sync from Blueprint3D → Store
 * Useful on load or explicit sync
 */
export function syncFullSceneFromBlueprint3D(bp3dInstance: Bp3dInstance): void {
  if (!bp3dInstance || !bp3dInstance.model) return

  const { model } = bp3dInstance
  const store = useFloorplanStore.getState()

  // Sync all walls
  const walls: Wall[] = (model.walls || []).map((w: Record<string, unknown>) => ({
    id: w.id as string,
    start: (w.start as { x: number; y: number }) || { x: 0, y: 0 },
    end: (w.end as { x: number; y: number }) || { x: 1, y: 0 },
    thickness: (w.thickness as number) || 0.15,
    height: (w.height as number) || 2.5,
    label: w.label as string | undefined,
    color: w.color as string | undefined,
    textureDataUrl: w.textureDataUrl as string | undefined,
    textureTileWidthM: w.textureTileWidthM as number | undefined,
    textureTileHeightM: w.textureTileHeightM as number | undefined,
    pbrNormalUrl: w.pbrNormalUrl as string | undefined,
    pbrRoughnessUrl: w.pbrRoughnessUrl as string | undefined,
    pbrAoUrl: w.pbrAoUrl as string | undefined,
    pbrMetalnessUrl: w.pbrMetalnessUrl as string | undefined
  }))

  // Sync all furniture items
  const furniture: FurnItem[] = (model.items || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    type: (item.type as string) || 'furniture',
    position: (item.position as { x: number; y: number; z: number }) || { x: 0, y: 0, z: 0 },
    rotation: (item.rotation as { x: number; y: number; z: number }) || { x: 0, y: 0, z: 0 },
    dimensions: (item.dimensions as { width: number; height: number; depth: number }) || { width: 1, height: 1, depth: 1 },
    modelUrl: item.modelUrl as string | undefined,
    mtlUrl: item.mtlUrl as string | undefined,
    furnAiId: item.furnAiId as string | undefined,
    label: (item.label as string) || (item.name as string | undefined)
  }))

  // Sync all rooms/floors
  const rooms: Room[] = (model.rooms || []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: (r.name as string) || 'Room',
    points: (r.points as { x: number; y: number }[]) || [],
    color: (r.color as string) || '#fbbf24',
    center: (r.center as { x: number; y: number }) || { x: 0, y: 0 },
    textureDataUrl: r.textureDataUrl as string | undefined,
    textureTileWidthM: r.textureTileWidthM as number | undefined,
    textureTileHeightM: r.textureTileHeightM as number | undefined,
    pbrNormalUrl: r.pbrNormalUrl as string | undefined,
    pbrRoughnessUrl: r.pbrRoughnessUrl as string | undefined,
    pbrAoUrl: r.pbrAoUrl as string | undefined,
    pbrMetalnessUrl: r.pbrMetalnessUrl as string | undefined
  }))

  // Replace the entire scene in the store
  store.replaceScene({
    walls,
    rooms,
    furniture,
    labels: store.labels // Keep existing labels for now
  })

  console.log(`Scene synced from Blueprint3D: ${walls.length} walls, ${furniture.length} items, ${rooms.length} rooms`)
}

/**
 * Export full scene from Blueprint3D as serializable format
 */
export function exportSceneFromBlueprint3D(bp3dInstance: Bp3dInstance): Record<string, unknown> | null {
  if (!bp3dInstance || !bp3dInstance.model) return null

  const { model } = bp3dInstance

  return {
    walls: model.walls || [],
    items: model.items || [],
    rooms: model.rooms || [],
    floorTextures: model.floorTextures || {},
    newFloorTextures: model.newFloorTextures || {}
  }
}
