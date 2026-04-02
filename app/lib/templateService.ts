/**
 * Template Service
 * Handles loading, caching, and managing templates from the templates folder
 */

export interface Template {
  id: string
  title: string
  description: string
  category: 'Residential' | 'Commercial' | 'Specialty' | 'Blank'
  roomType: string
  sidebarCategory: string
  readyToUse?: boolean
  thumbnail: string
  sqft: number
  path?: string
  createdAt?: string
}

export interface TemplateData {
  version: string
  floorplan: {
    walls: any[]
    furniture: any[]
    rooms: any[]
    doors: any[]
    windows: any[]
    labels: any[]
  }
  camera: {
    position: [number, number, number]
    target: [number, number, number]
    zoom: number
  }
  settings: {
    scale: number
    gridSize: number
    snapToGrid: boolean
    unitsystem: string
  }
  materials: {
    floor: { type: string; color: string }
    walls: { type: string; color: string }
  }
}

export interface TemplateDetail extends Template {
  data?: TemplateData
  preview?: string
}

let templatesCache: Template[] = []
let cacheLoaded = false

/**
 * Load all templates from the templates index
 */
export async function loadAllTemplates(): Promise<Template[]> {
  // Return cached templates if available
  if (cacheLoaded) {
    return templatesCache
  }

  try {
    const response = await fetch('/templates/templates.json')
    if (!response.ok) {
      throw new Error(`Failed to load templates index: ${response.statusText}`)
    }
    const data = await response.json()
    templatesCache = data.templates || []
    cacheLoaded = true
    return templatesCache
  } catch (error) {
    console.error('Error loading templates:', error)
    return []
  }
}

/**
 * Load a specific template's detail including its data and preview
 */
export async function loadTemplateDetail(templateId: string): Promise<TemplateDetail | null> {
  try {
    // First, get the template metadata
    const templates = await loadAllTemplates()
    const template = templates.find((t) => t.id === templateId)

    if (!template) {
      console.warn(`Template not found: ${templateId}`)
      return null
    }

    // Load the template's detail JSON
    const detailResponse = await fetch(`/templates/${template.path}/template.json`)
    if (!detailResponse.ok) {
      throw new Error(`Failed to load template detail: ${detailResponse.statusText}`)
    }
    const detailData = await detailResponse.json()

    // Load the template's floorplan data
    let data: TemplateData | undefined
    try {
      const dataResponse = await fetch(`/templates/${template.path}/data.json`)
      if (dataResponse.ok) {
        data = await dataResponse.json()
      }
    } catch (e) {
      console.warn(`Could not load template data for ${templateId}:`, e)
    }

    // Load the template's preview
    let preview: string | undefined
    try {
      const previewResponse = await fetch(`/templates/${template.path}/preview.png`)
      if (previewResponse.ok) {
        preview = `/templates/${template.path}/preview.png`
      }
    } catch (e) {
      console.warn(`Could not load template preview for ${templateId}:`, e)
    }

    return {
      ...template,
      ...detailData,
      data,
      preview,
    }
  } catch (error) {
    console.error(`Error loading template detail for ${templateId}:`, error)
    return null
  }
}

/**
 * Get template data for initializing the editor
 */
export async function getTemplateData(templateId: string): Promise<TemplateData | null> {
  try {
    // Get all templates to find the path
    const templates = await loadAllTemplates()
    const template = templates.find((t) => t.id === templateId)

    if (!template || !template.path) {
      return null
    }

    const response = await fetch(`/templates/${template.path}/data.json`)
    if (!response.ok) {
      throw new Error(`Failed to load template data: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading template data for ${templateId}:`, error)
    return null
  }
}

/**
 * Download a template as a JSON file
 */
export async function downloadTemplate(templateId: string): Promise<void> {
  try {
    const detail = await loadTemplateDetail(templateId)
    if (!detail) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Create a comprehensive template package
    const templatePackage = {
      id: detail.id,
      title: detail.title,
      description: detail.description,
      category: detail.category,
      roomType: detail.roomType,
      sqft: detail.sqft,
      data: detail.data,
      exportedAt: new Date().toISOString(),
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(templatePackage, null, 2)

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${templateId}-template.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`Template '${templateId}' downloaded successfully`)
  } catch (error) {
    console.error(`Error downloading template ${templateId}:`, error)
    throw error
  }
}
