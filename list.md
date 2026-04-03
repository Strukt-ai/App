# NEW/App Feature Migration Tracker

Last updated: 2026-04-03

## Goal

Port the source-only editor, project, rendering, billing, and proxy features from `NEW/App` into `App` without overwriting the newer workspace shell that already exists in `App`.

## Status Legend

- `[x]` implemented in `App`
- `[~]` partially implemented or adapted to fit the newer `App` UI
- `[ ]` not yet implemented

## Core Editor Workflow

- `[x]` Tutorial progression on image upload in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Tutorial progression and tool reset on calibration in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Analytics event logging hooks in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Detect-rooms token limit handling in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Wall endpoint snapping during draw in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Undo history snapshots after interactions/imports in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Door/window auto-snap after SVG import in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Only unmatched OCR labels become standalone labels in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Blender generation token/error handling in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Source default calibration state restored in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)

## Topbar And Workspace Actions

- `[x]` Calibration helper that routes users to ruler mode in [app/components/layout/Topbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Topbar.tsx)
- `[x]` GLB export action in [app/components/layout/Topbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Topbar.tsx)
- `[x]` Blend export action in [app/components/layout/Topbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Topbar.tsx)
- `[x]` DAE / SketchUp export action in [app/components/layout/Topbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Topbar.tsx)
- `[x]` IFC export action in [app/components/layout/Topbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Topbar.tsx)
- `[x]` Raw SVG export action in [app/components/layout/Topbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Topbar.tsx)
- `[~]` Export controls adapted to the redesigned `App` shell instead of copying the old `NEW/App` bar verbatim

## Projects And Loading

- `[x]` Filter sub-jobs from project list in [app/components/layout/ProjectsModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ProjectsModal.tsx)
- `[x]` Reset current floorplan before loading another project in [app/components/layout/ProjectsModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ProjectsModal.tsx)
- `[x]` Restore saved calibration metadata on project load in [app/components/layout/ProjectsModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ProjectsModal.tsx)
- `[x]` Restore background image before SVG import on project load in [app/components/layout/ProjectsModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ProjectsModal.tsx)
- `[x]` Skip SVG lookups for sub-job thumbnails in [app/components/layout/ProjectThumbnail.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ProjectThumbnail.tsx)
- `[x]` Keep auth-aware SVG retry fallback in [app/components/layout/ProjectThumbnail.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ProjectThumbnail.tsx)

## FurnAI And Queue UX

- `[x]` Stale-request protection for multi-click SAM segmentation in [app/components/layout/FurnAIModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/FurnAIModal.tsx)
- `[x]` Queue modal saved-project messaging in [app/components/layout/FurnAIQueueModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/FurnAIQueueModal.tsx)
- `[x]` “Add to Floorplan” asset action wording and stronger CTA styling in [app/components/layout/JobQueuePanel.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/JobQueuePanel.tsx)

## 3D Rendering

