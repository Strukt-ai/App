/**
 * Architecture Documentation
 * 
 * This document explains how the adapter-based architecture works
 * and how different rendering engines can be swapped.
 */

# 🏗️ Adapter-Based Rendering Architecture

## Overview

```
┌─────────────────────────────────────┐
│         Next.js UI Layer             │
│  (React Components, User Interaction)│
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│      Command Bus (Orchestrator)      │
│  • Command validation                │
│  • Middleware pipeline               │
│  • Command history (Undo/Redo)       │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│      Rendering Adapter (Abstract)    │
│  • Normalize commands to engine      │
│  • 2D ↔ 3D synchronization          │
│  • Event emission                    │
└──────────────────┬──────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
   ┌──▼──┐  ┌──────▼────┐  ┌───▼───┐
   │SH3D │  │ Three.js  │  │ Custom│
   │     │  │ Adapter   │  │Engine │
   └─────┘  └───────────┘  └───────┘
```

## Core Components

### 1. **Types** (`types.ts`)
- Domain-agnostic types that all adapters understand
- CommandType enum (CREATE_WALL, PLACE_FURNITURE, etc.)
- Data structures (Point2D/3D, WallDefinition, HomeDefinition, etc.)
- Event interfaces

### 2. **Adapter** (`adapter.ts`)
- Abstract base class `RenderingAdapter`
- Each rendering engine implements this interface
- Responsible for:
  - `executeCommand()` - handle normalized commands
  - `loadHome()` - import design into engine
  - `exportHome()` - export to storage format
  - `undo()`/`redo()` - history management
  - Event emission for UI updates

### 3. **Command Bus** (`commandBus.ts`)
- Orchestrates command execution
- Validates commands before execution
- Executes middleware pipeline
- Manages command history for undo/redo
- Decouples UI from adapter

### 4. **Synchronizer** (`synchronizer.ts`)
- 2D ↔ 3D data conversion
- Format conversion (JSON ↔ .sh3d)
- Consistency validation
- Area/perimeter calculations

### 5. **Adapters** (`adapters/`)
- Implementation-specific adapters
- `SweetHome3DAdapter` - for SweetHome3D engine
- Can add more: Three.js, Babylon.js, etc.

### 6. **React Hook** (`useRenderingEngine.ts`)
- React hook for component integration
- Handles adapter lifecycle
- Provides imperative API to components

## Data Flow

### Adding a Wall

```
User clicks "Create Wall" button
              ↓
Component calls:
  executeCommand(CommandType.CREATE_WALL, { startPoint, endPoint, thickness })
              ↓
CommandBus validates command
              ↓
CommandBus executes middleware pipeline
              ↓
Adapter.executeCommand() handles CREATE_WALL
              ↓
Adapter creates wall in native engine
              ↓
Adapter emits 'wall-created' event
              ↓
Component updates (via event listener)
              ↓
User sees wall in 3D view
```

### Switching Engines

```
Current: SweetHome3D
              ↓
Adapter.exportHome('json')
              ↓
Store JSON (engine-agnostic)
              ↓
Switch to Three.js engine
              ↓
Adapter.importHome(json)
              ↓
New adapter loads design
              ↓
User continues working (no data loss)
```

## Adding a New Adapter

### 1. Create the adapter class

```typescript
export class ThreeJSAdapter extends RenderingAdapter {
  constructor() {
    super(RenderEngineType.THREEJS);
  }

  async initialize(container: HTMLElement | string) {
    // Set up Three.js scene, camera, renderer
  }

  async executeCommand(command: Command) {
    // Handle each CommandType:
    // - CREATE_WALL: Create Three.js geometry
    // - CREATE_FURNITURE: Load model, place in scene
    // - etc.
  }

  async loadHome(home: HomeDefinition) {
    // Populate Three.js scene with home data
  }

  // Implement other abstract methods...
}
```

### 2. Register the adapter

```typescript
AdapterFactory.register(RenderEngineType.THREEJS, ThreeJSAdapter);
```

### 3. Use in component

```typescript
const { /* ... */ } = useRenderingEngine({
  engineType: RenderEngineType.THREEJS,
});
```

That's it! No UI changes needed.

## Command Examples

### Create a Wall
```typescript
executeCommand(CommandType.CREATE_WALL, {
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 500, y: 0 },
  thickness: 15,
  height: 250,
  material: { color: '#ffffff' }
});
```

### Place Furniture
```typescript
executeCommand(CommandType.CREATE_FURNITURE, {
  catalogId: 'chair-001',
  position: { x: 100, y: 100, z: 0 },
  rotation: 45,
  width: 50,
  depth: 50,
  height: 80
});
```

### Create Room
```typescript
executeCommand(CommandType.CREATE_ROOM, {
  name: 'Living Room',
  wallIds: ['wall-1', 'wall-2', 'wall-3', 'wall-4']
});
```

## Storage Format

### JSON Format (Universal)
```json
{
  "id": "home-123",
  "name": "My House",
  "walls": [
    {
      "id": "wall-1",
      "startPoint": { "x": 0, "y": 0 },
      "endPoint": { "x": 500, "y": 0 },
      "thickness": 15,
      "height": 250
    }
  ],
  "furniture": [],
  "rooms": []
}
```

### .sh3d Format (SweetHome3D native)
- Converted via `FormatConverter.toSH3DFormat()`
- Can be loaded by native SweetHome3D app
- Maintains compatibility

## Advantages

✅ **Engine agnostic** - UI doesn't care which engine is running
✅ **Swappable** - Switch engines without code changes
✅ **Testable** - Mock adapters for unit tests
✅ **Extensible** - Add new commands without modifying existing code
✅ **Future-proof** - Support new engines as they emerge
✅ **Data portable** - Export to JSON, import to any engine
✅ **Undo/Redo** - Built-in history management
✅ **Events** - Reactive updates from adapter to UI

## Event Types

```typescript
adapter.on('wall-created', (event) => {
  // event.data contains the created wall
});

adapter.on('furniture-updated', (event) => {
  // event.data contains updated furniture
});

adapter.on('home-loaded', (event) => {
  // home was loaded
});

adapter.on('initialized', (event) => {
  // adapter is ready
});
```

## Integration with SweetHome3D

The `SweetHome3DAdapter` provides a bridge:
1. Receives normalized commands from CommandBus
2. Translates to SweetHome3D API calls
3. Emits events on changes
4. Can export/import .sh3d files
5. Supports native SweetHome3D features

## Next Steps

1. **Implement Three.js Adapter** for web-based rendering
2. **Add Babylon.js Adapter** for alternative 3D engine
3. **Enhance synchronizer** for more 2D ↔ 3D features
4. **Add collaboration** - sync multiple users via WebSocket
5. **Plugin system** - allow third-party adapters
