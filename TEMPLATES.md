# Template System Documentation

This document describes the template system architecture and how to add, modify, and manage templates in Struckt.

## Overview

Templates are the starting point for users to create new designs. Each template contains:
- Metadata (title, description, category, etc.)
- A 2D preview image or SVG
- Floorplan data (walls, furniture, rooms, etc.)
- Configuration settings

## Architecture

```
app/
├── templates/                    # Template files (static)
│   ├── templates.json           # Master index of all templates
│   └── {template-id}/           # Individual template folder
│       ├── template.json        # Template metadata
│       ├── data.json            # Floorplan data
│       ├── preview.svg          # 2D preview (SVG)
│       └── thumbnail.png        # Grid thumbnail
├── lib/
│   └── templateService.ts       # Template loading & management
├── types/
│   └── template.ts              # TypeScript type definitions
├── components/
│   ├── home/
│   │   ├── index.tsx            # Template grid component
│   │   └── VideoModal.tsx       # Video tutorial modal
│   └── template/
│       └── [id]/
│           ├── page.tsx         # Detail page route
│           └── TemplateDetailPage.tsx  # Detail component
└── store/
    └── floorplanStore.ts        # Zustand state management
```

## Adding a New Template

### Step 1: Create the Template Folder

Create a new folder under `app/templates/{template-id}/`:

```
app/templates/my-living-room/
├── template.json
├── data.json
├── preview.svg
└── thumbnail.png
```

### Step 2: Create `template.json`

This file contains template metadata:

```json
{
  "id": "my-living-room",
  "title": "Modern Living Room",
  "description": "Contemporary living space with balanced seating and media wall.",
  "category": "Residential",
  "roomType": "Living Room",
  "sidebarCategory": "Furniture",
  "readyToUse": true,
  "thumbnail": "/thumbnails/my-living-room.png",
  "preview": "/previews/my-living-room.png",
  "sqft": 450,
  "createdAt": "2024-01-15",
  "defaultDimensions": {
    "width": 600,
    "height": 400,
    "unit": "cm"
  },
  "tags": ["modern", "residential", "living-room"]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (no spaces or special chars) |
| `title` | string | Yes | Display name |
| `description` | string | Yes | Brief description shown on detail page |
| `category` | enum | Yes | `'Residential'`, `'Commercial'`, `'Specialty'`, `'Blank'` |
| `roomType` | string | Yes | Type of room (e.g., "Living Room", "Bedroom") |
| `sidebarCategory` | string | Yes | Must match one of: Furniture, For Walls/Ceiling, Decor, For Floor, Paints, Kitchen, Lighting, Bathroom, Finishes, Appliances |
| `readyToUse` | boolean | No | If true, shows a "Ready to Use" badge |
| `thumbnail` | string | Yes | Path to thumbnail image for grid |
| `preview` | string | Yes | Path to preview image/SVG for detail page |
| `sqft` | number | Yes | Square feet; use 0 for flexible sizes |
| `createdAt` | string | No | ISO date string |
| `defaultDimensions` | object | No | Default room dimensions |
| `tags` | array | No | Search tags for discoverability |

### Step 3: Create `data.json`

This file contains the floorplan data that loads into the editor:

```json
{
  "version": "1.0",
  "floorplan": {
    "walls": [
      {
        "id": "wall-1",
        "start": { "x": 0, "y": 0 },
        "end": { "x": 600, "y": 0 },
        "thickness": 20,
        "height": 250,
        "color": "#ffffff"
      },
      {
        "id": "wall-2",
        "start": { "x": 600, "y": 0 },
        "end": { "x": 600, "y": 400 },
        "thickness": 20,
        "height": 250,
        "color": "#ffffff"
      }
    ],
    "furniture": [
      {
        "id": "sofa-1",
        "type": "sofa",
        "x": 150,
        "y": 100,
        "width": 200,
        "height": 80,
        "rotation": 0,
        "color": "#3b82f6"
      }
    ],
    "rooms": [
      {
        "id": "room-1",
        "name": "Living Room",
        "points": [
          { "x": 10, "y": 10 },
          { "x": 590, "y": 10 },
          { "x": 590, "y": 390 },
          { "x": 10, "y": 390 }
        ],
        "color": "#e2e8f0"
      }
    ],
    "doors": [],
    "windows": [],
    "labels": []
  },
  "camera": {
    "position": [0, 0, 0],
    "target": [0, 0, 0],
    "zoom": 1
  },
  "settings": {
    "scale": 1,
    "gridSize": 10,
    "snapToGrid": true,
    "unitsystem": "cm"
  },
  "materials": {
    "floor": {
      "type": "default",
      "color": "#d3d3d3"
    },
    "walls": {
      "type": "default",
      "color": "#ffffff"
    }
  }
}
```

### Step 4: Create `preview.svg` or `preview.png`

Create a 2D preview image of the template:

- **SVG** (recommended for clean, scalable previews)
- **PNG** (for photorealistic previews)

**File size**: Keep under 500KB for fast loading
**Dimensions**: 500x500px or proportional

Example SVG preview template:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <!-- Background -->
  <rect width="500" height="500" fill="#f5f5f5"/>
  
  <!-- Walls -->
  <rect x="50" y="50" width="400" height="20" fill="#ffffff" stroke="#cccccc" stroke-width="1"/>
  <rect x="50" y="50" width="20" height="400" fill="#ffffff" stroke="#cccccc" stroke-width="1"/>
  
  <!-- Furniture -->
  <rect x="100" y="100" width="150" height="80" fill="#3b82f6" stroke="#2563eb" stroke-width="1" rx="4"/>
  
  <!-- Label -->
  <text x="250" y="450" font-size="16" fill="#999999" text-anchor="middle">Living Room Preview</text>
</svg>
```

