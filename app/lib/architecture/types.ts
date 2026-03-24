// Core domain types - engine agnostic
export type UUID = string & { readonly __brand: 'UUID' };

export enum RenderEngineType {
  SWEETHOME3D = 'sweethome3d',
  THREEJS = 'threejs',
  BABYLON = 'babylon',
}

// Command types
export enum CommandType {
  // Wall operations
  CREATE_WALL = 'CREATE_WALL',
  UPDATE_WALL = 'UPDATE_WALL',
  DELETE_WALL = 'DELETE_WALL',
  
  // Furniture operations
  CREATE_FURNITURE = 'CREATE_FURNITURE',
  UPDATE_FURNITURE = 'UPDATE_FURNITURE',
  DELETE_FURNITURE = 'DELETE_FURNITURE',
  
  // Room operations
  CREATE_ROOM = 'CREATE_ROOM',
  UPDATE_ROOM = 'UPDATE_ROOM',
  DELETE_ROOM = 'DELETE_ROOM',
  
  // Dimension operations
  CREATE_DIMENSION = 'CREATE_DIMENSION',
  DELETE_DIMENSION = 'DELETE_DIMENSION',
  
  // Home/project operations
  LOAD_HOME = 'LOAD_HOME',
  SAVE_HOME = 'SAVE_HOME',
  NEW_HOME = 'NEW_HOME',
  
  // Camera operations
  SET_CAMERA_POSITION = 'SET_CAMERA_POSITION',
  ZOOM_CAMERA = 'ZOOM_CAMERA',
}

// 2D Point
export interface Point2D {
  x: number;
  y: number;
}

// 3D Point
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Wall definition
export interface WallDefinition {
  id: UUID;
  startPoint: Point2D;
  endPoint: Point2D;
  thickness: number; // cm
  height: number; // cm
  material?: {
    color?: string;
    textureId?: string;
  };
}

// Furniture definition
export interface FurnitureDefinition {
  id: UUID;
  catalogId: string; // Reference to catalog item
  position: Point3D;
  rotation: number; // degrees around Y axis
  scale?: number;
  width?: number; // cm
  depth?: number; // cm
  height?: number; // cm
}

// Room definition
export interface RoomDefinition {
  id: UUID;
  name: string;
  wallIds: UUID[];
  floorMaterial?: {
    color?: string;
    textureId?: string;
  };
  ceilingMaterial?: {
    color?: string;
    textureId?: string;
  };
}

// Dimension/measurement
export interface DimensionDefinition {
  id: UUID;
  startPoint: Point2D;
  endPoint: Point2D;
  label?: string;
}

// Complete home/project definition
export interface HomeDefinition {
  id: UUID;
  name: string;
  walls: WallDefinition[];
  furniture: FurnitureDefinition[];
  rooms: RoomDefinition[];
  dimensions: DimensionDefinition[];
  camera?: {
    position: Point3D;
    target: Point3D;
    zoom: number;
  };
  environment?: {
    lightColor?: string;
    lightIntensity?: number;
    backgroundColor?: string;
  };
}

// Command payloads
export interface Command {
  type: CommandType;
  payload: Record<string, any>;
  timestamp: number;
  id: UUID;
}

// Undo/Redo stack
export interface CommandHistory {
  past: Command[];
  future: Command[];
}

// Adapter response types
export interface AdapterResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  engineNative?: any; // Raw engine-specific data for debugging
}

// Event emitted by adapter
export interface AdapterEvent {
  type: string;
  data: any;
  timestamp: number;
}

// Synchronization state
export enum SyncState {
  SYNCED = 'synced',
  PENDING = 'pending',
  CONFLICT = 'conflict',
  ERROR = 'error',
}

export interface SyncStatus {
  state: SyncState;
  lastSyncTime?: number;
  pendingCommands: Command[];
  errors: string[];
}