- `[x]` Correct floor polygon orientation for rotated floor mesh in [app/components/editor/FloorManager.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/editor/FloorManager.tsx)
- `[x]` Floor PBR maps and tiled material support in [app/components/editor/FloorManager.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/editor/FloorManager.tsx)
- `[x]` Wall PBR maps in [app/components/editor/WallManager.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/editor/WallManager.tsx)
- `[x]` Wall skirting/baseboard geometry in [app/components/editor/WallManager.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/editor/WallManager.tsx)
- `[x]` Wall cove lighting strip geometry in [app/components/editor/WallManager.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/editor/WallManager.tsx)
- `[x]` Extended outdoor ground plane in [app/components/editor/Ground.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/editor/Ground.tsx)
- `[x]` Unified test and generated GLB preview stage so processed floorplan GLBs use the same overlay, camera framing, and material cleanup as the reference test model in [app/components/editor/GLBOverlay.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/editor/GLBOverlay.tsx), [app/components/editor/RoomDesignerEmbedded.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/editor/RoomDesignerEmbedded.tsx), [app/components/layout/RightSidebar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/RightSidebar.tsx), [app/components/layout/Topbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Topbar.tsx), and [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Guard Blueprint3D item intersection logic against null selection state to prevent `customIntersectionPlanes` runtime crashes in [blueprint3d/src/three/controller.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/blueprint3d/src/three/controller.ts) and [public/js/blueprint3d.js](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/public/js/blueprint3d.js)
- `[x]` Convert desktop sidebars into overlay hover docks with focus-driven collapse so the editor stage keeps full width in [app/components/App.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/App.tsx), [app/components/layout/Sidebar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Sidebar.tsx), and [app/components/layout/RightSidebar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/RightSidebar.tsx)
- `[x]` Replace persistent inspector/workspace helper copy with a walkthrough modal and top-right processing dock in [app/components/layout/EditorWalkthroughModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/EditorWalkthroughModal.tsx), [app/components/layout/ProcessingStatusDock.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ProcessingStatusDock.tsx), [app/components/layout/JobQueuePanel.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/JobQueuePanel.tsx), and [app/components/App.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/App.tsx)
- `[x]` Keep left and right editor docks always discoverable with small persistent click/hover tabs in [app/components/App.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/App.tsx)
- `[x]` Replace hidden desktop dock tabs with always-visible mini icon rails so both side panels stay discoverable even when collapsed in [app/components/App.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/App.tsx)
- `[x]` Keep the normal upload-to-2D/3D process direct by removing automatic project-dashboard takeovers from the welcome/login and process-floorplan path in [app/components/App.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/App.tsx), [app/components/layout/WelcomeScreen.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/WelcomeScreen.tsx), and [app/components/layout/Topbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/Topbar.tsx)
- `[x]` Suppress expected thumbnail cleanup abort noise and keep project thumbnail fallback rendering clean in [app/components/layout/ProjectThumbnail.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ProjectThumbnail.tsx)

## 2D Object Dock Todo

- `[x]` Replace the generic top-center context strip with a true anchored object dock that opens above the selected 2D object in [app/components/layout/ContextToolbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ContextToolbar.tsx)
- `[x]` Make furniture, doors, windows, imported models, and OCR labels directly selectable in 2D through an overlay layer aligned to the BP3D floorplanner in [app/components/layout/ContextToolbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ContextToolbar.tsx)
- `[x]` Support anchored wall operations: rename, thickness, height, calibration handoff, join, duplicate, and delete in [app/components/layout/ContextToolbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ContextToolbar.tsx)
- `[x]` Support anchored room operations: rename, recolor, duplicate, and delete in [app/components/layout/ContextToolbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ContextToolbar.tsx)
- `[x]` Support anchored door/window/furniture operations: rename, dimensions, rotate, door-window swap, duplicate, and delete in [app/components/layout/ContextToolbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ContextToolbar.tsx)
- `[x]` Support anchored OCR label operations: edit text, drag, duplicate, delete, and SVG persistence in [app/components/layout/ContextToolbar.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/ContextToolbar.tsx) and [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)
- `[x]` Treat rooms and labels as first-class history and clipboard objects so dock edits can be duplicated, deleted, and restored cleanly in [app/store/floorplanStore.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/store/floorplanStore.ts)

## Backend Proxy And Downloads

- `[x]` Backend URL resolution through shared config in [app/lib/backend-adapter.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/lib/backend-adapter.ts)
- `[x]` Raw body passthrough for multipart and SVG uploads in [app/lib/backend-adapter.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/lib/backend-adapter.ts)
- `[x]` Non-JSON response handling in [app/lib/backend-adapter.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/lib/backend-adapter.ts)
- `[x]` API allowlist in [app/api/[...route]/route.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/api/[...route]/route.ts)
- `[x]` Request body size guard in [app/api/[...route]/route.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/api/[...route]/route.ts)
- `[x]` Raw upload forwarding in [app/api/[...route]/route.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/api/[...route]/route.ts)
- `[x]` Preserve text/binary backend responses instead of forcing JSON in [app/api/[...route]/route.ts](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/api/[...route]/route.ts)
- `[~]` Existing OpenTelemetry registration kept while layering in the `NEW/App` proxy restrictions

## Billing And Subscription

- `[x]` Subscription-aware premium modal in [app/components/layout/PremiumModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/PremiumModal.tsx)
- `[x]` Razorpay checkout script loader in [app/components/layout/PremiumModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/PremiumModal.tsx)
- `[x]` Checkout verification and cancel-subscription flows in [app/components/layout/PremiumModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/PremiumModal.tsx)
- `[x]` Token usage display in [app/components/layout/PremiumModal.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/PremiumModal.tsx)

## Debug Tools

- `[x]` Session-scoped debug password storage in [app/components/layout/DebugPanel.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/DebugPanel.tsx)
- `[x]` Safe fallback when wrapped debug body is malformed in [app/components/layout/DebugPanel.tsx](/media/sagesujal/DEV1/bytes/strukt.ai/noidea/App/app/components/layout/DebugPanel.tsx)