### Step 5: Create `thumbnail.png`

Create a smaller thumbnail image (200x200px recommended) for the grid display.

### Step 6: Update `templates.json`

Add an entry to the master templates index at `app/templates/templates.json`:

```json
{
  "version": "1.0",
  "templates": [
    {
      "id": "blank",
      "title": "Blank Canvas",
      "description": "Start from scratch with full freedom.",
      "category": "Blank",
      "roomType": "Custom",
      "sidebarCategory": "Furniture",
      "readyToUse": false,
      "thumbnail": "https://images.unsplash.com/...",
      "sqft": 0,
      "path": "blank"
    },
    {
      "id": "my-living-room",
      "title": "Modern Living Room",
      "description": "Contemporary living space with balanced seating and media wall.",
      "category": "Residential",
      "roomType": "Living Room",
      "sidebarCategory": "Furniture",
      "readyToUse": true,
      "thumbnail": "https://images.unsplash.com/...",
      "sqft": 450,
      "path": "my-living-room"
    }
  ]
}
```

**Key field**: `"path"` — must match your template folder name (e.g., `"my-living-room"`)

## Template Discovery

After adding the template files, the system will automatically:

1. Load it from `templates.json` on app start
2. Display it in the template grid (filtered by category and sidebar)
3. Make it available via `/template/{id}` detail page
4. Allow users to create designs from it

## Modifying Templates

### Update Template Metadata

Edit `app/templates/{template-id}/template.json` and save. Changes appear after browser refresh.

### Update Floorplan Data

Edit `app/templates/{template-id}/data.json`. Users creating new designs from this template will load the updated data.

### Update Preview/Thumbnail

Replace the image files at:
- `app/templates/{template-id}/preview.svg`
- `app/templates/{template-id}/thumbnail.png`

## Best Practices

1. **Unique IDs**: Use kebab-case and avoid special characters
2. **File Sizes**: Keep preview SVGs under 100KB, PNGs under 500KB
3. **Dimensions**: Use consistent 500x500px for preview, 200x200px for thumbnail
4. **Categories**: Match existing categories or ensure they're in the sidebar list
5. **Descriptions**: Keep descriptions under 200 characters for better UX
6. **Testing**: After adding a template, test it by:
   - Viewing on home grid
   - Clicking to detail page
   - Creating a design from it
   - Verifying data loads correctly in editor

## Troubleshooting

### Template not appearing on home page
- Verify `path` field in `templates.json` matches folder name
- Check browser console for fetch errors
- Ensure `templates.json` is valid JSON

### Preview image not loading
- Verify path in `template.json` is correct
- Check file exists at `app/templates/{template-id}/` folder
- Ensure image format is supported (SVG, PNG, JPG)

### Floorplan data not loading in editor
- Verify `data.json` is valid JSON
- Check `data.json` structure matches `TemplateData` interface
- Ensure coordinates are within reasonable bounds

## API Reference

### `loadAllTemplates()`
Returns all templates as array

```typescript
const templates = await loadAllTemplates()
```

### `loadTemplateDetail(templateId)`
Returns specific template with all data

```typescript
const template = await loadTemplateDetail('my-living-room')
```

### `downloadTemplate(templateId)`
Downloads template as JSON file

```typescript
await downloadTemplate('my-living-room')
```

### `getTemplateData(templateId)`
Returns just the floorplan data

```typescript
const data = await getTemplateData('my-living-room')
```

## Caching

Templates are cached in memory after first load. To clear cache:

```typescript
import { clearTemplateCache } from '@/lib/templateService'
clearTemplateCache()
```

## Future Enhancements

- [ ] Template preview editing UI
- [ ] Template upload/creation interface
- [ ] Template variants (e.g., "Modern Living Room - Small", "Modern Living Room - Large")
- [ ] User-created template saving
- [ ] Template ratings/reviews
- [ ] Template usage analytics
