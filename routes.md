# Frontend Routes Documentation

This document describes all frontend routes and their API endpoints/requests.

## Frontend Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home page - Template grid for selecting floorplan templates |
| `/editor` | `app/editor/page.tsx` | Main editor page - Heavy 3D floorplan editor (dynamically loaded) |

## API Endpoints (Backend Communication)

All API calls are made through the backend adapter in `lib/backend-adapter.ts` which proxies to `http://127.0.0.1:8000` (FastAPI backend).

### Authentication

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/auth/verify` | POST | Verify Google OAuth token | `{ token: string }` | `{ user_id: string, email: string, name: string, picture: string }` |
| `/auth/login` | POST | Login with credentials | `{ email: string, password: string }` | `{ token: string }` |

### Health & System

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/health` | GET | Health check | - | `{ ok: boolean, service: string, server_time: string, status: string }` |
| `/api/system/status` | GET | System status including workers | - | `{ status: string, workers_online: number, worker_ids: string[] }` |
| `/api/system/metrics` | GET | Download Excel metrics report | - | Binary (Excel file) |
| `/api/security/logs` | GET | Recent security events | - | `{ logs: SecurityLog[] }` |

### Runs (Projects)

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs` | GET | Get all runs for user | - | `Run[]` |
| `/api/runs` | POST | Create new run with image | `FormData: { image: File, task_type: string }` | `{ ok: boolean, run_id: string, status: string, message: string }` |
| `/api/runs/{run_id}` | GET | Get run metadata | - | `RunMeta` |
| `/api/runs/{run_id}` | DELETE | Delete a run | - | `{ ok: boolean, deleted: string }` |

### Run Status & Downloads

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/status` | GET | Get job/run status | - | `{ ok: boolean, run_id: string, status: string, error?: string, has_glb: boolean, has_blend: boolean, glb_url?: string, blend_url?: string }` |
| `/api/runs/{run_id}/download/blend` | GET | Download .blend file | - | Binary (application/octet-stream) |
| `/api/runs/{run_id}/download/glb` | GET | Download .glb file | - | Binary (model/gltf-binary) |
| `/api/runs/{run_id}/download/{filename}` | GET | Download any run file | - | Binary |
| `/api/runs/{run_id}/download/llm-blend` | GET | Download LLM-modified blend | - | Binary |

### SVG Management

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/svg` | GET | Get current SVG | - | SVG (image/svg+xml) |
| `/api/runs/{run_id}/svg` | PUT | Update SVG | `{ svg: string }` | `{ ok: boolean, run_id: string, svg_url: string }` |
| `/api/runs/{run_id}/svg/raw` | GET | Get raw inference SVG (clean.svg) | - | SVG (image/svg+xml) |
| `/api/runs/{run_id}/svg-for-3d` | GET | Get locked SVG for 3D generation | - | SVG (image/svg+xml) |
| `/api/runs/{run_id}/lock-svg-for-3d` | POST | Lock current SVG for 3D | - | `{ ok: boolean, run_id: string, locked_svg: string }` |

### 3D Generation

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/generate-3d` | POST | Trigger 3D generation | `{ scale?: number, svg?: string }` | `{ ok: boolean, run_id: string, status: string, message: string }` |
| `/api/runs/{run_id}/detect-rooms` | POST | Trigger room detection | - | `{ ok: boolean, run_id: string, status: string, message: string }` |
| `/api/runs/{run_id}/render` | POST | Trigger Blender rendering | `{ lighting?: string }` | `{ ok: boolean, renders: string[], lighting: string, message: string }` |
| `/api/runs/{run_id}/renders/{filename}` | GET | Get rendered image | - | Binary (image/png) |

### Furniture (FurnAI)

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/furniture/batch` | POST | Add furniture item to batch | `{ category: string, item: FurnitureItem }` | `{ ok: boolean, job_id: string, category: string, queued: number }` |
| `/api/runs/{run_id}/furniture/batch` | GET | Get furniture batch | - | `{ ok: boolean, batch: FurnitureBatch }` |
| `/api/runs/{run_id}/furniture/finish` | POST | Finish batching, queue for AWS | - | `{ ok: boolean, run_id: string, promoted_jobs: number, status: string, message: string }` |
| `/api/runs/{run_id}/furniture/assets` | GET | Get FurnAI assets manifest | - | `{ ok: boolean, manifest: FurnAIManifest }` |

### Imported Models

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/imported/upload` | POST | Upload imported GLB model | `FormData: { file: File }` | `{ ok: boolean, item_id: string, rel_path: string }` |
| `/api/runs/{run_id}/assets/{rel_path}` | GET | Get asset file (GLB) | - | Binary (model/gltf-binary) |

