// Three.js rendering adapter
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { RenderingAdapter } from '../adapter';
import { Command, HomeDefinition, CommandType, Point3D, RenderEngineType, FurnitureDefinition, UUID, AdapterResponse, SyncState } from '../types';

// Minimal catalog for 3D geometry mapping. Expansion possible.
const CATALOG: Record<string, { width: number; depth: number; height: number; color: number }> = {
  chair: { width: 1, depth: 1, height: 1, color: 0x1f77b4 },
  table: { width: 1.5, depth: 1.5, height: 0.75, color: 0x8c564b },
  sofa: { width: 2, depth: 1, height: 0.9, color: 0x2ca02c },
  bed: { width: 2, depth: 1.5, height: 0.6, color: 0x9467bd },
  cabinet: { width: 1, depth: 0.5, height: 2, color: 0x7f7f7f },
  default: { width: 1, depth: 1, height: 1, color: 0x808080 },
};

/**
 * Three.js adapter implementation for 3D rendering
 * Converts command bus operations to Three.js geometry and scene operations
 */
export class ThreeJSAdapter extends RenderingAdapter {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;

  // 3D object references for updates
  private wallMeshes = new Map<string, THREE.Mesh>();
  private furnitureMeshes = new Map<string, THREE.Mesh>();
  private roomMeshes = new Map<string, THREE.Mesh>();

  constructor(engineType: RenderEngineType) {
    super(engineType);
  }

