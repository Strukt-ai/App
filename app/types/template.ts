/**
 * Template Type Definitions
 * Shared types for template-related functionality
 */

export type TemplateCategory = 'All' | 'Residential' | 'Commercial' | 'Specialty' | 'Blank'

export type SidebarCategory =
  | 'All Products'
  | 'Furniture'
  | 'For Walls/Ceiling'
  | 'Decor'
  | 'For Floor'
  | 'Paints'
  | 'Kitchen'
  | 'Lighting'
  | 'Bathroom'
  | 'Finishes'
  | 'Appliances'

export interface Template {
  id: string
  title: string
  description: string
  category: Exclude<TemplateCategory, 'All'>
  roomType: string
  sidebarCategory: SidebarCategory
  readyToUse?: boolean
  thumbnail: string
  sqft: number
  createdAt?: string
  path?: string
  tags?: string[]
}

export interface TemplateMetadata {
  id: string
  title: string
  description: string
  category: Exclude<TemplateCategory, 'All'>
  roomType: string
  sidebarCategory: SidebarCategory
  readyToUse?: boolean
  thumbnail: string
  sqft: number
  createdAt?: string
  defaultDimensions?: {
    width: number
    height: number
    unit: string
  }
  tags?: string[]
}

export interface FloorplanWall {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  thickness: number
  color?: string
  material?: string
}

export interface FloorplanFurniture {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color?: string
  material?: string
}

export interface FloorplanRoom {
  id: string
  name: string
  type: string
  points: Array<{ x: number; y: number }>
  color?: string
}

export interface Floorplan {
  walls: FloorplanWall[]
  furniture: FloorplanFurniture[]
  rooms: FloorplanRoom[]
  doors: any[]
  windows: any[]
  labels: any[]
}

export interface Camera {
  position: [number, number, number]
  target: [number, number, number]
  zoom: number
}

export interface TemplateSettings {
  scale: number
  gridSize: number
  snapToGrid: boolean
  unitsystem: string
}

export interface TemplateMaterials {
  floor: { type: string; color: string }
  walls: { type: string; color: string }
}

export interface TemplateData {
  version: string
  floorplan: Floorplan
  camera: Camera
  settings: TemplateSettings
  materials: TemplateMaterials
}

export interface TemplateDetail extends Template {
  data?: TemplateData
  preview?: string
}

export interface TemplateIndex {
  version: string
  templates: Template[]
}

export interface TemplateDownloadPackage {
  id: string
  title: string
  description: string
  category: Exclude<TemplateCategory, 'All'>
  roomType: string
  sqft: number
  data: TemplateData
  exportedAt: string
}