### Texturize

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/texturize/apply` | POST | Apply texture to SVG element | `FormData: { file: File, target_id: string, tile_width_ft: number, tile_height_ft: number }` | `{ ok: boolean, run_id: string, target_id: string, tile_w_px: number, tile_h_px: number, svg_url: string }` |

### Placements

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/placements` | GET | Get placements.json | - | `{ ok: boolean, placements: Placements }` |
| `/api/runs/{run_id}/placements` | PUT | Save placements.json | `{ placements: Placements }` | `{ ok: boolean }` |

### Editor

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/editor/detect-rooms` | POST | Analyze walls and detect rooms | `{ walls: Wall[] }` | `{ status: string, rooms: Room[] }` |

### SAM3D (Interactive Segmentation)

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/sam3d/segment-click` | POST | Handle user click for SAM segmentation | `{ job_id: string, x: number, y: number, intent: string }` | `{ ok: boolean, job_id: string, message: string }` |
| `/api/sam3d/reconstruct` | POST | Trigger 3D reconstruction | `{ job_id: string, polygon: number[][] }` | `{ ok: boolean, job_id: string, status: string, message: string }` |

### LLM 3D Modification

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/llm/3d-command` | POST | Use LLaVA to modify 3D model | `{ run_id: string, prompt: string }` | `{ ok: boolean, run_id: string, message: string, modified_blend_url: string, raw_response: string }` |

### Job Cleanup

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/cleanup-click-jobs` | POST | Delete stale click jobs | `{ older_than_minutes?: number, include_processing?: boolean }` | `{ ok: boolean, deleted: number, older_than_minutes: number }` |
| `/api/runs/cleanup-stale-jobs` | POST | Delete stale non-click jobs | `{ older_than_minutes?: number, task_type?: string }` | `{ ok: boolean, deleted: number, older_than_minutes: number, task_type?: string }` |

### Run Assets

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/assets/upload` | POST | Upload custom asset | `FormData: { asset: File }` | `{ ok: boolean, name: string, size: number }` |

### Run Email

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/email` | POST | Queue email notification | `{ email: string }` | `{ ok: boolean, message: string }` |

### Run Metadata

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/meta` | PUT | Update run metadata | `{ key: value }` | `{ ok: boolean, run_id: string, meta: object }` |

### Prepare MethodDraw

| Endpoint | Method | Description | Request Schema | Response Schema |
|----------|--------|-------------|----------------|-----------------|
| `/api/runs/{run_id}/prepare-methoddraw` | POST | Copy SVG for MethodDraw editor | - | `{ ok: boolean, run_id: string, methoddraw_url: string }` |

## Data Schemas

### Run
```typescript
interface Run {
  job_id: string
  created_at: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'QUEUED_OFFLINE'
  task_type: string
  user_id: string
  email?: string
  result_json?: string
}
```

### RunMeta
```typescript
interface RunMeta {
  run_id: string
  path: string
  run_meta: object
  svg?: { name: string; size: number; mtime: number }
  blend?: { name: string; size: number; mtime: number }
  glb?: { name: string; size: number; mtime: number }
  llm_blend?: { name: string; size: number; mtime: number }
  status: string
  worker_id?: string
  error?: string
}
```

### FurnitureItem
```typescript
interface FurnitureItem {
  id: string
  name: string
  polygons?: number[][]
  // ... other properties
}
```

### FurnitureBatch
```typescript
interface FurnitureBatch {
  version: number
  run_id: string
  categories: {
    [category: string]: FurnitureItem[]
  }
}
```

### FurnAIManifest
```typescript
interface FurnAIManifest {
  version: number
  run_id: string
  items: {
    [item_id: string]: {
      item_id: string
      file_name: string
      rel_path: string
      updated_at: string
    }
  }
}
```

### Room
```typescript
interface Room {
  id: string
  name: string
  center: { x: number; y: number }
  points: number[][]
  color: string
}
```

### Wall
```typescript
interface Wall {
  id: string
  points: number[][]
  room?: string
  type?: 'wall' | 'door' | 'window'
}
```

### Placements
```typescript
interface Placements {
  version: number
  items: PlacementItem[]
}

interface PlacementItem {
  id: string
  type: string
  position: { x: number; y: number; z: number }
  rotation: number
  scale: { x: number; y: number; z: number }
}
```

### SecurityLog
```typescript
interface SecurityLog {
  timestamp: string
  type: string
  ip: string
  detail: string
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `http://127.0.0.1:8000` |

## Proxy Configuration

The frontend uses Vite proxy to forward API requests:

```typescript
// Vite proxy config (vite.config.ts)
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false,
  },
  '/sidecar': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false,
  }
}
```