  async initialize(container: string | HTMLElement): Promise<AdapterResponse<void>> {
    try {
      // Initialize home if not already done
      if (!this.home) {
        this.home = {
          id: uuidv4() as UUID,
          name: 'Three.js Room',
          walls: [],
          furniture: [],
          rooms: [],
          dimensions: [],
          environment: {
            lightColor: '#ffffff',
            lightIntensity: 1.0,
            backgroundColor: '#f0f0f0',
          },
          camera: {
            position: { x: 0, y: 10, z: 15 },
            target: { x: 0, y: 0, z: 0 },
            zoom: 1,
          },
        };
      }

      // Get the container element
      const element = typeof container === 'string' 
        ? document.getElementById(container)
        : container;
      
      if (!element) {
        return { success: false, error: 'Container element not found' };
      }

      const canvas = element as HTMLCanvasElement || document.createElement('canvas');
      
      // Ensure canvas is properly set up
      if (!canvas || (canvas.clientWidth === 0 && canvas.clientHeight === 0)) {
        canvas.width = 1024;
        canvas.height = 768;
      }

      this.canvas = canvas;
      // Scene setup
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xcccccc);

      // Camera setup
      this.camera = new THREE.PerspectiveCamera(
        75,
        (this.canvas?.clientWidth || 1024) / (this.canvas?.clientHeight || 768),
        0.1,
        1000,
      );
      this.updateCameraPosition();

      // Renderer setup - ensure canvas context can be obtained
      this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas, alpha: true });
      this.renderer.setSize(this.canvas?.clientWidth || 1024, this.canvas?.clientHeight || 768);
      this.renderer.shadowMap.enabled = true;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 15, 10);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.far = 100;
      this.scene.add(directionalLight);

      // Ground plane
      const groundGeometry = new THREE.PlaneGeometry(50, 50);
      const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.receiveShadow = true;
      ground.rotation.x = -Math.PI / 2;
      this.scene.add(ground);

      // Start render loop
      this.startRenderLoop();

      this.syncStatus = { state: 'synced' as any, pendingCommands: [], errors: [] };
      this.emit('initialized', {});
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Three.js initialization failed: ${message}` };
    }
  }

  private startRenderLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate);

      if (this.renderer && this.camera && this.scene) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }

  private updateCameraPosition(): void {
    if (!this.camera || !this.home || !this.home.camera) return;

    const { position } = this.home.camera;
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(
      this.home.camera.target.x,
      this.home.camera.target.y,
      this.home.camera.target.z,
    );
  }

  async loadHome(home: HomeDefinition): Promise<AdapterResponse<HomeDefinition>> {
    this.home = JSON.parse(JSON.stringify(home)); // Deep copy

    if (!this.home) return { success: false, error: 'Failed to copy home' };

    // Clear existing meshes
    this.wallMeshes.clear();
    this.furnitureMeshes.clear();
    this.roomMeshes.clear();

    if (!this.scene) return { success: false, error: 'Scene not initialized' };

    // Remove previous objects
    const toRemove: THREE.Object3D[] = [];
    this.scene.traverse((obj) => {
      if (obj !== this.scene && obj.userData.type) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach((obj) => this.scene?.remove(obj));

    // Create walls
    for (const wall of this.home.walls) {
      this.createWall3D(wall);
    }

    // Create furniture
    for (const item of this.home.furniture) {
      this.createFurniture3D(item);
    }

    // Create rooms
    for (const room of this.home.rooms) {
      this.createRoom3D(room);
    }

    this.updateCameraPosition();
    this.syncStatus = {
      state: SyncState.SYNCED,
      pendingCommands: [],
      errors: [],
    };
    return { success: true, data: this.home };
  }

  private createWall3D(wall: any): void {
    if (!this.scene) return;

    const start = wall.startPoint;
    const end = wall.endPoint;

    // Calculate wall dimensions
    const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Create wall geometry
    const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);
    const material = new THREE.MeshLambertMaterial({ color: 0xccaa99 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Position: center of wall at midpoint, raised by half height
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    mesh.position.set(midX, wall.height / 2, midY);
    mesh.rotation.y = angle;

    // Store reference
    mesh.userData = { type: 'wall', id: wall.id };
    this.wallMeshes.set(wall.id, mesh);

    this.scene.add(mesh);
  }

  private createFurniture3D(furniture: FurnitureDefinition): void {
    if (!this.scene) return;

    const { position, rotation = 0, scale = 1 } = furniture;

    let width = furniture.width || 1;
    let depth = furniture.depth || 1;
    let height = furniture.height || 1;
    let color = 0x808080;

    const catalogEntry = CATALOG[furniture.catalogId?.toLowerCase() || ''] || CATALOG.default;
    if (catalogEntry) {
      width = furniture.width || catalogEntry.width;
      depth = furniture.depth || catalogEntry.depth;
      height = furniture.height || catalogEntry.height;
      color = catalogEntry.color;
    }

    const geometry = new THREE.BoxGeometry(width * scale, height * scale, depth * scale);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.position.set(position.x, (height * scale) / 2, position.z || position.y || 0);
    mesh.rotation.y = (rotation * Math.PI) / 180;

    mesh.userData = { type: 'furniture', id: furniture.id };
    this.furnitureMeshes.set(furniture.id, mesh);

    this.scene.add(mesh);
  }

  private createRoom3D(room: any): void {
    if (!this.scene) return;

    // For visualization, create a floor plane for the room
    // This is simplified - in production you'd compute actual room geometry from walls
    const floorColor = new THREE.Color();
    floorColor.setHSL(Math.random(), 0.7, 0.4);

    // Use room area to estimate floor size (simplified)
    const area = room.wallIds?.length || 1;
    const floorSize = Math.sqrt(area) * 3;

    const geometry = new THREE.PlaneGeometry(floorSize, floorSize);
    const material = new THREE.MeshLambertMaterial({
      color: floorColor,
      transparent: true,
      opacity: 0.3,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.01; // Slightly above ground to avoid z-fighting

    mesh.userData = { type: 'room', id: room.id };
    this.roomMeshes.set(room.id, mesh);

    this.scene.add(mesh);
  }

  async executeCommand(command: Command): Promise<AdapterResponse<any>> {
    if (!this.home) return { success: false, error: 'Home not loaded' };

    switch (command.type) {
      case CommandType.CREATE_WALL: {
        const wall = command.payload as any;
        this.home.walls.push(wall);
        this.createWall3D(wall);
        this.emit('wall-created', { wallId: wall.id });
        break;
      }

      case CommandType.UPDATE_WALL: {
        const { wallId, updates } = command.payload as any;
        const wall = this.home.walls.find((w) => w.id === wallId);
        if (wall) {
          Object.assign(wall, updates);
          const mesh = this.wallMeshes.get(wallId);
          if (mesh) this.scene?.remove(mesh);
          this.createWall3D(wall);
        }
        break;
      }

      case CommandType.DELETE_WALL: {
        const wallId = command.payload as any;
        this.home.walls = this.home.walls.filter((w) => w.id !== wallId);
        const mesh = this.wallMeshes.get(wallId);
        if (mesh) this.scene?.remove(mesh);
        this.wallMeshes.delete(wallId);
        break;
      }

      case CommandType.CREATE_FURNITURE: {
        const furniture = command.payload as any;
        this.home.furniture.push(furniture);
        this.createFurniture3D(furniture);
        this.emit('furniture-created', { furnitureId: furniture.id });
        break;
      }

      case CommandType.UPDATE_FURNITURE: {
        const { furnitureId, updates } = command.payload as any;
        const item = this.home.furniture.find((f) => f.id === furnitureId);
        if (item) {
          Object.assign(item, updates);
          const mesh = this.furnitureMeshes.get(furnitureId);
          if (mesh) this.scene?.remove(mesh);
          this.createFurniture3D(item);
        }
        break;
      }

      case CommandType.DELETE_FURNITURE: {
        const furnitureId = command.payload as any;
        this.home.furniture = this.home.furniture.filter((f) => f.id !== furnitureId);
        const mesh = this.furnitureMeshes.get(furnitureId);
        if (mesh) this.scene?.remove(mesh);
        this.furnitureMeshes.delete(furnitureId);
        break;
      }

      case CommandType.SET_CAMERA_POSITION: {
        this.home.camera = command.payload as any;
        this.updateCameraPosition();
        break;
      }

      case CommandType.ZOOM_CAMERA: {
        if (this.camera) {
          const zoomFactor = command.payload as any;
          this.camera.fov = Math.max(10, Math.min(120, this.camera.fov * zoomFactor));
          this.camera.updateProjectionMatrix();
        }
        break;
      }

      default:
        console.warn(`Unhandled command type: ${command.type}`);
    }

    this.syncStatus = {
      state: SyncState.SYNCED,
      pendingCommands: [],
      errors: [],
    };
    return { success: true, data: null };
  }

  async getHome(): Promise<AdapterResponse<HomeDefinition>> {
    if (!this.home) {
      return { success: false, error: 'Home not loaded' };
    }
    return { success: true, data: JSON.parse(JSON.stringify(this.home)) };
  }

  async exportHome(format: 'json' | 'sh3d'): Promise<AdapterResponse<Blob | string>> {
    try {
      if (!this.home) {
        return { success: false, error: 'No home loaded' };
      }
      // For now, both formats export as JSON
      const result = JSON.stringify(this.home, null, 2);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to export home: ${error}` };
    }
  }

  async importHome(data: Blob | string, format: 'json' | 'sh3d'): Promise<AdapterResponse<HomeDefinition>> {
    try {
      let text: string;
      if (data instanceof Blob) {
        text = await data.text();
      } else {
        text = data;
      }

      const parsed = JSON.parse(text);
      this.home = parsed;

      if (!this.home) return { success: false, error: 'Invalid home data' };

      const result = await this.loadHome(this.home);
      this.emit('imported', {});
      return result;
    } catch (error) {
      return { success: false, error: `Failed to import home: ${error}` };
    }
  }

  async undo(): Promise<AdapterResponse<HomeDefinition>> {
    // Simplified undo - return current home state
    // In a full implementation, this would revert to a previous state
    return this.getHome();
  }

  async redo(): Promise<AdapterResponse<HomeDefinition>> {
    // Simplified redo - return current home state
    // In a full implementation, this would advance to a next state
    return this.getHome();
  }

  isReady(): boolean {
    return this.renderer !== null && this.camera !== null && this.scene !== null;
  }

  async dispose(): Promise<void> {
    // Clean up Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.wallMeshes.clear();
    this.furnitureMeshes.clear();
    this.roomMeshes.clear();

    this.scene = null;
    this.camera = null;
    this.canvas = null;

    this.emit('disposed', {});
  }
}
