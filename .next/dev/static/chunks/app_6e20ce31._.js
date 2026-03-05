(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/store/floorplanStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFloorplanStore",
    ()=>useFloorplanStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2f$immer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware/immer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/v4.js [app-client] (ecmascript) <export default as v4>");
'use client';
;
;
;
const useFloorplanStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2f$immer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["immer"])((set)=>({
        mode: '2d',
        activeTool: 'wall',
        lightingPreset: 'day',
        drawing: false,
        activeWallId: null,
        walls: [],
        furniture: [],
        rooms: [],
        pendingDrop: null,
        currentRunId: null,
        runStatus: 'idle',
        selectedId: null,
        uploadedImage: null,
        imageDimensions: null,
        calibrationFactor: 0.01,
        isCalibrated: false,
        isGenerating3D: false,
        isRendering: false,
        showBackground: true,
        showProcessingModal: false,
        showQueueModal: false,
        projectsModalOpen: false,
        renders: [],
        interaction: {
            type: 'none',
            targetId: null,
            lastPoint: null
        },
        fitViewTrigger: 0,
        exportScale: 1,
        toast: null,
        token: localStorage.getItem('google_token') || null,
        user: null,
        setToken: (token)=>set((state)=>{
                state.token = token;
                if (token) localStorage.setItem('google_token', token);
                else localStorage.removeItem('google_token');
            }),
        setUser: (user)=>set((state)=>{
                state.user = user;
            }),
        setMode: (mode)=>set((state)=>{
                state.mode = mode;
            }),
        setActiveTool: (tool)=>set((state)=>{
                state.activeTool = tool;
            }),
        setLightingPreset: (preset)=>set((state)=>{
                state.lightingPreset = preset;
            }),
        setUploadedImage: (url, width, height)=>set((state)=>{
                state.uploadedImage = url;
                if (width && height) state.imageDimensions = {
                    width,
                    height
                };
            }),
        setCalibrationFactor: (factor)=>set((state)=>{
                state.calibrationFactor = factor;
                state.isCalibrated = true;
            }),
        setRunId: (runId)=>set((state)=>{
                state.currentRunId = runId;
            }),
        setRunStatus: (status)=>set((state)=>{
                state.runStatus = status;
            }),
        setShowProcessingModal: (show)=>set((state)=>{
                state.showProcessingModal = show;
            }),
        setShowQueueModal: (show)=>set((state)=>{
                state.showQueueModal = show;
            }),
        setProjectsModalOpen: (show)=>set((state)=>{
                state.projectsModalOpen = show;
            }),
        // Tutorial State
        tutorialStep: 'none',
        lastQueuedTask: 'none',
        setTutorialStep: (step)=>set((state)=>{
                state.tutorialStep = step;
            }),
        completeTutorial: ()=>set((state)=>{
                state.tutorialStep = 'none';
            }),
        setLastQueuedTask: (task)=>set((state)=>{
                state.lastQueuedTask = task;
            }),
        triggerDetectRooms: async ()=>{
            const state = useFloorplanStore.getState();
            if (!state.currentRunId) return;
            if (!state.isCalibrated) return;
            set((s)=>{
                s.lastQueuedTask = 'detect_rooms';
                s.runStatus = 'processing';
            });
            state.setShowProcessingModal(true);
            const headers = {};
            if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
            // 1) Upload the latest edited SVG from the 2D editor (source of truth)
            try {
                const svgText = state.exportToSVG();
                const putHeaders = {
                    ...headers,
                    'Content-Type': 'image/svg+xml'
                };
                const putRes = await fetch(`/api/runs/${state.currentRunId}/svg`, {
                    method: 'PUT',
                    headers: putHeaders,
                    body: svgText
                });
                if (!putRes.ok) {
                    throw new Error(await putRes.text());
                }
            } catch (e) {
                set((s)=>{
                    s.runStatus = 'failed';
                    s.lastQueuedTask = 'none';
                });
                state.setShowProcessingModal(false);
                throw e;
            }
            const res = await fetch(`/api/runs/${state.currentRunId}/detect-rooms`, {
                method: 'POST',
                headers
            });
            if (!res.ok) {
                set((s)=>{
                    s.runStatus = 'failed';
                    s.lastQueuedTask = 'none';
                });
                state.setShowProcessingModal(false);
                throw new Error(await res.text());
            }
        },
        selectObject: (id)=>set((state)=>{
                state.selectedId = id;
            }),
        deleteObject: (id)=>set((state)=>{
                state.walls = state.walls.filter((w)=>w.id !== id);
                state.furniture = state.furniture.filter((f)=>f.id !== id);
                if (state.selectedId === id) state.selectedId = null;
            }),
        startInteraction: (type, targetId, point, subType)=>set((state)=>{
                state.interaction = {
                    type,
                    targetId,
                    subType,
                    lastPoint: point
                };
                if (type === 'drawing') {
                    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
                    const snap = 0.1;
                    const safeX = isNaN(point.x) ? 0 : Math.min(Math.max(point.x, -50), 50);
                    const safeY = isNaN(point.y) ? 0 : Math.min(Math.max(point.y, -50), 50);
                    const sp = {
                        x: Math.round(safeX / snap) * snap,
                        y: Math.round(safeY / snap) * snap
                    };
                    state.walls.push({
                        id,
                        start: sp,
                        end: sp,
                        thickness: 0.15,
                        height: 2.5
                    });
                    state.interaction.targetId = id;
                } else if (type === 'drawing_floor') {
                    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
                    const snap = 0.1;
                    const safeX = isNaN(point.x) ? 0 : Math.min(Math.max(point.x, -50), 50);
                    const safeY = isNaN(point.y) ? 0 : Math.min(Math.max(point.y, -50), 50);
                    const sp = {
                        x: Math.round(safeX / snap) * snap,
                        y: Math.round(safeY / snap) * snap
                    };
                    // Create a degenerate rectangle (all points at start)
                    state.rooms.push({
                        id,
                        name: 'New Room',
                        color: '#fbbf24',
                        points: [
                            {
                                ...sp
                            },
                            {
                                ...sp
                            },
                            {
                                ...sp
                            },
                            {
                                ...sp
                            }
                        ],
                        center: {
                            ...sp
                        }
                    });
                    state.interaction.targetId = id;
                }
            }),
        updateInteraction: (point, options)=>set((state)=>{
                const { type, targetId, subType, lastPoint } = state.interaction;
                if (type === 'none' || !lastPoint) return;
                const snap = 0.1;
                const safeX = isNaN(point.x) ? 0 : Math.min(Math.max(point.x, -50), 50);
                const safeY = isNaN(point.y) ? 0 : Math.min(Math.max(point.y, -50), 50);
                let sp = {
                    x: Math.round(safeX / snap) * snap,
                    y: Math.round(safeY / snap) * snap
                };
                const lp = {
                    x: Math.round(lastPoint.x / snap) * snap,
                    y: Math.round(lastPoint.y / snap) * snap
                };
                const delta = {
                    x: sp.x - lp.x,
                    y: sp.y - lp.y
                };
                if (type === 'drawing' && targetId) {
                    const wall = state.walls.find((w)=>w.id === targetId);
                    if (wall) {
                        wall.end = sp;
                        // Auto-straighten while drawing if Shift is held
                        if (options?.shiftKey) {
                            const dx = Math.abs(wall.end.x - wall.start.x);
                            const dy = Math.abs(wall.end.y - wall.start.y);
                            if (dx > dy) wall.end.y = wall.start.y;
                            else wall.end.x = wall.start.x;
                        }
                    }
                } else if (type === 'drawing_floor' && targetId) {
                    const room = state.rooms.find((r)=>r.id === targetId);
                    if (room) {
                        // Update P2 (Top-Right) and P3 (Bottom-Left) based on Start (P0) and Current Mouse (P2's X, P3's Y)
                        // Actually, let's treat sp as the diagonal opposite corner
                        // P0 = Start (Fixed)
                        // P1 = { x: sp.x, y: lp.y } -> No, we need origin. 
                        // To do this correctly without extra state, we assume P0 is the anchor.
                        // But P0 changes if we just update points.
                        // We need to know which point is the anchor. 
                        // For simplicity: Point 0 is always the anchor established in startInteraction.
                        // But here we don't have P0 stored separately? 
                        // Actually, P0 in the array IS the anchor if we only update indices 1, 2, 3.
                        const p0 = room.points[0];
                        const p2 = sp;
                        // P1 = { x: p2.x, y: p0.y }
                        // P2 = p2
                        // P3 = { x: p0.x, y: p2.y }
                        // Room Points order: P0 -> P1 -> P2 -> P3 (Clockwise or CCW)
                        room.points[1] = {
                            x: p2.x,
                            y: p0.y
                        };
                        room.points[2] = {
                            ...p2
                        };
                        room.points[3] = {
                            x: p0.x,
                            y: p2.y
                        };
                        // Update Center
                        room.center.x = (p0.x + p2.x) / 2;
                        room.center.y = (p0.y + p2.y) / 2;
                    }
                } else if (type === 'dragging' && targetId) {
                    const wall = state.walls.find((w)=>w.id === targetId);
                    const furn = state.furniture.find((f)=>f.id === targetId);
                    if (wall && (delta.x !== 0 || delta.y !== 0)) {
                        wall.start.x += delta.x;
                        wall.start.y += delta.y;
                        wall.end.x += delta.x;
                        wall.end.y += delta.y;
                    } else if (furn && (delta.x !== 0 || delta.y !== 0)) {
                        furn.position.x += delta.x;
                        furn.position.z += delta.y;
                    } else {
                        const room = state.rooms.find((r)=>r.id === targetId);
                        if (room && (delta.x !== 0 || delta.y !== 0)) {
                            // Move all points
                            room.points.forEach((p)=>{
                                p.x += delta.x;
                                p.y += delta.y;
                            });
                            // Move center
                            room.center.x += delta.x;
                            room.center.y += delta.y;
                        }
                    }
                } else if (type === 'resizing' && targetId) {
                    const wall = state.walls.find((w)=>w.id === targetId);
                    const room = state.rooms.find((r)=>r.id === targetId);
                    const furn = state.furniture.find((f)=>f.id === targetId);
                    if (room && lastPoint) {
                        // Simple uniform scale based on distance from center
                        const dx = point.x - room.center.x;
                        const dy = point.y - room.center.y;
                        const distCurrent = Math.sqrt(dx * dx + dy * dy);
                        const ldx = lastPoint.x - room.center.x;
                        const ldy = lastPoint.y - room.center.y;
                        const distLast = Math.max(0.1, Math.sqrt(ldx * ldx + ldy * ldy)) // Avoid div by zero
                        ;
                        const scale = distCurrent / distLast;
                        // Apply scale to all points relative to center
                        if (Math.abs(scale - 1) > 0.001) {
                            room.points.forEach((p)=>{
                                p.x = room.center.x + (p.x - room.center.x) * scale;
                                p.y = room.center.y + (p.y - room.center.y) * scale;
                            });
                        }
                    } else if (wall && subType) {
                        if (subType === 'start') {
                            wall.start = sp;
                            // Straighten Logic
                            if (options?.shiftKey) {
                                const dx = Math.abs(wall.start.x - wall.end.x);
                                const dy = Math.abs(wall.start.y - wall.end.y);
                                if (dx > dy) wall.start.y = wall.end.y; // Snap to horizontal
                                else wall.start.x = wall.end.x; // Snap to vertical
                            }
                        } else if (subType === 'end') {
                            wall.end = sp;
                            // Straighten Logic
                            if (options?.shiftKey) {
                                const dx = Math.abs(wall.end.x - wall.start.x);
                                const dy = Math.abs(wall.end.y - wall.start.y);
                                if (dx > dy) wall.end.y = wall.start.y;
                                else wall.end.x = wall.start.x;
                            }
                        } else if (subType === 'thickness') {
                            const dx = wall.end.x - wall.start.x;
                            const dy = wall.end.y - wall.start.y;
                            const len = Math.max(Math.sqrt(dx * dx + dy * dy), 0.0001);
                            const nx = -dy / len;
                            const ny = dx / len;
                            const moveX = sp.x - lp.x;
                            const moveY = sp.y - lp.y;
                            const delta = moveX * nx + moveY * ny;
                            const next = Math.min(2, Math.max(0.05, wall.thickness + delta * 2));
                            wall.thickness = next;
                        }
                    } else if (furn && subType) {
                        // Handle furniture resizing
                        // Assume furniture is axis-aligned locally (rotation treated separately or handled by projecting?)
                        // For simplicity, we calculate distance from center in local space?
                        // Or simpler: just use delta.x and delta.y rotated by item rotation?
                        // Let's stick to simple "drag handle away from center" logic.
                        const dx = point.x - furn.position.x;
                        const dy = point.y - furn.position.z;
                        // Rotate point into local space
                        const cos = Math.cos(-furn.rotation.y);
                        const sin = Math.sin(-furn.rotation.y);
                        const localX = dx * cos - dy * sin;
                        const localZ = dx * sin + dy * cos;
                        if (subType === 'resize-width') {
                            // Width corresponds to local X
                            // Handle is at width/2. 
                            // New width = 2 * abs(localX)
                            furn.dimensions.width = Math.max(0.2, Math.abs(localX) * 2);
                        } else if (subType === 'resize-depth') {
                            // Depth corresponds to local Z
                            furn.dimensions.depth = Math.max(0.2, Math.abs(localZ) * 2);
                        }
                    }
                }
                if (delta.x !== 0 || delta.y !== 0 || type === 'drawing' || type === 'resizing' || type === 'drawing_floor') {
                    state.interaction.lastPoint = point;
                }
            }),
        endInteraction: ()=>set((state)=>{
                // Simply reset interaction state - DON'T delete walls
                // Tiny walls are invisible anyway (scale 0.01) so no need to remove
                state.interaction = {
                    type: 'none',
                    targetId: null,
                    lastPoint: null
                };
            }),
        calibrate: (wallId, realLength)=>set((state)=>{
                const wall = state.walls.find((w)=>w.id === wallId);
                if (!wall) return;
                const dx = wall.end.x - wall.start.x;
                const dy = wall.end.y - wall.start.y;
                const currentLen = Math.sqrt(dx * dx + dy * dy);
                if (currentLen > 0) {
                    const prevMetersPerPixel = state.calibrationFactor;
                    const ratio = realLength / currentLen;
                    // Rescale EVERYTHING
                    state.walls.forEach((w)=>{
                        w.start.x *= ratio;
                        w.start.y *= ratio;
                        w.end.x *= ratio;
                        w.end.y *= ratio;
                        // Keep wall thickness in the same unit system as wall coordinates.
                        // If the whole plan scales, thickness must scale too, otherwise it can look
                        // "randomly" huge compared to the plan after calibration.
                        const nextTh = (Number(w.thickness) > 0 ? Number(w.thickness) : 0.15) * ratio;
                        w.thickness = Math.min(Math.max(nextTh, 0.05), 0.6);
                        w.height = Math.min(Math.max(w.height || 2.5, 2.2), 3.5);
                    });
                    state.furniture.forEach((f)=>{
                        // Scale placement in the same coordinate system as walls.
                        f.position.x *= ratio;
                        f.position.z *= ratio;
                        // Don't scale Y placement by calibration ratio; it's already in real-world meters.
                        // (Scaling it makes windows jump/fatten vertically.)
                        // Doors/windows are openings whose thickness should stay thin.
                        // Only scale their opening width; keep depth (thickness) and height stable.
                        if (f.type === 'door') {
                            f.dimensions.width *= ratio;
                            f.dimensions.depth = Math.min(f.dimensions.depth, 0.3);
                            f.dimensions.height = 2.1;
                        } else if (f.type === 'window') {
                            f.dimensions.width *= ratio;
                            f.dimensions.depth = Math.min(f.dimensions.depth, 0.3);
                            f.dimensions.height = 1.2;
                            f.position.y = 1.0;
                        } else {
                            // Generic items can be scaled uniformly if desired.
                            f.position.y *= ratio;
                            f.dimensions.width *= ratio;
                            f.dimensions.height *= ratio;
                            f.dimensions.depth *= ratio;
                        }
                    });
                    state.rooms.forEach((r)=>{
                        r.points.forEach((p)=>{
                            p.x *= ratio;
                            p.y *= ratio;
                        });
                        r.center.x *= ratio;
                        r.center.y *= ratio;
                    });
                    // Keep calibrationFactor as meters-per-pixel so background image and SVG remain in sync.
                    // Since we scaled geometry by `ratio`, meters-per-pixel scales by the same ratio.
                    let metersPerPixel = (prevMetersPerPixel > 0 ? prevMetersPerPixel : 0.01) * ratio;
                    // Guard against broken calibration values (0/NaN/Infinity) which can blow up SVG scaling.
                    if (!isFinite(metersPerPixel) || metersPerPixel <= 0) metersPerPixel = 0.01;
                    metersPerPixel = Math.min(Math.max(metersPerPixel, 1e-5), 0.5);
                    state.calibrationFactor = metersPerPixel;
                    state.exportScale = metersPerPixel; // Backend expects meters-per-pixel
                    state.isCalibrated = true;
                    // Trigger auto-fit to fix "Microscope" view
                    state.fitViewTrigger = (state.fitViewTrigger || 0) + 1;
                    // Advance tutorial
                    if (state.tutorialStep === 'calibration') {
                        state.tutorialStep = 'correction';
                    }
                }
            }),
        updateLabel: (id, label)=>{
            set((state)=>{
                const wall = state.walls.find((w)=>w.id === id);
                if (wall) wall.label = label;
                const item = state.furniture.find((f)=>f.id === id);
                if (item) item.label = label;
            });
        },
        syncSVGAndEnter3D: async ()=>{
            const state = useFloorplanStore.getState();
            if (!state.currentRunId || !state.isCalibrated) return;
            try {
                // Export current state to SVG to ensure backend has latest edits
                const currentSVG = state.exportToSVG();
                // PUT SVG to backend (syncs state but does NOT run Blender)
                const headers = {
                    'Content-Type': 'image/svg+xml'
                };
                if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
                await fetch(`/api/runs/${state.currentRunId}/svg`, {
                    method: 'PUT',
                    headers,
                    body: currentSVG
                });
                // Persist calibration/scale
                await fetch(`/api/runs/${state.currentRunId}/meta`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...state.token ? {
                            'Authorization': `Bearer ${state.token}`
                        } : {}
                    },
                    body: JSON.stringify({
                        scale: state.exportScale || state.calibrationFactor
                    })
                });
            } catch (e) {
                console.error("SVG Sync Error:", e);
            }
        },
        triggerBlenderGeneration: async ()=>{
            const state = useFloorplanStore.getState();
            if (!state.currentRunId || !state.isCalibrated) return;
            set((s)=>{
                s.isGenerating3D = true;
            });
            try {
                // Ensure SVG is synced first before generating
                await state.syncSVGAndEnter3D();
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
                // Explicitly request a Blender Generation job
                const res = await fetch(`/api/runs/${state.currentRunId}/generate-3d`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        scale: state.exportScale || state.calibrationFactor
                    })
                });
                if (res.ok) {
                    state.setRunStatus('processing');
                    state.setLastQueuedTask('gen_3d');
                } else {
                    console.error("Blender Gen Trigger Failed:", await res.text());
                }
            } catch (e) {
                console.error("Blender Gen Trigger Error:", e);
            } finally{
                set((s)=>{
                    s.isGenerating3D = false;
                });
            }
        },
        toggleBackground: ()=>{
            set((state)=>{
                state.showBackground = !state.showBackground;
            });
        },
        triggerRender: async ()=>{
            const state = useFloorplanStore.getState();
            if (!state.currentRunId || state.isRendering) return;
            set((s)=>{
                s.isRendering = true;
                s.renders = [];
            });
            try {
                // Trigger render on server - it will stream images back
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
                const res = await fetch(`/api/runs/${state.currentRunId}/render`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        lighting: state.lightingPreset
                    })
                });
                if (res.ok) {
                    // Poll for renders or use EventSource for streaming
                    const data = await res.json();
                    if (data.renders) {
                        for (const url of data.renders){
                            state.addRender(url);
                            await new Promise((r)=>setTimeout(r, 500)); // Delay between reveals
                        }
                    }
                }
            } catch (e) {
                console.error("Render Error:", e);
            } finally{
                set((s)=>{
                    s.isRendering = false;
                });
            }
        },
        addRender: (url)=>set((state)=>{
                state.renders.push(url);
            }),
        addFurniture: (type, position)=>set((state)=>{
                state.furniture.push({
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    type,
                    position: {
                        x: position.x,
                        y: type === 'window' ? 1.0 : 0,
                        z: position.y
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    dimensions: type === 'door' ? {
                        width: 1,
                        height: 2.1,
                        depth: 0.1
                    } : type === 'window' ? {
                        width: 1.0,
                        height: 1.2,
                        depth: 0.1
                    } // Standard window size
                     : {
                        width: 1,
                        height: 1,
                        depth: 1
                    }
                });
            }),
        addImportedFurniture: ({ id, label, relPath })=>set((state)=>{
                const existing = state.furniture.find((f)=>f.id === id);
                if (existing) {
                    existing.type = existing.type || 'imported';
                    existing.modelUrl = relPath;
                    if (label) existing.label = label;
                    return;
                }
                state.furniture.push({
                    id,
                    type: 'imported',
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    dimensions: {
                        width: 1,
                        height: 1,
                        depth: 1
                    },
                    modelUrl: relPath,
                    label
                });
                state.selectedId = id;
            }),
        updateWall: (id, updates)=>set((state)=>{
                const wall = state.walls.find((w)=>w.id === id);
                if (wall) {
                    Object.assign(wall, updates);
                }
            }),
        updateFurniturePosition: (id, position)=>set((state)=>{
                const item = state.furniture.find((f)=>f.id === id);
                if (!item) return;
                if (typeof position.x === 'number') item.position.x = position.x;
                if (typeof position.y === 'number') item.position.y = position.y;
                if (typeof position.z === 'number') item.position.z = position.z;
            }),
        updateFurniture: (id, updates)=>set((state)=>{
                const item = state.furniture.find((f)=>f.id === id);
                if (item) {
                    // If position/rotation/dimensions are passed partially, we need to merge them carefully
                    if (updates.position) Object.assign(item.position, updates.position);
                    if (updates.rotation) Object.assign(item.rotation, updates.rotation);
                    if (updates.dimensions) Object.assign(item.dimensions, updates.dimensions);
                    // For other top-level keys
                    const { position, rotation, dimensions, ...rest } = updates;
                    Object.assign(item, rest);
                }
            }),
        updateRoom: (id, updates)=>set((state)=>{
                const room = state.rooms.find((r)=>r.id === id);
                if (room) {
                    Object.assign(room, updates);
                }
            }),
        importFromSVG: (svgText)=>set((state)=>{
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, "image/svg+xml");
                const walls = [];
                const furniture = [];
                let pxToM = Number(state.calibrationFactor);
                if (!isFinite(pxToM) || pxToM <= 0) pxToM = 0.01;
                pxToM = Math.min(Math.max(pxToM, 1e-5), 0.5);
                // 1. Get raw bounds to center it
                let offsetX = 0;
                let offsetY = 0;
                // Prefer viewBox centering (authoritative pixel coordinate frame that matches the reference image).
                // Using rect bounds can introduce bias (e.g., walls don't fill the full image height).
                const svgEl = doc.querySelector('svg');
                const vb = svgEl?.getAttribute('viewBox');
                let usedViewBox = false;
                if (vb) {
                    const parts = vb.split(/[\s,]+/).map((p)=>parseFloat(p)).filter((n)=>!isNaN(n));
                    if (parts.length === 4) {
                        const [x, y, w, h] = parts;
                        offsetX = x + w / 2;
                        offsetY = y + h / 2;
                        usedViewBox = true;
                    }
                }
                if (!usedViewBox) {
                    const allRects = Array.from(doc.querySelectorAll('rect'));
                    if (allRects.length > 0) {
                        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                        allRects.forEach((r)=>{
                            const x = parseFloat(r.getAttribute('x') || '0');
                            const y = parseFloat(r.getAttribute('y') || '0');
                            const w = parseFloat(r.getAttribute('width') || '0');
                            const h = parseFloat(r.getAttribute('height') || '0');
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x + w);
                            maxY = Math.max(maxY, y + h);
                        });
                        offsetX = (minX + maxX) / 2;
                        offsetY = (minY + maxY) / 2;
                    }
                }
                // 2. Parse Walls
                const wallGroup = doc.getElementById('wall');
                if (wallGroup) {
                    wallGroup.querySelectorAll('rect').forEach((r)=>{
                        const x = (parseFloat(r.getAttribute('x') || '0') - offsetX) * pxToM;
                        const y = (parseFloat(r.getAttribute('y') || '0') - offsetY) * pxToM;
                        const w = parseFloat(r.getAttribute('width') || '0') * pxToM;
                        const h = parseFloat(r.getAttribute('height') || '0') * pxToM;
                        // We represent vertical/horizontal walls as start/end vectors
                        if (w > h) {
                            const id = r.getAttribute('id') || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
                            const existing = state.walls.find((w)=>w.id === id);
                            // Horizontal wall
                            walls.push({
                                id,
                                start: {
                                    x,
                                    y: y + h / 2
                                },
                                end: {
                                    x: x + w,
                                    y: y + h / 2
                                },
                                thickness: Math.min(Math.max(h, 0.05), 0.6),
                                height: 2.5,
                                ...existing ? {
                                    textureDataUrl: existing.textureDataUrl,
                                    textureTileWidthM: existing.textureTileWidthM,
                                    textureTileHeightM: existing.textureTileHeightM
                                } : {}
                            });
                        } else {
                            const id = r.getAttribute('id') || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
                            const existing = state.walls.find((w)=>w.id === id);
                            // Vertical wall
                            walls.push({
                                id,
                                start: {
                                    x: x + w / 2,
                                    y
                                },
                                end: {
                                    x: x + w / 2,
                                    y: y + h
                                },
                                thickness: Math.min(Math.max(w, 0.05), 0.6),
                                height: 2.5,
                                ...existing ? {
                                    textureDataUrl: existing.textureDataUrl,
                                    textureTileWidthM: existing.textureTileWidthM,
                                    textureTileHeightM: existing.textureTileHeightM
                                } : {}
                            });
                        }
                    });
                }
                // 3b. Parse imported model placemarks (written by backend upload)
                const importedGroup = doc.getElementById('imported-models');
                if (importedGroup) {
                    importedGroup.querySelectorAll('g').forEach((g)=>{
                        const importId = g.getAttribute('data-import-id') || g.getAttribute('id') || '';
                        const relPath = g.getAttribute('data-rel-path') || '';
                        const name = g.getAttribute('data-name') || '';
                        // Prefer circle center
                        let cx = null;
                        let cy = null;
                        const circle = g.querySelector('circle');
                        if (circle) {
                            const cxs = circle.getAttribute('cx');
                            const cys = circle.getAttribute('cy');
                            const cxf = parseFloat(cxs || 'NaN');
                            const cyf = parseFloat(cys || 'NaN');
                            if (!isNaN(cxf) && !isNaN(cyf)) {
                                cx = cxf;
                                cy = cyf;
                            }
                        }
                        // Fallback to text x/y
                        if (cx === null || cy === null) {
                            const text = g.querySelector('text');
                            if (text) {
                                const tx = parseFloat(text.getAttribute('x') || 'NaN');
                                const ty = parseFloat(text.getAttribute('y') || 'NaN');
                                if (!isNaN(tx) && !isNaN(ty)) {
                                    cx = tx;
                                    cy = ty;
                                }
                            }
                        }
                        if (cx === null || cy === null) return;
                        const id = String(importId).replace(/^imported_/, '') || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
                        furniture.push({
                            id,
                            type: 'imported',
                            position: {
                                x: (cx - offsetX) * pxToM,
                                y: 0,
                                z: (cy - offsetY) * pxToM
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            dimensions: {
                                width: 1,
                                height: 1,
                                depth: 1
                            },
                            modelUrl: relPath,
                            label: name
                        });
                    });
                }
                // 3. Parse Doors/Windows as simple furniture placeholders for now
                const openings = [
                    'door',
                    'window'
                ];
                openings.forEach((type)=>{
                    const group = doc.getElementById(type);
                    if (group) {
                        group.querySelectorAll('rect').forEach((r)=>{
                            const x = (parseFloat(r.getAttribute('x') || '0') - offsetX) * pxToM;
                            const y = (parseFloat(r.getAttribute('y') || '0') - offsetY) * pxToM;
                            const w = parseFloat(r.getAttribute('width') || '0') * pxToM;
                            const h = parseFloat(r.getAttribute('height') || '0') * pxToM;
                            furniture.push({
                                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                                type: type,
                                position: {
                                    x: x + w / 2,
                                    y: 0,
                                    z: y + h / 2
                                },
                                rotation: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                },
                                dimensions: {
                                    width: w,
                                    height: 2.1,
                                    depth: h
                                }
                            });
                        });
                    }
                });
                // 4. Parse Room Polygons
                const rooms = [];
                const roomColors = [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#06b6d4',
                    '#ec4899'
                ];
                let colorIndex = 0;
                const parseTransform = (transform)=>{
                    const t = (transform || '').trim();
                    if (!t) return {
                        tx: 0,
                        ty: 0
                    };
                    // translate(x [y])
                    const mTranslate = t.match(/translate\(\s*([+-]?[\d.]+)(?:[\s,]+([+-]?[\d.]+))?\s*\)/i);
                    if (mTranslate) {
                        const tx = parseFloat(mTranslate[1]);
                        const ty = parseFloat(mTranslate[2] ?? '0');
                        return {
                            tx: isNaN(tx) ? 0 : tx,
                            ty: isNaN(ty) ? 0 : ty
                        };
                    }
                    // matrix(a b c d e f) => translation is (e, f)
                    const mMatrix = t.match(/matrix\(\s*([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)\s*\)/i);
                    if (mMatrix) {
                        const tx = parseFloat(mMatrix[5]);
                        const ty = parseFloat(mMatrix[6]);
                        return {
                            tx: isNaN(tx) ? 0 : tx,
                            ty: isNaN(ty) ? 0 : ty
                        };
                    }
                    return {
                        tx: 0,
                        ty: 0
                    };
                };
                const getSvgXY = (el)=>{
                    const xAttr = el.getAttribute('x');
                    const yAttr = el.getAttribute('y');
                    let x = parseFloat(xAttr || '0');
                    let y = parseFloat(yAttr || '0');
                    // If x/y are missing or 0, many OCR pipelines use transform instead
                    const tr = parseTransform(el.getAttribute('transform'));
                    const hasExplicitXY = xAttr !== null || yAttr !== null;
                    if (!hasExplicitXY) {
                        x = tr.tx;
                        y = tr.ty;
                    } else {
                        x += tr.tx;
                        y += tr.ty;
                    }
                    return {
                        x,
                        y
                    };
                };
                const parsePointsAttr = (pointsAttr)=>{
                    const pts = [];
                    const parts = (pointsAttr || '').trim().split(/[\s]+/).filter(Boolean);
                    for (const part of parts){
                        const xy = part.split(',');
                        if (xy.length < 2) continue;
                        const px = parseFloat(xy[0]);
                        const py = parseFloat(xy[1]);
                        if (!isNaN(px) && !isNaN(py)) pts.push({
                            x: px,
                            y: py
                        });
                    }
                    return pts;
                };
                const addRoomFromSvgPolygon = (polyEl)=>{
                    const pointsAttr = polyEl.getAttribute('points') || '';
                    const rawPts = parsePointsAttr(pointsAttr);
                    if (rawPts.length < 3) return;
                    // Apply simple translation transforms from the polygon itself and its immediate parent (common for grouped rooms)
                    const selfTr = parseTransform(polyEl.getAttribute('transform'));
                    const parentTr = parseTransform(polyEl.parentElement?.getAttribute?.('transform'));
                    const tx = selfTr.tx + parentTr.tx;
                    const ty = selfTr.ty + parentTr.ty;
                    const pts = rawPts.map((p)=>({
                            x: (p.x + tx - offsetX) * pxToM,
                            y: (p.y + ty - offsetY) * pxToM
                        }));
                    const xs = pts.map((p)=>p.x);
                    const ys = pts.map((p)=>p.y);
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);
                    const minY = Math.min(...ys);
                    const maxY = Math.max(...ys);
                    const id = polyEl.getAttribute('id') || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
                    const name = polyEl.getAttribute('data-name') || polyEl.getAttribute('data-label') || polyEl.getAttribute('id') || `Room ${rooms.length + 1}`;
                    const existing = state.rooms.find((r)=>r.id === id);
                    rooms.push({
                        id,
                        name,
                        points: pts,
                        color: roomColors[colorIndex % roomColors.length],
                        center: {
                            x: (minX + maxX) / 2,
                            y: (minY + maxY) / 2
                        },
                        ...existing ? {
                            textureDataUrl: existing.textureDataUrl,
                            textureTileWidthM: existing.textureTileWidthM,
                            textureTileHeightM: existing.textureTileHeightM
                        } : {}
                    });
                    colorIndex++;
                };
                // Try different group names for rooms
                const roomGroupNames = [
                    'room',
                    'rooms',
                    'floor',
                    'floors',
                    'space',
                    'spaces'
                ];
                let roomGroup = null;
                for (const name of roomGroupNames){
                    roomGroup = doc.getElementById(name);
                    if (roomGroup) break;
                }
                // Prefer backend geometric rooms if present
                const roomsGeomGroup = doc.getElementById('rooms-geometry');
                if (roomsGeomGroup) {
                    roomsGeomGroup.querySelectorAll('polygon').forEach((p)=>addRoomFromSvgPolygon(p));
                }
                const hasBackendGeomRooms = rooms.length > 0;
                if (roomGroup && !hasBackendGeomRooms) {
                    // Look for rect elements as room bounds
                    roomGroup.querySelectorAll('rect').forEach((r)=>{
                        const x = (parseFloat(r.getAttribute('x') || '0') - offsetX) * pxToM;
                        const y = (parseFloat(r.getAttribute('y') || '0') - offsetY) * pxToM;
                        const w = parseFloat(r.getAttribute('width') || '0') * pxToM;
                        const h = parseFloat(r.getAttribute('height') || '0') * pxToM;
                        const label = r.getAttribute('data-label') || r.getAttribute('id') || `Room ${rooms.length + 1}`;
                        const id = r.getAttribute('id') || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
                        const existing = state.rooms.find((r)=>r.id === id);
                        rooms.push({
                            id,
                            name: label,
                            points: [
                                {
                                    x,
                                    y
                                },
                                {
                                    x: x + w,
                                    y
                                },
                                {
                                    x: x + w,
                                    y: y + h
                                },
                                {
                                    x,
                                    y: y + h
                                }
                            ],
                            color: roomColors[colorIndex % roomColors.length],
                            center: {
                                x: x + w / 2,
                                y: y + h / 2
                            },
                            ...existing ? {
                                textureDataUrl: existing.textureDataUrl,
                                textureTileWidthM: existing.textureTileWidthM,
                                textureTileHeightM: existing.textureTileHeightM
                            } : {}
                        });
                        colorIndex++;
                    });
                    // Also accept polygon rooms if present (legacy pipeline)
                    roomGroup.querySelectorAll('polygon').forEach((p)=>addRoomFromSvgPolygon(p));
                }
                // Also look for text elements as room labels
                // Always run this so OCR text attached to existing rooms is hydrated properly.
                doc.querySelectorAll('text').forEach((textEl)=>{
                    const textContent = textEl.textContent?.trim() || '';
                    // Skip dimension numbers (just digits/decimal)
                    if (!textContent || textContent.match(/^[\d.]+\s*(m|cm|ft|'|")?$/)) return;
                    const { x: rawX, y: rawY } = getSvgXY(textEl);
                    const textX = (rawX - offsetX) * pxToM;
                    const textY = (rawY - offsetY) * pxToM;
                    // Check if this looks like a room name (has letters)
                    if (textContent.match(/[a-zA-Z]/)) {
                        // Find matching room: Containment first, then proximity
                        let candidates = rooms.filter((r)=>{
                            const xs = r.points.map((p)=>p.x);
                            const ys = r.points.map((p)=>p.y);
                            const minX = Math.min(...xs);
                            const maxX = Math.max(...xs);
                            const minY = Math.min(...ys);
                            const maxY = Math.max(...ys);
                            return textX >= minX && textX <= maxX && textY >= minY && textY <= maxY;
                        });
                        if (candidates.length === 0) {
                            candidates = rooms.filter((r)=>Math.abs(r.center.x - textX) < 3 && Math.abs(r.center.y - textY) < 3);
                        }
                        const nearRoom = candidates.sort((a, b)=>{
                            const da = (textX - a.center.x) ** 2 + (textY - a.center.y) ** 2;
                            const db = (textX - b.center.x) ** 2 + (textY - b.center.y) ** 2;
                            return da - db;
                        })[0];
                        if (nearRoom) {
                            nearRoom.name = textContent;
                        } else {
                            // Calculate room bounds from nearest walls/openings
                            // Init with large values
                            let minLeft = -Infinity, maxRight = Infinity, minTop = -Infinity, maxBottom = Infinity;
                            const padding = 2 // Tolerance for text being slightly "past" the wall edge
                            ;
                            // Treat Walls AND Doors/Windows as boundaries
                            const boundaries = [
                                ...walls.map((w)=>({
                                        start: w.start,
                                        end: w.end
                                    })),
                                ...furniture.filter((f)=>f.type === 'door' || f.type === 'window' || f.type === 'opening').map((f)=>{
                                    const w = f.dimensions.width;
                                    const d = f.dimensions.depth;
                                    // Assume horizontal if width > depth (standard for most aligned items)
                                    if (w > d) {
                                        return {
                                            start: {
                                                x: f.position.x - w / 2,
                                                y: f.position.z
                                            },
                                            end: {
                                                x: f.position.x + w / 2,
                                                y: f.position.z
                                            }
                                        };
                                    } else {
                                        return {
                                            start: {
                                                x: f.position.x,
                                                y: f.position.z - d / 2
                                            },
                                            end: {
                                                x: f.position.x,
                                                y: f.position.z + d / 2
                                            }
                                        };
                                    }
                                })
                            ];
                            boundaries.forEach((w)=>{
                                const wallCenterX = (w.start.x + w.end.x) / 2;
                                const wallCenterY = (w.start.y + w.end.y) / 2;
                                const dx = w.end.x - w.start.x;
                                const dy = w.end.y - w.start.y;
                                const isHorizontal = Math.abs(dx) > Math.abs(dy);
                                if (isHorizontal) {
                                    // Horizontal wall - potential Top/Bottom boundary
                                    // Check if text is within the X-span of this wall
                                    const wMinX = Math.min(w.start.x, w.end.x);
                                    const wMaxX = Math.max(w.start.x, w.end.x);
                                    if (textX >= wMinX - padding && textX <= wMaxX + padding) {
                                        if (wallCenterY < textY && wallCenterY > minTop) {
                                            minTop = wallCenterY; // Wall above
                                        }
                                        if (wallCenterY > textY && wallCenterY < maxBottom) {
                                            maxBottom = wallCenterY; // Wall below
                                        }
                                    }
                                } else {
                                    // Vertical wall - potential Left/Right boundary
                                    // Check if text is within the Y-span of this wall
                                    const wMinY = Math.min(w.start.y, w.end.y);
                                    const wMaxY = Math.max(w.start.y, w.end.y);
                                    if (textY >= wMinY - padding && textY <= wMaxY + padding) {
                                        if (wallCenterX < textX && wallCenterX > minLeft) {
                                            minLeft = wallCenterX; // Wall to left
                                        }
                                        if (wallCenterX > textX && wallCenterX < maxRight) {
                                            maxRight = wallCenterX; // Wall to right
                                        }
                                    }
                                }
                            });
                            // Validate and Apply Fallbacks
                            // If walls weren't found (gap in raycast), use default 2.5m radiu
                            if (minLeft === -Infinity) minLeft = textX - 2.5;
                            if (maxRight === Infinity) maxRight = textX + 2.5;
                            if (minTop === -Infinity) minTop = textY - 2.5;
                            if (maxBottom === Infinity) maxBottom = textY + 2.5;
                            const width = maxRight - minLeft;
                            const height = maxBottom - minTop;
                            // If dimensions are still weird (too small or massive), default to 4x4m box
                            if (width < 0.5 || width > 50 || height < 0.5 || height > 50) {
                                minLeft = textX - 2;
                                maxRight = textX + 2;
                                minTop = textY - 2;
                                maxBottom = textY + 2;
                            }
                            // Always create the room if a label exists
                            rooms.push({
                                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                                name: textContent,
                                points: [
                                    {
                                        x: minLeft,
                                        y: minTop
                                    },
                                    {
                                        x: maxRight,
                                        y: minTop
                                    },
                                    {
                                        x: maxRight,
                                        y: maxBottom
                                    },
                                    {
                                        x: minLeft,
                                        y: maxBottom
                                    }
                                ],
                                color: roomColors[colorIndex % roomColors.length],
                                center: {
                                    x: (minLeft + maxRight) / 2,
                                    y: (minTop + maxBottom) / 2
                                }
                            });
                            colorIndex++;
                        }
                    }
                });
                const polygonArea = (pts)=>{
                    if (pts.length < 3) return 0;
                    let a = 0;
                    for(let i = 0; i < pts.length; i++){
                        const j = (i + 1) % pts.length;
                        a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
                    }
                    return a / 2;
                };
                const roomAreaAbs = (r)=>Math.abs(polygonArea(r.points));
                const minRoomArea = 0.5;
                let filteredRooms = rooms.filter((r)=>roomAreaAbs(r) >= minRoomArea);
                filteredRooms.sort((a, b)=>roomAreaAbs(b) - roomAreaAbs(a));
                const deduped = [];
                const centerEps = 0.35;
                const areaRatioEps = 0.12;
                for (const r of filteredRooms){
                    const a = roomAreaAbs(r);
                    const isDup = deduped.some((d)=>{
                        const dx = d.center.x - r.center.x;
                        const dy = d.center.y - r.center.y;
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 > centerEps * centerEps) return false;
                        const da = roomAreaAbs(d);
                        const ratio = Math.abs(da - a) / Math.max(da, a, 1e-6);
                        return ratio < areaRatioEps;
                    });
                    if (!isDup) deduped.push(r);
                }
                for(let i = 0; i < deduped.length; i++){
                    if (!deduped[i].name || deduped[i].name.startsWith('Room ')) {
                        deduped[i].name = `Room ${i + 1}`;
                    }
                }
                rooms.length = 0;
                rooms.push(...deduped);
                console.log('[DEBUG importFromSVG] Parsed:', {
                    walls: walls.length,
                    furniture: furniture.length,
                    rooms: rooms.length
                });
                // Create a single floor covering all walls if we have walls
                // Create a single floor covering all walls if we have walls
                // REMOVED: Do not auto-generate a master floor when rooms are missing.
                // User wants to edit walls without floor interference first.
                /*
            if (walls.length > 0) {
                let floorMinX = Infinity, floorMinY = Infinity
                let floorMaxX = -Infinity, floorMaxY = -Infinity
 
                walls.forEach(w => {
                    floorMinX = Math.min(floorMinX, w.start.x, w.end.x)
                    floorMaxX = Math.max(floorMaxX, w.start.x, w.end.x)
                    floorMinY = Math.min(floorMinY, w.start.y, w.end.y)
                    floorMaxY = Math.max(floorMaxY, w.start.y, w.end.y)
                })
 
                // Add a "master floor" that covers the entire plan
                // Individual room labels still show on top
                if (rooms.length === 0) {
                     // Logic removed
                }
            }
            */ state.walls = walls;
                state.furniture = furniture;
                // Prevent "random" floor/room disappearance:
                // Sometimes we re-import an SVG that doesn't include room geometry/labels.
                // In that case, don't overwrite existing rooms with [].
                if (rooms.length > 0 || state.rooms.length === 0) {
                    state.rooms = rooms;
                }
                // Auto-fit camera after importing new geometry (prevents "cleared" / off-screen view)
                state.fitViewTrigger = (state.fitViewTrigger || 0) + 1;
                // Start Tutorial Flow if not calibrated.
                // IMPORTANT: Don't force tutorial steps when loading an existing project SVG.
                // New-run tutorial progression is handled by Topbar polling and explicit actions.
                if (!state.isCalibrated && state.tutorialStep === 'none' && walls.length === 0 && rooms.length === 0) {
                    state.tutorialStep = 'calibration';
                    state.activeTool = 'none'; // forcing user to select ruler themselves? Or maybe set to 'none' so overlay guides them
                }
            }),
        exportToSVG: ()=>{
            const state = useFloorplanStore.getState();
            const { walls, furniture, calibrationFactor } = state;
            // Inverse calibration: Metrics stored in meters. SVG usually in pixels or relative units.
            // importFromSVG used: val_m = (val_px - offset) * pxToM
            // So: val_px = (val_m / pxToM) + offset
            // We'll normalize offset to 0 for simplicity, or keep existing bounds?
            // Safer to just export everything relative to 0,0 or finding bounds.
            // 1. Find Bounds
            let minX = Infinity, minY = Infinity;
            walls.forEach((w)=>{
                minX = Math.min(minX, w.start.x, w.end.x);
                minY = Math.min(minY, w.start.y, w.end.y);
            });
            // If empty, default 0
            if (minX === Infinity) {
                minX = 0;
                minY = 0;
            }
            const padding = 50 // px padding
            ;
            let mpp = Number(calibrationFactor);
            if (!isFinite(mpp) || mpp <= 0) mpp = 0.01;
            mpp = Math.min(Math.max(mpp, 1e-5), 0.5);
            const pxPerMeter = 1 / mpp;
            // Helper to coord
            const toPx = (val, minVal)=>(val - minVal) * pxPerMeter + padding;
            // Calculate SVG Dimensions
            let maxX = -Infinity, maxY = -Infinity;
            walls.forEach((w)=>{
                maxX = Math.max(maxX, w.start.x, w.end.x);
                maxY = Math.max(maxY, w.start.y, w.end.y);
            });
            const width = (maxX - minX) * pxPerMeter + padding * 2;
            const height = (maxY - minY) * pxPerMeter + padding * 2;
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
            // A. Base/Background (Optional, backend adds it usually, but let's be clean)
            // Backend master.py adds base. We only need the items.
            // Actually, master.py expects walls/doors/windows to generate base.
            // We should just output the groups.
            // B. Walls
            svg += `  <g id="wall">\n`;
            walls.forEach((w)=>{
                // Determine Rect from Line
                // Horizontal vs Vertical
                const dx = w.end.x - w.start.x;
                const dy = w.end.y - w.start.y;
                let rx, ry, rw, rh;
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal
                    rx = Math.min(w.start.x, w.end.x);
                    ry = w.start.y - w.thickness / 2;
                    rw = Math.abs(dx);
                    rh = w.thickness;
                } else {
                    // Vertical
                    rx = w.start.x - w.thickness / 2;
                    ry = Math.min(w.start.y, w.end.y);
                    rw = w.thickness;
                    rh = Math.abs(dy);
                }
                svg += `    <rect id="${w.id}" x="${toPx(rx, minX)}" y="${toPx(ry, minY)}" width="${rw * pxPerMeter}" height="${rh * pxPerMeter}" fill="#222222" />\n`;
            });
            svg += `  </g>\n`;
            // C. Doors / Windows
            const doors = furniture.filter((f)=>f.type === 'door');
            if (doors.length > 0) {
                svg += `  <g id="door">\n`;
                doors.forEach((d)=>{
                    const rx = d.position.x - d.dimensions.width / 2;
                    const rz = d.position.z - d.dimensions.depth / 2;
                    svg += `    <rect id="${d.id}" x="${toPx(rx, minX)}" y="${toPx(rz, minY)}" width="${d.dimensions.width * pxPerMeter}" height="${d.dimensions.depth * pxPerMeter}" fill="#8B4513" />\n`;
                });
                svg += `  </g>\n`;
            }
            const windows = furniture.filter((f)=>f.type === 'window');
            if (windows.length > 0) {
                svg += `  <g id="window">\n`;
                windows.forEach((d)=>{
                    const rx = d.position.x - d.dimensions.width / 2;
                    const rz = d.position.z - d.dimensions.depth / 2;
                    svg += `    <rect id="${d.id}" x="${toPx(rx, minX)}" y="${toPx(rz, minY)}" width="${d.dimensions.width * pxPerMeter}" height="${d.dimensions.depth * pxPerMeter}" fill="#0000FF" />\n`;
                });
                svg += `  </g>\n`;
            }
            // D. Imported model placemarks (for mapping in backend/Blender)
            const imported = furniture.filter((f)=>f.type === 'imported' && f.modelUrl);
            if (imported.length > 0) {
                svg += `  <g id="imported-models" opacity="0.95">\n`;
                imported.forEach((it)=>{
                    const cx = toPx(it.position.x, minX);
                    const cy = toPx(it.position.z, minY);
                    const safeRel = String(it.modelUrl || '').replace(/"/g, '');
                    const safeName = String(it.label || '').replace(/"/g, '');
                    svg += `    <g id="imported_${it.id}" data-import-id="${it.id}" data-rel-path="${safeRel}" data-name="${safeName}">\n`;
                    svg += `      <circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="#00ffff" stroke-width="2" />\n`;
                    svg += `      <text x="${cx + 14}" y="${cy + 4}" font-size="14" fill="#00ffff" stroke="#000" stroke-width="0.6" paint-order="stroke">IMPORTED</text>\n`;
                    svg += `    </g>\n`;
                });
                svg += `  </g>\n`;
            }
            // E. Rooms (export so backend can target floors by id for texturize)
            if (state.rooms.length > 0) {
                svg += `  <g id="rooms-geometry" opacity="0.35">\n`;
                state.rooms.forEach((r)=>{
                    const pts = r.points.map((p)=>`${toPx(p.x, minX)},${toPx(p.y, minY)}`).join(' ');
                    const safeName = String(r.name || '').replace(/"/g, '');
                    svg += `    <polygon id="${r.id}" points="${pts}" fill="${r.color || '#e2e8f0'}" stroke="none" data-name="${safeName}" />\n`;
                });
                svg += `  </g>\n`;
            }
            svg += `</svg>`;
            return svg;
        },
        generateFloors: async ()=>{
            set((state)=>{
                // simple base floor generation: bounding box + padding
                if (state.walls.length === 0) return;
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                state.walls.forEach((w)=>{
                    minX = Math.min(minX, w.start.x, w.end.x);
                    minY = Math.min(minY, w.start.y, w.end.y);
                    maxX = Math.max(maxX, w.start.x, w.end.x);
                    maxY = Math.max(maxY, w.start.y, w.end.y);
                });
                // Add 20% padding
                const width = maxX - minX;
                const height = maxY - minY;
                const padX = width * 0.2;
                const padY = height * 0.2;
                // Define a single large rectangular room
                const baseRoom = {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    name: 'Base Floor',
                    points: [
                        {
                            x: minX - padX,
                            y: minY - padY
                        },
                        {
                            x: maxX + padX,
                            y: minY - padY
                        },
                        {
                            x: maxX + padX,
                            y: maxY + padY
                        },
                        {
                            x: minX - padX,
                            y: maxY + padY
                        }
                    ],
                    color: '#e2e8f0',
                    center: {
                        x: (minX + maxX) / 2,
                        y: (minY + maxY) / 2
                    }
                };
                state.rooms = [
                    baseRoom
                ];
                console.log("Generated Base Floor:", baseRoom);
                if (state.tutorialStep === 'correction') {
                    state.tutorialStep = 'floor_review';
                }
            });
        },
        handleDrop: (type, x, y)=>set((state)=>{
                state.pendingDrop = {
                    type,
                    x,
                    y
                };
            }),
        // Undo/Redo/Clipboard implementations
        saveHistory: ()=>set((state)=>{
                // For simplicity, we only store last 20 states
                const snapshot = {
                    walls: JSON.parse(JSON.stringify(state.walls)),
                    furniture: JSON.parse(JSON.stringify(state.furniture)),
                    rooms: JSON.parse(JSON.stringify(state.rooms))
                };
                // Truncate future history if we're in the middle of undo stack
                const newHistory = [
                    ...state.history?.slice(0, state.historyIndex + 1) || [],
                    snapshot
                ].slice(-20);
                state.history = newHistory;
                state.historyIndex = newHistory.length - 1;
            }),
        undo: ()=>set((state)=>{
                const history = state.history || [];
                const idx = state.historyIndex ?? history.length - 1;
                if (idx > 0) {
                    const prev = history[idx - 1];
                    state.walls = JSON.parse(JSON.stringify(prev.walls));
                    state.furniture = JSON.parse(JSON.stringify(prev.furniture));
                    state.rooms = JSON.parse(JSON.stringify(prev.rooms));
                    state.historyIndex = idx - 1;
                }
            }),
        redo: ()=>set((state)=>{
                const history = state.history || [];
                const idx = state.historyIndex ?? history.length - 1;
                if (idx < history.length - 1) {
                    const next = history[idx + 1];
                    state.walls = JSON.parse(JSON.stringify(next.walls));
                    state.furniture = JSON.parse(JSON.stringify(next.furniture));
                    state.rooms = JSON.parse(JSON.stringify(next.rooms));
                    state.historyIndex = idx + 1;
                }
            }),
        copyObject: ()=>set((state)=>{
                if (!state.selectedId) return;
                const wall = state.walls.find((w)=>w.id === state.selectedId);
                if (wall) {
                    ;
                    state.clipboard = {
                        type: 'wall',
                        data: JSON.parse(JSON.stringify(wall))
                    };
                    return;
                }
                const furn = state.furniture.find((f)=>f.id === state.selectedId);
                if (furn) {
                    ;
                    state.clipboard = {
                        type: 'furniture',
                        data: JSON.parse(JSON.stringify(furn))
                    };
                }
            }),
        pasteObject: ()=>set((state)=>{
                const clipboard = state.clipboard;
                if (!clipboard) return;
                if (clipboard.type === 'wall') {
                    const newWall = {
                        ...clipboard.data,
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()
                    };
                    newWall.start = {
                        x: newWall.start.x + 0.5,
                        y: newWall.start.y + 0.5
                    };
                    newWall.end = {
                        x: newWall.end.x + 0.5,
                        y: newWall.end.y + 0.5
                    };
                    state.walls.push(newWall);
                    state.selectedId = newWall.id;
                } else if (clipboard.type === 'furniture') {
                    const newFurn = {
                        ...clipboard.data,
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()
                    };
                    newFurn.position = {
                        ...newFurn.position,
                        x: newFurn.position.x + 0.5,
                        z: newFurn.position.z + 0.5
                    };
                    state.furniture.push(newFurn);
                    state.selectedId = newFurn.id;
                }
            }),
        consumeDrop: ()=>set((state)=>{
                state.pendingDrop = null;
            }),
        showToast: (message, type = 'info')=>{
            set((state)=>{
                state.toast = {
                    message,
                    type
                };
            });
            // Auto dismiss
            setTimeout(()=>{
                set((state)=>{
                    if (state.toast?.message === message) {
                        state.toast = null;
                    }
                });
            }, 3000);
        }
    })));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/ImportModelModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImportModelModal",
    ()=>ImportModelModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileBox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-box.js [app-client] (ecmascript) <export default as FileBox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function ImportModelModal({ isOpen, onClose, onImport }) {
    _s();
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedFiles, setSelectedFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const handleDragOver = (e)=>{
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e)=>{
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e)=>{
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFiles(Array.from(e.dataTransfer.files));
        }
    };
    const handleFileSelect = (e)=>{
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFiles(Array.from(e.target.files));
        }
    };
    const validateAndSetFiles = (files)=>{
        const validFiles = [];
        files.forEach((file)=>{
            const ext = file.name.split('.').pop()?.toLowerCase();
            if ([
                'glb',
                'gltf',
                'obj',
                'fbx'
            ].includes(ext || '')) {
                validFiles.push(file);
            }
        });
        if (validFiles.length > 0) {
            setSelectedFiles((prev)=>[
                    ...prev,
                    ...validFiles
                ]);
        }
        if (validFiles.length !== files.length) {
            alert("Some files were skipped. Only .glb, .gltf, .obj, .fbx are supported.");
        }
    };
    const handleSubmit = ()=>{
        if (selectedFiles.length > 0) {
            onImport(selectedFiles);
            onClose(); // Close after import trigger
            setSelectedFiles([]);
        }
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-[500px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileBox$3e$__["FileBox"], {
                                    className: "w-5 h-5 text-blue-400"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                    lineNumber: 76,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-semibold text-white tracking-wide",
                                    children: "Import 3D Asset"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                    lineNumber: 77,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                            lineNumber: 75,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-white/40 hover:text-white transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                lineNumber: 80,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                            lineNumber: 79,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                    lineNumber: 74,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8",
                    children: selectedFiles.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onDragOver: handleDragOver,
                        onDragLeave: handleDragLeave,
                        onDrop: handleDrop,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer relative group", isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "file",
                                accept: ".glb,.gltf,.obj,.fbx",
                                multiple: true,
                                className: "absolute inset-0 opacity-0 cursor-pointer",
                                onChange: handleFileSelect
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                lineNumber: 96,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                    className: "w-8 h-8 text-blue-400"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                    lineNumber: 105,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                lineNumber: 104,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium text-white mb-1",
                                        children: "Click or drag files to upload"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                        lineNumber: 109,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-white/40 font-mono",
                                        children: "Supports Multiple GLB, OBJ, FBX"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                        lineNumber: 110,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                lineNumber: 108,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                        lineNumber: 87,
                        columnNumber: 25
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-64 flex flex-col items-center justify-center gap-6 animate-in fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                    className: "w-10 h-10 text-green-500"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                    lineNumber: 116,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                lineNumber: 115,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-white mb-1",
                                        children: [
                                            selectedFiles.length,
                                            " Files Selected"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                        lineNumber: 119,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-h-24 overflow-y-auto px-4 custom-scrollbar",
                                        children: selectedFiles.map((f, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-white/40 font-mono truncate max-w-[300px]",
                                                children: f.name
                                            }, i, false, {
                                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                                lineNumber: 122,
                                                columnNumber: 41
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                        lineNumber: 120,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                lineNumber: 118,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedFiles([]),
                                        className: "text-xs text-red-400 hover:underline",
                                        children: "Clear All"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                        lineNumber: 127,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs text-blue-400 hover:underline cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Add More"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                                lineNumber: 134,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                multiple: true,
                                                accept: ".glb,.gltf,.obj,.fbx",
                                                className: "hidden",
                                                onChange: handleFileSelect
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                                lineNumber: 135,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                        lineNumber: 133,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                                lineNumber: 126,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                        lineNumber: 114,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                    lineNumber: 85,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-4 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                            lineNumber: 150,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSubmit,
                            disabled: selectedFiles.length === 0,
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-6 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-lg", selectedFiles.length > 0 ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20" : "bg-white/10 text-white/30 cursor-not-allowed"),
                            children: "Bring to Floorplan"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                            lineNumber: 156,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/ImportModelModal.tsx",
                    lineNumber: 149,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/ImportModelModal.tsx",
            lineNumber: 72,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/ImportModelModal.tsx",
        lineNumber: 71,
        columnNumber: 9
    }, this);
}
_s(ImportModelModal, "glLxa1bSW4U8fAFl8xGFoc1Yzyo=");
_c = ImportModelModal;
var _c;
__turbopack_context__.k.register(_c, "ImportModelModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/FurnAIModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FurnAIModal",
    ()=>FurnAIModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const COLORS = [
    '#F472B6',
    '#60A5FA',
    '#34D399',
    '#FBBF24',
    '#A78BFA',
    '#F87171'
];
function FurnAIModal({ isOpen, onClose }) {
    _s();
    const [image, setImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imageDims, setImageDims] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [labels, setLabels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activePoints, setActivePoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const { currentRunId, token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const warmupRequestedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Temporary mask preview
    const [previewPolygon, setPreviewPolygon] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // UI State
    // const [isHolding, setIsHolding] = useState(false) // Removed explicitly
    const [labelInput, setLabelInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isProcessing, setIsProcessing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [statusMsg, setStatusMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const imgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleClose = ()=>{
        if (currentRunId) {
            fetch('/api/sam3d/unload-model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                },
                body: JSON.stringify({
                    run_id: currentRunId
                })
            }).catch(()=>{});
        }
        onClose();
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FurnAIModal.useEffect": ()=>{
            if (!isOpen) {
                warmupRequestedRef.current = false;
                return;
            }
            if (!currentRunId || warmupRequestedRef.current) return;
            warmupRequestedRef.current = true;
            fetch('/api/sam3d/load-model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                },
                body: JSON.stringify({
                    run_id: currentRunId
                })
            }).catch({
                "FurnAIModal.useEffect": ()=>{}
            }["FurnAIModal.useEffect"]);
        }
    }["FurnAIModal.useEffect"], [
        isOpen,
        currentRunId,
        token
    ]);
    const handleImageUpload = (e)=>{
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setImage(url);
            // Reset state
            setLabels([]);
            setActivePoints([]);
        }
    };
    const handleImageClick = (e)=>{
        if (!image || !imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const scaleX = (imgRef.current.naturalWidth || rect.width) / rect.width;
        const scaleY = (imgRef.current.naturalHeight || rect.height) / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const newPoint = {
            x,
            y,
            id: Math.random().toString(36).substr(2, 9)
        };
        if (e.shiftKey) {
            // Add to active group (Multi-select)
            setActivePoints((prev)=>[
                    ...prev,
                    newPoint
                ]);
        } else {
            // New selection - clear previous unless shifting
            setActivePoints([
                newPoint
            ]);
            setPreviewPolygon(null);
        }
        // TRIGGER BACKEND INFERENCE
        if (currentRunId) {
            setIsProcessing(true);
            setStatusMsg('');
            const formData = new FormData();
            formData.append('job_id', currentRunId);
            formData.append('x', newPoint.x.toString());
            formData.append('y', newPoint.y.toString());
            formData.append('intent', 'user_click');
            const tryClick = async ()=>{
                const res = await fetch('/api/sam3d/segment-click', {
                    method: 'POST',
                    body: formData,
                    headers: token ? {
                        Authorization: `Bearer ${token}`
                    } : undefined
                });
                const data = await res.json().catch(()=>({}));
                if (res.status === 429) {
                    const details = [
                        data?.busy_task_type,
                        data?.busy_job_id
                    ].filter(Boolean).join(' • ');
                    setStatusMsg(`${data?.message || 'GPU busy. Please wait...'}${details ? ` (${details})` : ''}`);
                    setIsProcessing(false);
                    return;
                }
                // If polygon is missing (async worker), poll for it via the status endpoint
                let result = data;
                const clickJobId = data.job_id;
                if (!result?.polygon && clickJobId) {
                    const pollStart = Date.now();
                    while(Date.now() - pollStart < 15000){
                        await new Promise((r)=>setTimeout(r, 150));
                        try {
                            const check = await fetch(`/api/runs/${clickJobId}/status?t=${Date.now()}`, {
                                headers: token ? {
                                    Authorization: `Bearer ${token}`
                                } : undefined
                            });
                            if (check.ok) {
                                const statusData = await check.json();
                                if (statusData.status === 'COMPLETED' && statusData.result) {
                                    if (statusData.result.polygon && statusData.result.polygon.length > 0) {
                                        result = statusData.result;
                                        break;
                                    }
                                } else if (statusData.status === 'FAILED') {
                                    break;
                                }
                            }
                        } catch  {}
                    }
                }
                setIsProcessing(false);
                setStatusMsg('');
                if (result?.polygon && result.polygon.length > 0) {
                    setPreviewPolygon(result.polygon);
                    console.log("[FurnAI] Received Polygon:", result.polygon.length);
                }
            };
            Promise.resolve(tryClick()).catch((err)=>{
                console.error("[FurnAI] Segment Click Failed", err);
                setStatusMsg('Segmentation failed.');
                setIsProcessing(false);
            });
        }
    };
    const handleAddLabel = ()=>{
        if (!labelInput.trim() || activePoints.length === 0) return;
        const newLabel = {
            id: Math.random().toString(36).substr(2, 9),
            name: labelInput,
            color: COLORS[labels.length % COLORS.length],
            points: activePoints,
            polygon: previewPolygon
        };
        setLabels([
            ...labels,
            newLabel
        ]);
        setActivePoints([]); // Clear active
        setLabelInput('');
    };
    const handleDeleteLabel = (id)=>{
        setLabels(labels.filter((l)=>l.id !== id));
    };
    const handleSendToBackend = async ()=>{
        console.log("handleSendToBackend clicked", {
            currentRunId,
            labels: labels.length
        });
        if (!currentRunId || !token || labels.length === 0) {
            if (activePoints.length > 0) {
                alert("You have a selection (mask) but haven't added it to the list yet!\n\n1. Type a name (e.g. 'Chair')\n2. Click the (+) button\n3. THEN click Generate.");
            } else {
                alert("Please add at least one furniture item before sending (and ensure you are logged in).");
            }
            return;
        }
        setIsProcessing(true);
        setStatusMsg("Starting upload...");
        try {
            const formData = new FormData();
            formData.append('run_id', currentRunId);
            // Serialize items
            const itemsPayload = labels.map((l)=>({
                    id: l.id,
                    name: l.name,
                    color: l.color,
                    points: l.points,
                    polygon: l.polygon ?? []
                }));
            formData.append('items', JSON.stringify(itemsPayload));
            // Image handling (Blob or File)
            let hasImage = false;
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput?.files?.[0]) {
                formData.append('image', fileInput.files[0]);
                hasImage = true;
            } else if (image && image.startsWith('blob:')) {
                try {
                    const blob = await fetch(image).then((r)=>r.blob());
                    formData.append('image', blob, 'image.png');
                    hasImage = true;
                } catch (e) {
                    console.error("Blob fetch failed", e);
                }
            }
            console.log("Sending request...", {
                hasImage,
                itemCount: itemsPayload.length
            });
            const res = await fetch('/api/sam3d/submit-batch', {
                method: 'POST',
                headers: {
                    ...token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                },
                body: formData
            });
            console.log("Response status:", res.status);
            const data = await res.json();
            if (res.ok) {
                alert(`Success! Queued ${data.jobs?.length || 0} jobs. Check your email for results.`);
                setStatusMsg(`Success! Queued.`);
                setTimeout(()=>{
                    setIsProcessing(false);
                    onClose();
                }, 1500);
            } else {
                alert(`Server Error: ${data.detail || 'Unknown error'}`);
                setStatusMsg(`Error: ${data.detail}`);
                setIsProcessing(false);
            }
        } catch (e) {
            console.error(e);
            alert(`Network Error: ${e.message}`);
            setStatusMsg("Network error.");
            setIsProcessing(false);
        }
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-[90vw] h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 relative bg-[#111] flex items-center justify-center overflow-hidden group",
                    children: !image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex flex-col items-center gap-4 cursor-pointer p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                        className: "w-8 h-8 text-purple-400"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                        lineNumber: 299,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 298,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-semibold text-white block",
                                            children: "Upload Reference Image"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 302,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-white/40 block mt-1",
                                            children: "Click to browse"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 303,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 301,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "file",
                                    accept: "image/*",
                                    className: "hidden",
                                    onChange: handleImageUpload
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 305,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                            lineNumber: 297,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                        lineNumber: 296,
                        columnNumber: 25
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative w-full h-full p-8 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative inline-block shadow-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    ref: imgRef,
                                    src: image,
                                    alt: "Reference",
                                    className: "max-w-full max-h-[75vh] object-contain rounded-lg border border-white/10 cursor-crosshair",
                                    onClick: handleImageClick,
                                    draggable: false
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 311,
                                    columnNumber: 33
                                }, this),
                                labels.map((label)=>label.points.map((pt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute w-3 h-3 rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 pointer-events-none",
                                            style: {
                                                left: `${pt.x * 100}%`,
                                                top: `${pt.y * 100}%`,
                                                backgroundColor: label.color
                                            }
                                        }, pt.id, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 323,
                                            columnNumber: 41
                                        }, this))),
                                activePoints.map((pt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute w-3 h-3 rounded-full bg-white border border-purple-500 shadow-sm transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse",
                                        style: {
                                            left: `${pt.x * 100}%`,
                                            top: `${pt.y * 100}%`
                                        }
                                    }, pt.id, false, {
                                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                        lineNumber: 337,
                                        columnNumber: 37
                                    }, this)),
                                previewPolygon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "absolute inset-0 w-full h-full pointer-events-none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                        points: previewPolygon.map((p)=>{
                                            const img = imgRef.current;
                                            const rect = img?.getBoundingClientRect();
                                            const natW = img?.naturalWidth || 1;
                                            const natH = img?.naturalHeight || 1;
                                            const dispW = rect?.width || 1;
                                            const dispH = rect?.height || 1;
                                            const a = p?.[0] ?? 0;
                                            const b = p?.[1] ?? 0;
                                            // Backend may return either normalized [0..1] or pixel-space coords.
                                            const nx = a > 1 ? a / natW : a;
                                            const ny = b > 1 ? b / natH : b;
                                            const x = nx * dispW;
                                            const y = ny * dispH;
                                            const safeX = Number.isFinite(x) ? x : 0;
                                            const safeY = Number.isFinite(y) ? y : 0;
                                            return `${safeX},${safeY}`;
                                        }).join(' '),
                                        fill: "rgba(168, 85, 247, 0.4)",
                                        stroke: "#A855F7",
                                        strokeWidth: "2"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                        lineNumber: 347,
                                        columnNumber: 41
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 346,
                                    columnNumber: 37
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setImage(null),
                                    className: "absolute top-2 right-2 p-1.5 bg-black/50 text-white/50 hover:text-white rounded-md hover:bg-red-500/50 transition-colors",
                                    title: "Remove Image",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                        lineNumber: 383,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 378,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                            lineNumber: 310,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                        lineNumber: 309,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                    lineNumber: 294,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-80 border-l border-white/10 bg-[#0F0F0F] flex flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-14 border-b border-white/10 flex items-center justify-between px-4 bg-gradient-to-r from-purple-900/10 to-transparent",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                            className: "w-4 h-4 text-purple-400"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 395,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold text-sm text-white",
                                            children: "Furn AI"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 396,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30",
                                            children: "PRO"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 397,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 394,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleClose,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-5 h-5 text-white/40 hover:text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                        lineNumber: 399,
                                        columnNumber: 55
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 399,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                            lineNumber: 393,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 flex flex-col gap-4 flex-1 overflow-y-auto",
                            children: [
                                statusMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs text-center py-2 px-3 rounded-lg border border-white/10 bg-white/5 text-white/70",
                                    children: statusMsg
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 406,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                            className: "w-4 h-4 text-purple-400"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 413,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-left",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-semibold block text-white/90",
                                                    children: "Selection Mode"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                    lineNumber: 415,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-white/50 block",
                                                    children: [
                                                        "Click to select single item.",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                            lineNumber: 416,
                                                            columnNumber: 111
                                                        }, this),
                                                        "Hold ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            className: "text-purple-300",
                                                            children: "Shift"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                            lineNumber: 416,
                                                            columnNumber: 122
                                                        }, this),
                                                        " to group multiple parts."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                    lineNumber: 416,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 414,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 412,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-3 rounded-lg border border-white/10 bg-white/5 space-y-3 transition-all", activePoints.length > 0 ? "opacity-100" : "opacity-50 pointer-events-none"),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between text-xs text-white/70",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "Selected Points: ",
                                                        activePoints.length
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                    lineNumber: 426,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setActivePoints([]),
                                                    className: "hover:text-red-400",
                                                    children: "Clear"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                    lineNumber: 427,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 425,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    placeholder: "Label name (e.g. Chair)",
                                                    value: labelInput,
                                                    onChange: (e)=>setLabelInput(e.target.value),
                                                    className: "flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500",
                                                    onKeyDown: (e)=>e.key === 'Enter' && handleAddLabel()
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                    lineNumber: 430,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleAddLabel,
                                                    disabled: !labelInput.trim(),
                                                    className: "p-1.5 bg-purple-600 rounded hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                        className: "w-4 h-4 text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                        lineNumber: 443,
                                                        columnNumber: 37
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                    lineNumber: 438,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 429,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 421,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2 mt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] uppercase font-bold text-white/30 tracking-wider",
                                            children: "Labeled Items"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 450,
                                            columnNumber: 29
                                        }, this),
                                        labels.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-center py-4 text-white/20 italic",
                                            children: "No labels added yet."
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 452,
                                            columnNumber: 33
                                        }, this),
                                        labels.map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 group hover:border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 overflow-hidden",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-2 h-2 rounded-full flex-shrink-0",
                                                                style: {
                                                                    backgroundColor: label.color
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                                lineNumber: 457,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-white/80 font-medium truncate",
                                                                children: label.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                                lineNumber: 458,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] text-white/30",
                                                                children: [
                                                                    "(",
                                                                    label.points.length,
                                                                    " pts)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                                lineNumber: 459,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                        lineNumber: 456,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleDeleteLabel(label.id),
                                                        className: "text-white/20 hover:text-red-400 transition-colors",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                            lineNumber: 465,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                        lineNumber: 461,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, label.id, true, {
                                                fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                                lineNumber: 455,
                                                columnNumber: 33
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                    lineNumber: 449,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                            lineNumber: 403,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 border-t border-white/10 bg-white/5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSendToBackend,
                                disabled: isProcessing,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg", isProcessing ? "bg-purple-900/50 text-purple-200 cursor-wait" : "bg-purple-600 hover:bg-purple-500 text-white"),
                                children: isProcessing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: "w-4 h-4 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 486,
                                            columnNumber: 37
                                        }, this),
                                        "Processing Segment..."
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                            lineNumber: 491,
                                            columnNumber: 37
                                        }, this),
                                        "Generate 3D Models"
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                                lineNumber: 474,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                            lineNumber: 473,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/FurnAIModal.tsx",
                    lineNumber: 391,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/FurnAIModal.tsx",
            lineNumber: 291,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/FurnAIModal.tsx",
        lineNumber: 290,
        columnNumber: 9
    }, this);
}
_s(FurnAIModal, "Wqz43syr/exQRZeW4QNva5djw5Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = FurnAIModal;
var _c;
__turbopack_context__.k.register(_c, "FurnAIModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/ProjectThumbnail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProjectThumbnail",
    ()=>ProjectThumbnail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hard$2d$drive$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HardDrive$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hard-drive.js [app-client] (ecmascript) <export default as HardDrive>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$exclamation$2d$point$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileWarning$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-exclamation-point.js [app-client] (ecmascript) <export default as FileWarning>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ProjectThumbnail({ runId, imagePath, token, status }) {
    _s();
    const [svgContent, setSvgContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imageUrl, setImageUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectThumbnail.useEffect": ()=>{
            let active = true;
            let objectUrl = null;
            const controller = new AbortController();
            const loadThumbnail = {
                "ProjectThumbnail.useEffect.loadThumbnail": async ()=>{
                    // Always resolve loading state; token may arrive slightly later.
                    if (!runId || !token) {
                        if (active) setLoading(false);
                        return;
                    }
                    try {
                        // 1. Try to fetch SVG (Best quality, shows edits)
                        // If a run is still processing, the SVG might appear shortly after; retry a few times.
                        const shouldRetrySvg = status !== 'FAILED';
                        const maxAttempts = shouldRetrySvg ? 4 : 1;
                        for(let attempt = 0; attempt < maxAttempts; attempt++){
                            const svgRes = await fetch(`/api/runs/${runId}/svg?t=${Date.now()}_${attempt}`, {
                                cache: 'no-store',
                                signal: controller.signal,
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Cache-Control': 'no-cache'
                                }
                            });
                            if (svgRes.ok && active) {
                                const text = await svgRes.text();
                                // Basic sanity check
                                if (text.includes('<svg')) {
                                    setSvgContent(text);
                                    setLoading(false);
                                    return;
                                }
                            }
                            // Auth issues: don't spin retry loops forever.
                            if (svgRes.status === 401 || svgRes.status === 403) {
                                break;
                            }
                            if (attempt < maxAttempts - 1) {
                                await new Promise({
                                    "ProjectThumbnail.useEffect.loadThumbnail": (r)=>setTimeout(r, 500)
                                }["ProjectThumbnail.useEffect.loadThumbnail"]);
                            }
                        }
                        // 2. Fallback to Input Image
                        if (imagePath && active) {
                            // Extract filename from the absolute path provided by backend
                            // e.g., "C:\...\run_id\input_image.png" -> "input_image.png"
                            // Handle both Windows and Unix separators just in case
                            const filename = imagePath.split(/[\\/]/).pop();
                            if (filename) {
                                const imgRes = await fetch(`/api/runs/${runId}/assets/${filename}?t=${Date.now()}`, {
                                    cache: 'no-store',
                                    signal: controller.signal,
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Cache-Control': 'no-cache'
                                    }
                                });
                                if (imgRes.ok && active) {
                                    const blob = await imgRes.blob();
                                    objectUrl = URL.createObjectURL(blob);
                                    setImageUrl(objectUrl);
                                    setLoading(false);
                                    return;
                                }
                            }
                        }
                        // If we get here, both failed
                        if (active) setError(true);
                    } catch (e) {
                        if (e?.name === 'AbortError') return;
                        console.error("Thumbnail load failed", e);
                        if (active) setError(true);
                    } finally{
                        if (active) setLoading(false);
                    }
                }
            }["ProjectThumbnail.useEffect.loadThumbnail"];
            loadThumbnail();
            return ({
                "ProjectThumbnail.useEffect": ()=>{
                    active = false;
                    controller.abort();
                    if (objectUrl) URL.revokeObjectURL(objectUrl);
                }
            })["ProjectThumbnail.useEffect"];
        }
    }["ProjectThumbnail.useEffect"], [
        runId,
        imagePath,
        token,
        status
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full flex items-center justify-center bg-secondary/10 animate-pulse",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hard$2d$drive$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HardDrive$3e$__["HardDrive"], {
                className: "w-8 h-8 text-muted-foreground/20"
            }, void 0, false, {
                fileName: "[project]/app/components/layout/ProjectThumbnail.tsx",
                lineNumber: 117,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/layout/ProjectThumbnail.tsx",
            lineNumber: 116,
            columnNumber: 13
        }, this);
    }
    if (svgContent) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full bg-white/5 p-2 overflow-hidden flex items-center justify-center",
            dangerouslySetInnerHTML: {
                __html: svgContent.replace(/<svg /, '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ')
            }
        }, void 0, false, {
            fileName: "[project]/app/components/layout/ProjectThumbnail.tsx",
            lineNumber: 124,
            columnNumber: 13
        }, this);
    }
    if (imageUrl) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: imageUrl,
            alt: "Project Thumbnail",
            className: "w-full h-full object-cover"
        }, void 0, false, {
            fileName: "[project]/app/components/layout/ProjectThumbnail.tsx",
            lineNumber: 135,
            columnNumber: 13
        }, this);
    }
    // Fallback Icon
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-full flex items-center justify-center bg-secondary/20 text-muted-foreground/30",
        children: status === 'FAILED' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$exclamation$2d$point$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileWarning$3e$__["FileWarning"], {
            className: "w-10 h-10"
        }, void 0, false, {
            fileName: "[project]/app/components/layout/ProjectThumbnail.tsx",
            lineNumber: 146,
            columnNumber: 36
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
            className: "w-10 h-10"
        }, void 0, false, {
            fileName: "[project]/app/components/layout/ProjectThumbnail.tsx",
            lineNumber: 146,
            columnNumber: 76
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/ProjectThumbnail.tsx",
        lineNumber: 145,
        columnNumber: 9
    }, this);
}
_s(ProjectThumbnail, "R5J92g546ebII39IS7nLtR+xLJw=");
_c = ProjectThumbnail;
var _c;
__turbopack_context__.k.register(_c, "ProjectThumbnail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/ProjectsModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProjectsModal",
    ()=>ProjectsModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$ProjectThumbnail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/ProjectThumbnail.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function ProjectsModal({ isOpen, onClose }) {
    _s();
    const { token, currentRunId, setRunId, setRunStatus, setMode, setCalibrationFactor, setTutorialStep } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const [projects, setProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deletingId, setDeletingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectsModal.useEffect": ()=>{
            if (isOpen && token) {
                fetchProjects();
            }
        }
    }["ProjectsModal.useEffect"], [
        isOpen,
        token
    ]);
    const fetchProjects = async ()=>{
        setLoading(true);
        try {
            const res = await fetch('/api/runs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (e) {
            console.error("Failed to fetch projects", e);
        } finally{
            setLoading(false);
        }
    };
    const handleDelete = async (runId, e)=>{
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
        setDeletingId(runId);
        try {
            const res = await fetch(`/api/runs/${runId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setProjects((prev)=>prev.filter((p)=>p.job_id !== runId));
                if (runId === currentRunId) {
                    setRunId(null);
                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setUploadedImage(null); // clear to prevent clicking on ghost
                }
            } else {
                alert("Failed to delete project");
            }
        } catch (e) {
            console.error("Delete failed", e);
        } finally{
            setDeletingId(null);
        }
    };
    const handleLoad = async (project)=>{
        const runId = project.job_id;
        if (!runId) return;
        setRunId(runId);
        setRunStatus(project.status === 'COMPLETED' ? 'completed' : 'processing');
        setMode('2d'); // Switch to editor view
        onClose();
        // CRITICAL: When reopening an existing project, we must fetch/import its SVG.
        // Otherwise the editor shows a blank state even though the run has a saved SVG.
        try {
            if (!token) return;
            // Restore per-run calibration/scale from run_meta.json (if present)
            try {
                const metaRes = await fetch(`/api/runs/${runId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (metaRes.ok) {
                    const meta = await metaRes.json().catch(()=>({}));
                    const rm = meta?.run_meta || {};
                    // Prefer explicit scale fields saved by calibration flow
                    const scale = rm?.scale ?? rm?.exportScale ?? rm?.calibrationFactor;
                    const parsed = typeof scale === 'number' ? scale : parseFloat(String(scale || 'NaN'));
                    if (Number.isFinite(parsed) && parsed > 0) {
                        setCalibrationFactor(parsed);
                        setTutorialStep('none');
                    }
                }
            } catch  {
            // ignore, we'll fall back to whatever is in store
            }
            const svgRes = await fetch(`/api/runs/${runId}/svg`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (svgRes.ok) {
                const svgText = await svgRes.text();
                __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().importFromSVG(svgText);
            } else {
                console.error('[ProjectsModal] Failed to fetch SVG:', svgRes.status, await svgRes.text());
            }
        } catch (e) {
            console.error('[ProjectsModal] Failed to load project SVG', e);
        }
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-[95vw] max-w-4xl bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between p-4 border-b bg-secondary/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                    className: "w-5 h-5 text-primary"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                    lineNumber: 126,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold",
                                    children: "My Projects"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                    lineNumber: 127,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                            lineNumber: 125,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-2 hover:bg-secondary rounded-full transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                lineNumber: 130,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                            lineNumber: 129,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                    lineNumber: 124,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-y-auto p-4 custom-scrollbar bg-background/50",
                    children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center h-64 text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-8 h-8 animate-spin mb-2"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                lineNumber: 138,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Loading projects..."
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                lineNumber: 139,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                        lineNumber: 137,
                        columnNumber: 25
                    }, this) : projects.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center h-64 text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                className: "w-12 h-12 mb-2 opacity-50"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                lineNumber: 143,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "No projects found."
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                lineNumber: 144,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm opacity-70",
                                children: "Upload a floorplan to get started."
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                lineNumber: 145,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                        lineNumber: 142,
                        columnNumber: 25
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
                        children: projects.map((project)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>handleLoad(project),
                                className: "group relative border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer bg-card hover:shadow-md flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "aspect-video bg-secondary/20 flex items-center justify-center relative overflow-hidden border-b border-border/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$ProjectThumbnail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProjectThumbnail"], {
                                                runId: project.job_id,
                                                imagePath: project.image_path,
                                                token: token,
                                                status: project.status
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                lineNumber: 157,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md z-10", project.status === 'COMPLETED' ? "bg-green-500/20 text-green-500" : project.status === 'FAILED' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"),
                                                children: project.status
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                lineNumber: 165,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                        lineNumber: 156,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-semibold truncate mb-1 text-foreground",
                                                title: project.job_id,
                                                children: project.job_id
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                lineNumber: 177,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                                lineNumber: 182,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: new Date(project.created_at).toLocaleDateString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                                lineNumber: 183,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                        lineNumber: 181,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: (e)=>handleDelete(project.job_id, e),
                                                        className: "p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors",
                                                        title: "Delete Project",
                                                        children: deletingId === project.job_id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                            className: "w-4 h-4 animate-spin text-red-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                            lineNumber: 192,
                                                            columnNumber: 82
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                            lineNumber: 192,
                                                            columnNumber: 142
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                        lineNumber: 187,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                                lineNumber: 180,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                        lineNumber: 176,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, project.job_id, true, {
                                fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                                lineNumber: 150,
                                columnNumber: 33
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                        lineNumber: 148,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/ProjectsModal.tsx",
                    lineNumber: 135,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/ProjectsModal.tsx",
            lineNumber: 122,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/ProjectsModal.tsx",
        lineNumber: 121,
        columnNumber: 9
    }, this);
}
_s(ProjectsModal, "ijbULpJgSUb+SPG4xa8TAS1oK1Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = ProjectsModal;
var _c;
__turbopack_context__.k.register(_c, "ProjectsModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/TexturizeModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TexturizeModal",
    ()=>TexturizeModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wand-sparkles.js [app-client] (ecmascript) <export default as Wand2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function TexturizeModal({ isOpen, onClose, targetName, onApply }) {
    _s();
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [tileWidthFt, setTileWidthFt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [tileHeightFt, setTileHeightFt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isApplying, setIsApplying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-[450px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-14 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-pink-500/10 to-transparent",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                    className: "w-4 h-4 text-pink-400"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                    lineNumber: 28,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-semibold text-white tracking-wide",
                                    children: [
                                        "Texturize AI ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-white/30 font-normal",
                                            children: [
                                                "| ",
                                                targetName
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                            lineNumber: 29,
                                            columnNumber: 101
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                    lineNumber: 29,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                            lineNumber: 27,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-white/40 hover:text-white transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                lineNumber: 32,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                            lineNumber: 31,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                    lineNumber: 26,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block",
                                    children: "Upload Texture Image"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                    lineNumber: 39,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "file",
                                    accept: "image/*",
                                    onChange: (e)=>{
                                        const f = e.target.files?.[0] || null;
                                        setFile(f);
                                    },
                                    className: "w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white/80 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                    lineNumber: 40,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                            lineNumber: 38,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block",
                                            children: "Tile Width (ft)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                            lineNumber: 53,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: tileWidthFt,
                                            onChange: (e)=>setTileWidthFt(e.target.value),
                                            placeholder: "e.g. 1",
                                            className: "w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                            lineNumber: 54,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                    lineNumber: 52,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs text-white/50 uppercase font-semibold tracking-wider mb-2 block",
                                            children: "Tile Height (ft)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                            lineNumber: 63,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: tileHeightFt,
                                            onChange: (e)=>setTileHeightFt(e.target.value),
                                            placeholder: "e.g. 1",
                                            className: "w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                            lineNumber: 64,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                    lineNumber: 62,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                            lineNumber: 51,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                    lineNumber: 37,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-4 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                            lineNumber: 77,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: async ()=>{
                                const w = parseFloat(tileWidthFt);
                                const h = parseFloat(tileHeightFt);
                                if (!file) {
                                    console.error('[TexturizeModal] missing file');
                                    alert('Please upload a texture image.');
                                    return;
                                }
                                if (!Number.isFinite(w) || w <= 0) {
                                    console.error('[TexturizeModal] invalid tile width', tileWidthFt);
                                    alert('Tile Width must be a positive number (feet).');
                                    return;
                                }
                                if (!Number.isFinite(h) || h <= 0) {
                                    console.error('[TexturizeModal] invalid tile height', tileHeightFt);
                                    alert('Tile Height must be a positive number (feet).');
                                    return;
                                }
                                try {
                                    setIsApplying(true);
                                    await onApply(file, w, h);
                                    onClose();
                                    setFile(null);
                                    setTileWidthFt('');
                                    setTileHeightFt('');
                                } finally{
                                    setIsApplying(false);
                                }
                            },
                            disabled: isApplying || !file || !tileWidthFt.trim() || !tileHeightFt.trim(),
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-6 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-lg flex items-center gap-2", !isApplying && file && tileWidthFt.trim() && tileHeightFt.trim() ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 shadow-pink-900/20" : "bg-white/10 text-white/30 cursor-not-allowed"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"], {
                                    className: "w-3 h-3"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                                    lineNumber: 122,
                                    columnNumber: 25
                                }, this),
                                isApplying ? 'Applying...' : 'Apply Texture'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                            lineNumber: 83,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/TexturizeModal.tsx",
                    lineNumber: 76,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/TexturizeModal.tsx",
            lineNumber: 24,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/TexturizeModal.tsx",
        lineNumber: 23,
        columnNumber: 9
    }, this);
}
_s(TexturizeModal, "oB7KjqBdVcdU7jLJGQSTOPrueWI=");
_c = TexturizeModal;
var _c;
__turbopack_context__.k.register(_c, "TexturizeModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Sidebar",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$tool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PenTool$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-tool.js [app-client] (ecmascript) <export default as PenTool>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ruler.js [app-client] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-line.js [app-client] (ecmascript) <export default as Edit3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/move.js [app-client] (ecmascript) <export default as Move>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-cw.js [app-client] (ecmascript) <export default as RotateCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-client] (ecmascript) <export default as Tag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-client] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sunset$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sunset$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sunset.js [app-client] (ecmascript) <export default as Sunset>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.js [app-client] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$app$2d$window$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AppWindow$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/app-window.js [app-client] (ecmascript) <export default as AppWindow>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$door$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DoorOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/door-open.js [app-client] (ecmascript) <export default as DoorOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$armchair$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Armchair$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/armchair.js [app-client] (ecmascript) <export default as Armchair>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$ImportModelModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/ImportModelModal.tsx [app-client] (ecmascript)"); // Import Modal
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FurnAIModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/FurnAIModal.tsx [app-client] (ecmascript)"); // Import Furn AI Modal
// ProjectsModal import already added in previous step or handled by TS if file exists
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$ProjectsModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/ProjectsModal.tsx [app-client] (ecmascript)"); // Ensuring import exists
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$TexturizeModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/TexturizeModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$oauth$2f$google$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-oauth/google/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jwt-decode/build/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
function Sidebar({ onLogout }) {
    _s();
    const { selectedId, walls, calibrate, activeTool, setActiveTool, deleteObject, rooms, updateRoom, selectObject, mode, lightingPreset, setLightingPreset, triggerRender, isRendering, currentRunId, addFurniture, tutorialStep, triggerDetectRooms, user, setUser, setToken, token, projectsModalOpen, setProjectsModalOpen, runStatus } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const isGenerating = runStatus === 'processing';
    // Login Hook
    // Login Hook (Replaced with Component in render)
    // const login = useGoogleLogin(...)
    const logout = ()=>{
        setToken(null);
        setUser(null);
        if (onLogout) onLogout();
    };
    const [realLen, setRealLen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editMenuOpen, setEditMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [addMenuOpen, setAddMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [furnMenuOpen, setFurnMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false) // New State
    ;
    const [importModalOpen, setImportModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [furnAIModalOpen, setFurnAIModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const downloadWithAuth = async (url, filename)=>{
        if (!token) {
            alert('You are not signed in. Please sign in and try again.');
            return;
        }
        const res = await fetch(url, {
            cache: 'no-store',
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        });
        if (!res.ok) {
            const txt = await res.text().catch(()=>'');
            console.error('[Download] failed', res.status, txt);
            try {
                const errParse = JSON.parse(txt);
                alert(`Download failed: ${errParse.detail || txt}`);
            } catch  {
                alert(`Download failed: ${res.statusText}`);
            }
            return;
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
    };
    // New State
    const [texturizeOpen, setTexturizeOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // projectsModalOpen is now global
    // Restore User from Token on Mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Sidebar.useState": ()=>{
            if (token && !user) {
                try {
                    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jwtDecode"])(token);
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp && decoded.exp < currentTime) {
                        console.log("Token expired, clearing session");
                        setToken(null);
                        setUser(null);
                    } else {
                        setUser({
                            email: decoded.email,
                            name: decoded.name,
                            picture: decoded.picture
                        });
                    }
                } catch (e) {
                    console.error("Failed to restore session", e);
                    setToken(null);
                }
            }
        }
    }["Sidebar.useState"]);
    const selectedWall = walls.find((w)=>w.id === selectedId);
    const selectedRoom = rooms.find((r)=>r.id === selectedId);
    const onImportModels = async (files)=>{
        if (!currentRunId || !token) return;
        for (const f of files){
            try {
                const form = new FormData();
                form.append('file', f);
                const res = await fetch(`/api/runs/${currentRunId}/imported/upload`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: form
                });
                if (!res.ok) {
                    console.error('[ImportModelModal] upload failed', res.status, await res.text());
                    continue;
                }
                const data = await res.json().catch(()=>({}));
                const itemId = String(data?.item_id || '');
                const rel = String(data?.rel_path || '');
                if (!itemId || !rel) continue;
                __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().addImportedFurniture({
                    id: itemId,
                    label: f.name,
                    relPath: rel
                });
            } catch (e) {
                console.error('[ImportModelModal] upload crashed', e);
            }
        }
    };
    const canFindRooms = tutorialStep === 'rooms' || tutorialStep === 'floor_review' || tutorialStep === 'none';
    const canUseFurniture = true // Always allow FurnAI
    ;
    const onCalibrate = async ()=>{
        if (!selectedWall || !realLen) return;
        const val = parseFloat(realLen);
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid length in millimeters");
            return;
        }
        // Convert mm to meters for internal use
        calibrate(selectedWall.id, val / 1000);
        // Persist calibration/scale to backend for later Blender/3D pipeline use
        try {
            if (currentRunId) {
                const store = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState();
                const scale = store.exportScale || store.calibrationFactor;
                await fetch(`/api/runs/${currentRunId}/meta`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        scale,
                        calibration_mm: val,
                        calibration_wall_id: selectedWall.id
                    })
                });
            }
        } catch (e) {
            console.error('Failed to persist calibration meta', e);
        }
        setRealLen('');
        setActiveTool('none'); // Exit tool mode after calibration
    // User requested no alert
    };
    const handleAddObject = (type)=>{
        if (type === 'wall') {
            setActiveTool('wall');
        } else if (type === 'floor') {
            setActiveTool('floor');
        } else {
            addFurniture(type, {
                x: 0,
                y: 0
            });
            setActiveTool('select'); // Switch to select so they can move it
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-64 border-r bg-card h-[calc(100vh-3.5rem)] flex flex-col select-none overflow-y-auto custom-scrollbar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-b",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
                                children: "Tools"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 202,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setAddMenuOpen(!addMenuOpen),
                                            disabled: tutorialStep === 'calibration',
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full flex items-center justify-between p-3 rounded-lg border transition-all group", addMenuOpen ? "bg-primary/20 border-primary text-primary shadow-inner" : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground", tutorialStep === 'calibration' && "opacity-30 cursor-not-allowed"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                            className: "w-5 h-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 218,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px] font-medium uppercase tracking-wider",
                                                            children: "Add Element"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 219,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-4 h-4 transition-transform", addMenuOpen && "rotate-180")
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                            lineNumber: 206,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 205,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300", addMenuOpen ? "max-h-[200px] mt-2 opacity-100" : "max-h-0 opacity-0"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleAddObject('floor'),
                                                className: "flex flex-col items-center p-2 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                                        className: "w-4 h-4 mb-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 231,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px]",
                                                        children: "Floor"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 232,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 230,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleAddObject('wall'),
                                                className: "flex flex-col items-center p-2 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$tool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PenTool$3e$__["PenTool"], {
                                                        className: "w-4 h-4 mb-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 235,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px]",
                                                        children: "Wall"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 234,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleAddObject('window'),
                                                className: "flex flex-col items-center p-2 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$app$2d$window$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AppWindow$3e$__["AppWindow"], {
                                                        className: "w-4 h-4 mb-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 239,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px]",
                                                        children: "Window"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 240,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 238,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleAddObject('door'),
                                                className: "flex flex-col items-center p-2 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$door$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DoorOpen$3e$__["DoorOpen"], {
                                                        className: "w-4 h-4 mb-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 243,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px]",
                                                        children: "Door"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 244,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 242,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 226,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            disabled: !canFindRooms || !currentRunId,
                                            onClick: ()=>triggerDetectRooms(),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full flex items-center justify-between p-3 rounded-lg border transition-all", !canFindRooms || !currentRunId ? "border-border bg-secondary/10 text-muted-foreground opacity-50 cursor-not-allowed" : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                            className: "w-5 h-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 261,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px] font-medium uppercase tracking-wider",
                                                            children: "Find Rooms"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 262,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 33
                                                }, this),
                                                !canFindRooms ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded",
                                                    children: "Locked"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 265,
                                                    columnNumber: 39
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded",
                                                    children: "Run"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 266,
                                                    columnNumber: 39
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                            lineNumber: 250,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 249,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative mt-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setFurnMenuOpen(!furnMenuOpen),
                                            disabled: !canUseFurniture,
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full flex items-center justify-between p-3 rounded-lg border transition-all group", furnMenuOpen ? "bg-primary/20 border-primary text-primary shadow-inner" : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground", !canUseFurniture && "opacity-50 cursor-not-allowed"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$armchair$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Armchair$3e$__["Armchair"], {
                                                            className: "w-5 h-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 285,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px] font-medium uppercase tracking-wider",
                                                            children: "Add Furniture"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 286,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 284,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-4 h-4 transition-transform", furnMenuOpen && "rotate-180")
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 288,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                            lineNumber: 273,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 272,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-2 overflow-hidden transition-all duration-300", furnMenuOpen ? "max-h-[200px] mt-2 opacity-100" : "max-h-0 opacity-0"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setImportModalOpen(true),
                                                className: "w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-all text-muted-foreground hover:text-white group text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/50 transition-colors",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                                            className: "w-4 h-4 text-blue-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 303,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 302,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[11px] font-semibold block text-white/90",
                                                                children: "Import 3D Model"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                                lineNumber: 306,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] text-white/40 block",
                                                                children: "GLB / OBJ / FBX"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                                lineNumber: 307,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 298,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setFurnAIModalOpen(true),
                                                disabled: !canUseFurniture || !currentRunId,
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full flex items-center gap-3 p-3 rounded-lg border border-border text-left relative overflow-hidden transition-all", !canUseFurniture || !currentRunId ? "bg-secondary/10 text-muted-foreground/60 opacity-50 cursor-not-allowed" : "bg-secondary/20 hover:bg-secondary/50 hover:border-purple-500/40 text-muted-foreground"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-8 h-8 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 transition-colors",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                            className: "w-4 h-4 text-purple-300"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 323,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[11px] font-semibold block text-white/90",
                                                                        children: "Furn AI"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                                        lineNumber: 327,
                                                                        columnNumber: 41
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[8px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/20",
                                                                        children: "PRO"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                                        lineNumber: 328,
                                                                        columnNumber: 41
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                                lineNumber: 326,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] text-white/40 block",
                                                                children: "SAM 3D Segmentation"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                                lineNumber: 330,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 325,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 312,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 293,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative mt-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setEditMenuOpen(!editMenuOpen),
                                            disabled: tutorialStep === 'calibration',
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full flex items-center justify-between p-3 rounded-lg border transition-all group", [
                                                'select',
                                                'move',
                                                'resize',
                                                'rotate',
                                                'delete',
                                                'label',
                                                'wall'
                                            ].includes(activeTool) ? "bg-primary/20 border-primary text-primary shadow-inner" : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground", tutorialStep === 'calibration' && "opacity-30 cursor-not-allowed"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"], {
                                                            className: "w-5 h-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 349,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px] font-medium uppercase tracking-wider",
                                                            children: "Edit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                            lineNumber: 350,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 348,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-4 h-4 transition-transform", editMenuOpen && "rotate-180")
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 352,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                            lineNumber: 337,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 336,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTool(activeTool === 'ruler' ? 'none' : 'ruler'),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-3 p-3 rounded-lg border transition-all group", activeTool === 'ruler' ? "bg-primary/20 border-primary text-primary shadow-inner" : "border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground", tutorialStep === 'calibration' && "ring-2 ring-primary ring-offset-2 ring-offset-[#111] animate-pulse"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                                className: "w-5 h-5 group-hover:text-primary transition-colors"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 367,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[11px] font-medium uppercase tracking-wider",
                                                children: "Ruler Tool"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 368,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 357,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 203,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                        lineNumber: 201,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-4 border-b bg-primary/5 transition-all duration-300", editMenuOpen ? "opacity-100 max-h-[400px]" : "opacity-0 max-h-0 py-0 overflow-hidden border-none"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
                                children: "Edit Tools"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 380,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-3 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTool('move'),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'move' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__["Move"], {
                                                className: "w-4 h-4 mb-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 386,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px]",
                                                children: "Move"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 387,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 382,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTool('resize'),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'resize' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                                className: "w-4 h-4 mb-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 393,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px]",
                                                children: "Resize"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 394,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 389,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTool('rotate'),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'rotate' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__["RotateCw"], {
                                                className: "w-4 h-4 mb-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 400,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px]",
                                                children: "Rotate"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 401,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 396,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (selectedId) deleteObject(selectedId);
                                        },
                                        className: "flex flex-col items-center p-2 rounded-lg border border-border hover:bg-red-500/20 text-red-400 transition-all",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                className: "w-4 h-4 mb-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 407,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px]",
                                                children: "Delete"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 408,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 403,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTool('label'),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'label' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                                                className: "w-4 h-4 mb-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 414,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px]",
                                                children: "Label"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 415,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 410,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTool('wall'),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded-lg border transition-all", activeTool === 'wall' ? "bg-primary/20 border-primary text-primary" : "border-border hover:bg-secondary/50"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$tool$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PenTool$3e$__["PenTool"], {
                                                className: "w-4 h-4 mb-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 421,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px]",
                                                children: "Wall"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 422,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 417,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 381,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                        lineNumber: 376,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-4 border-b bg-primary/5 transition-all duration-300", activeTool === 'ruler' ? "opacity-100 max-h-[300px]" : "opacity-0 max-h-0 py-0 overflow-hidden border-none"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
                                children: "Calibration Mode"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 433,
                                columnNumber: 21
                            }, this),
                            selectedWall ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3 animate-in fade-in slide-in-from-left-2 duration-300",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-primary text-[11px] font-semibold",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 437,
                                                columnNumber: 33
                                            }, this),
                                            "Targeting: ",
                                            selectedWall.label || "Wall"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 436,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                placeholder: "Enter real length (mm)",
                                                value: realLen,
                                                onChange: (e)=>setRealLen(e.target.value),
                                                className: "w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary",
                                                autoFocus: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 441,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: onCalibrate,
                                                className: "bg-primary text-white p-2 rounded hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 453,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 449,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 440,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-muted-foreground italic",
                                        children: "Update the real-world scale of your plan."
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 456,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 435,
                                columnNumber: 25
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[11px] text-muted-foreground bg-secondary/20 p-3 rounded border border-dashed border-border text-center",
                                children: "Select a wall on the canvas to measure it."
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 459,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                        lineNumber: 429,
                        columnNumber: 17
                    }, this),
                    selectedRoom && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-b bg-yellow-500/5 animate-in fade-in duration-300",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                                        children: "Room Properties"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 469,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>selectObject(null),
                                        className: "text-muted-foreground hover:text-white",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "sr-only",
                                                children: "Close"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 471,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                className: "w-3 h-3 rotate-45"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 472,
                                                columnNumber: 33
                                            }, this),
                                            " "
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 470,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 468,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-[10px] text-muted-foreground uppercase font-bold",
                                                children: "Room Name"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 478,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                                                        className: "w-4 h-4 text-muted-foreground/70"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 480,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: selectedRoom.name,
                                                        onChange: (e)=>updateRoom(selectedRoom.id, {
                                                                name: e.target.value
                                                            }),
                                                        className: "w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium",
                                                        placeholder: "Living Room..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 481,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 479,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 477,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-[10px] text-muted-foreground uppercase font-bold",
                                                children: "Color"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 492,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-2 flex-wrap",
                                                children: [
                                                    '#3b82f6',
                                                    '#10b981',
                                                    '#f59e0b',
                                                    '#ef4444',
                                                    '#8b5cf6',
                                                    '#06b6d4',
                                                    '#ec4899',
                                                    '#94a3b8'
                                                ].map((color)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>updateRoom(selectedRoom.id, {
                                                                color
                                                            }),
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-6 h-6 rounded-full border transition-all hover:scale-110", selectedRoom.color === color ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border/50"),
                                                        style: {
                                                            backgroundColor: color
                                                        },
                                                        title: color
                                                    }, color, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 495,
                                                        columnNumber: 41
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 493,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 491,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 475,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                        lineNumber: 467,
                        columnNumber: 21
                    }, this),
                    mode === '3d' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-b bg-blue-500/5 animate-in fade-in duration-300",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
                                children: "3D View Options"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 515,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-muted-foreground font-semibold uppercase mb-2 block",
                                        children: "Lighting Environment"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 519,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-4 gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setLightingPreset('day'),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded border transition-all", lightingPreset === 'day' ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" : "border-border hover:bg-secondary/50"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 525,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] mt-1",
                                                        children: "Day"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 526,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 521,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setLightingPreset('night'),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded border transition-all", lightingPreset === 'night' ? "bg-blue-500/20 border-blue-500 text-blue-400" : "border-border hover:bg-secondary/50"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 532,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] mt-1",
                                                        children: "Night"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 533,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 528,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setLightingPreset('studio'),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded border transition-all", lightingPreset === 'studio' ? "bg-white/20 border-white text-white" : "border-border hover:bg-secondary/50"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 539,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] mt-1",
                                                        children: "Studio"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 540,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 535,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setLightingPreset('sunset'),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center p-2 rounded border transition-all", lightingPreset === 'sunset' ? "bg-orange-500/20 border-orange-500 text-orange-400" : "border-border hover:bg-secondary/50"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sunset$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sunset$3e$__["Sunset"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 546,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[8px] mt-1",
                                                        children: "Sunset"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 547,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 542,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 520,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 518,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-muted-foreground font-semibold uppercase mb-2 block",
                                        children: "AI Materials"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 554,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (!selectedId || !selectedWall && !selectedRoom) {
                                                alert("Please select a Wall or a Floor first!");
                                                return;
                                            }
                                            setTexturizeOpen(true);
                                        },
                                        className: "w-full flex items-center justify-between p-3 rounded-lg border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 transition-all group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                        className: "w-4 h-4 text-pink-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 566,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[11px] font-medium uppercase tracking-wider",
                                                        children: "Texturize AI"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 567,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 565,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded border border-pink-500/30",
                                                children: "NEW"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 569,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 555,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 553,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-muted-foreground font-semibold uppercase",
                                        children: "High Quality Render"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 575,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>triggerRender(),
                                        disabled: isRendering,
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full py-2 px-3 rounded-md text-white text-[11px] font-semibold flex items-center justify-center gap-2 transition-all shadow-lg", isRendering ? "bg-purple-500 animate-pulse cursor-wait shadow-purple-500/40" : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"),
                                        children: isRendering ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 588,
                                                    columnNumber: 41
                                                }, this),
                                                "Rendering..."
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                    lineNumber: 593,
                                                    columnNumber: 41
                                                }, this),
                                                "Capture View"
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 576,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] text-muted-foreground italic text-center",
                                        children: "Takes a snapshot of the current view."
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 598,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 574,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                        lineNumber: 514,
                        columnNumber: 21
                    }, this),
                    currentRunId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-b border-border/50 bg-secondary/5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-muted-foreground font-semibold uppercase mb-2 block",
                                children: "Project Assets"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 609,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>downloadWithAuth(`/api/runs/${currentRunId}/svg/raw?t=${Date.now()}`, `inference_raw_${currentRunId}.svg`),
                                        className: "col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-secondary/50 border border-border hover:bg-blue-950/30 hover:border-blue-500/50 hover:text-blue-400 transition-all text-[10px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 615,
                                                columnNumber: 33
                                            }, this),
                                            "Download Raw Inference SVG"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 611,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: async ()=>{
                                            // 1. Trigger the heavy blender worker job
                                            await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().triggerBlenderGeneration();
                                            // 2. Poll for completion or assume the worker takes a while (user might have to wait, so we should really poll here. 
                                            // But Topbar.tsx already polls for runStatus === 'completed'. Let's just trigger it and let them download it once runStatus is completed)
                                            // Actually, if they want to download *now*, we should generate and wait for it.
                                            // For now, let's just trigger it, wait a bit, then try to download.
                                            // A better UX would be a separate "Generate 3D" button and a separate "Download Blend" button, but let's stick to the user request.
                                            downloadWithAuth(`/api/runs/${currentRunId}/download/blend?t=${Date.now()}`, 'floorplan.blend');
                                        },
                                        disabled: isGenerating || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().isGenerating3D,
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-md border text-[10px] transition-all", isGenerating || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().isGenerating3D ? "bg-secondary/20 border-border/30 text-muted-foreground opacity-50 cursor-not-allowed" : "bg-secondary/50 border-border hover:bg-orange-950/30 hover:border-orange-500/50 hover:text-orange-400"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 637,
                                                columnNumber: 33
                                            }, this),
                                            isGenerating || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().isGenerating3D ? 'Generating...' : 'Generate & Download .blend'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 618,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                lineNumber: 610,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                        lineNumber: 608,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col overflow-y-auto min-h-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 flex-1 flex flex-col justify-end",
                            children: [
                                user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setProjectsModalOpen(true),
                                    className: "w-full flex items-center justify-center gap-2 p-3 mb-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                            lineNumber: 652,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] font-medium uppercase tracking-wider",
                                            children: "My Projects"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                            lineNumber: 653,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                    lineNumber: 648,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-border pt-4 mt-2",
                                    children: user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    user.picture ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: user.picture,
                                                        alt: user.name,
                                                        className: "w-8 h-8 rounded-full border border-border"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 663,
                                                        columnNumber: 45
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold",
                                                        children: user.name?.[0] || "U"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 665,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "overflow-hidden",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[11px] font-semibold truncate text-foreground",
                                                                children: user.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                                lineNumber: 670,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[9px] text-muted-foreground truncate",
                                                                children: user.email
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                                lineNumber: 671,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 669,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 661,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: logout,
                                                className: "w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-[10px]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                        lineNumber: 678,
                                                        columnNumber: 41
                                                    }, this),
                                                    "Sign Out"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/Sidebar.tsx",
                                                lineNumber: 674,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 660,
                                        columnNumber: 33
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full flex justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$oauth$2f$google$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleLogin"], {
                                            onSuccess: (credentialResponse)=>{
                                                const token = credentialResponse.credential;
                                                if (token) {
                                                    setToken(token);
                                                    try {
                                                        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jwtDecode"])(token);
                                                        setUser({
                                                            email: decoded.email,
                                                            name: decoded.name,
                                                            picture: decoded.picture
                                                        });
                                                    } catch (e) {
                                                        console.error("Token decode failed", e);
                                                    }
                                                }
                                            },
                                            onError: ()=>{
                                                console.log('Login Failed');
                                            },
                                            useOneTap: true,
                                            theme: "outline",
                                            shape: "circle"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                                            lineNumber: 684,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                                        lineNumber: 683,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/Sidebar.tsx",
                                    lineNumber: 658,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/Sidebar.tsx",
                            lineNumber: 645,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/Sidebar.tsx",
                        lineNumber: 644,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/layout/Sidebar.tsx",
                lineNumber: 200,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$ImportModelModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImportModelModal"], {
                isOpen: importModalOpen,
                onClose: ()=>setImportModalOpen(false),
                onImport: onImportModels
            }, void 0, false, {
                fileName: "[project]/app/components/layout/Sidebar.tsx",
                lineNumber: 716,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FurnAIModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FurnAIModal"], {
                isOpen: furnAIModalOpen,
                onClose: ()=>setFurnAIModalOpen(false)
            }, void 0, false, {
                fileName: "[project]/app/components/layout/Sidebar.tsx",
                lineNumber: 721,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$ProjectsModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProjectsModal"], {
                isOpen: projectsModalOpen,
                onClose: ()=>setProjectsModalOpen(false)
            }, void 0, false, {
                fileName: "[project]/app/components/layout/Sidebar.tsx",
                lineNumber: 725,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$TexturizeModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TexturizeModal"], {
                isOpen: texturizeOpen,
                onClose: ()=>setTexturizeOpen(false),
                targetName: selectedId || 'Selection',
                onApply: async (file, tileWidthFt, tileHeightFt)=>{
                    try {
                        if (!currentRunId) {
                            console.error('[TexturizeAI] missing currentRunId');
                            alert('No active run. Please open a project first.');
                            return;
                        }
                        if (!token) {
                            console.error('[TexturizeAI] missing auth token');
                            alert('You are not signed in. Please sign in and try again.');
                            return;
                        }
                        if (!selectedId) {
                            console.error('[TexturizeAI] missing selectedId');
                            alert('Select a wall or floor first, then click Texturize AI.');
                            return;
                        }
                        if (!selectedWall && !selectedRoom) {
                            console.error('[TexturizeAI] selection is not a wall/room', {
                                selectedId
                            });
                            alert('Texturize works only on walls or floors. Please select a wall or floor outline.');
                            return;
                        }
                        const targetId = selectedId;
                        const tileWidthM = tileWidthFt * 0.3048;
                        const tileHeightM = tileHeightFt * 0.3048;
                        const textureDataUrl = await new Promise((resolve, reject)=>{
                            const reader = new FileReader();
                            reader.onload = ()=>resolve(String(reader.result || ''));
                            reader.onerror = ()=>reject(new Error('Failed to read texture file'));
                            reader.readAsDataURL(file);
                        });
                        // Ensure backend has the latest SVG with matching ids (walls/rooms) before applying texture.
                        try {
                            const svgBody = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().exportToSVG();
                            await fetch(`/api/runs/${currentRunId}/svg`, {
                                method: 'PUT',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'image/svg+xml'
                                },
                                body: svgBody
                            });
                        } catch (e) {
                            console.error('[TexturizeAI] failed to sync svg before apply', e);
                        }
                        const form = new FormData();
                        form.append('file', file);
                        form.append('target_id', selectedId);
                        form.append('tile_width_ft', String(tileWidthFt));
                        form.append('tile_height_ft', String(tileHeightFt));
                        console.log('[TexturizeAI] POST /texturize/apply', {
                            runId: currentRunId,
                            targetId: selectedId,
                            tileWidthFt,
                            tileHeightFt
                        });
                        const res = await fetch(`/api/runs/${currentRunId}/texturize/apply`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            body: form
                        });
                        if (!res.ok) {
                            console.error('[TexturizeAI] apply failed', res.status, await res.text());
                            alert('Failed to apply texture');
                            return;
                        }
                        // Refresh SVG into editor state
                        const svgRes = await fetch(`/api/runs/${currentRunId}/svg?t=${Date.now()}`, {
                            cache: 'no-store',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Cache-Control': 'no-cache'
                            }
                        });
                        if (svgRes.ok) {
                            const svgText = await svgRes.text();
                            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().importFromSVG(svgText);
                        }
                        // Apply texture to 3D preview state (importFromSVG recreates walls/rooms and will drop custom fields).
                        if (__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().walls.some((w)=>w.id === targetId)) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().updateWall(targetId, {
                                textureDataUrl,
                                textureTileWidthM: tileWidthM,
                                textureTileHeightM: tileHeightM
                            });
                        }
                        if (__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().rooms.some((r)=>r.id === targetId)) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().updateRoom(targetId, {
                                textureDataUrl,
                                textureTileWidthM: tileWidthM,
                                textureTileHeightM: tileHeightM
                            });
                        }
                    } catch (e) {
                        console.error('[TexturizeAI] crashed', e);
                        alert('Failed to apply texture');
                    }
                }
            }, void 0, false, {
                fileName: "[project]/app/components/layout/Sidebar.tsx",
                lineNumber: 730,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s(Sidebar, "e11tm3dKqgGRaiF1XFs5drVA/Ag=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/Topbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Topbar",
    ()=>Topbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-client] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function Topbar() {
    _s();
    const { mode, setMode, currentRunId, runStatus, setRunId, setRunStatus, uploadedImage, setUploadedImage, isCalibrated, isGenerating3D, syncSVGAndEnter3D, showBackground, toggleBackground, showToast, tutorialStep, setTutorialStep, lastQueuedTask, setLastQueuedTask, token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const [fileToUpload, setFileToUpload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [workerCount, setWorkerCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1) // Optimistic: Assume 1 worker online until proven otherwise
    ;
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Helper to process file (from input or drop)
    const handleFile_Local = (file)=>{
        setFileToUpload(file);
        // Local Preview
        const reader = new FileReader();
        reader.onload = (ev)=>{
            if (ev.target?.result) {
                const url = ev.target.result;
                const img = new Image();
                img.onload = ()=>{
                    setUploadedImage(url, img.width, img.height);
                    setMode('2d');
                // setActiveTool('ruler') // Removed: User wants to manually select ruler
                };
                img.src = url;
            }
        };
        reader.readAsDataURL(file);
        setRunStatus('idle');
    };
    // Poll Worker Status
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Topbar.useEffect": ()=>{
            const checkWorkers = {
                "Topbar.useEffect.checkWorkers": async ()=>{
                    try {
                        const res = await fetch('/api/system/status');
                        if (res.ok) {
                            const data = await res.json();
                            setWorkerCount(data.workers_online || 0);
                        }
                    } catch (e) {
                        console.error("Worker check failed", e);
                        setWorkerCount(0);
                    }
                }
            }["Topbar.useEffect.checkWorkers"];
            checkWorkers();
            const interval = setInterval(checkWorkers, 5000);
            return ({
                "Topbar.useEffect": ()=>clearInterval(interval)
            })["Topbar.useEffect"];
        }
    }["Topbar.useEffect"], []);
    // Polling logic for Runs
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Topbar.useEffect": ()=>{
            let interval;
            console.log("[Topbar] Polling Effect:", {
                currentRunId,
                runStatus
            });
            if (currentRunId && runStatus === 'processing') {
                console.log("[Topbar] Starting Polling for:", currentRunId);
                interval = setInterval({
                    "Topbar.useEffect": async ()=>{
                        try {
                            const res = await fetch(`/api/runs/${currentRunId}/status`, {
                                headers: token ? {
                                    'Authorization': `Bearer ${token}`
                                } : {}
                            });
                            console.log("[Topbar] Poll Status Res:", res.status);
                            if (res.ok) {
                                const data = await res.json();
                                if (data.status === 'COMPLETED') {
                                    // Fetch and Import SVG
                                    // Fetch and Import SVG
                                    const svgRes = await fetch(`/api/runs/${currentRunId}/svg`, {
                                        headers: token ? {
                                            'Authorization': `Bearer ${token}`
                                        } : {}
                                    });
                                    if (svgRes.ok) {
                                        const svgText = await svgRes.text();
                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().importFromSVG(svgText);
                                    } else {
                                        console.error('[DEBUG] Failed to fetch SVG:', svgRes.status);
                                    }
                                    // Tutorial progression
                                    if (lastQueuedTask === 'detect_rooms') {
                                        // Detect rooms returns a new SVG with room labels/geometry.
                                        setTutorialStep('floor_review');
                                        setLastQueuedTask('none');
                                    } else {
                                        // Initial prediction job: if not calibrated, start tutorial.
                                        if (tutorialStep === 'none' && !__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().isCalibrated) {
                                            setTutorialStep('calibration');
                                        }
                                    }
                                    setRunStatus('completed');
                                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setShowProcessingModal(false);
                                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setShowQueueModal(false); // Ensure Queue modal is closed too
                                    clearInterval(interval);
                                } else if (data.status === 'FAILED') {
                                    setRunStatus('failed');
                                    clearInterval(interval);
                                }
                            }
                        } catch (e) {
                            console.error("Polling error:", e);
                        }
                    }
                }["Topbar.useEffect"], 1000);
            }
            return ({
                "Topbar.useEffect": ()=>clearInterval(interval)
            })["Topbar.useEffect"];
        }
    }["Topbar.useEffect"], [
        currentRunId,
        runStatus,
        setRunStatus,
        lastQueuedTask,
        setLastQueuedTask,
        tutorialStep,
        setTutorialStep
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-14 border-b bg-card flex items-center justify-between px-4 select-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/",
                        className: "w-8 h-8 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/logo.png",
                            alt: "Logo",
                            className: "w-full h-full object-contain"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/Topbar.tsx",
                            lineNumber: 116,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/Topbar.tsx",
                        lineNumber: 115,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-bold text-sm tracking-tight leading-none",
                                children: "Strukt AI"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 119,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mt-0.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-2 h-2 rounded-full", workerCount > 0 ? "bg-green-500 animate-pulse" : "bg-red-500")
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Topbar.tsx",
                                        lineNumber: 121,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-muted-foreground font-mono",
                                        children: workerCount > 0 ? `${workerCount} WORKER ONLINE` : "NO WORKER"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/Topbar.tsx",
                                        lineNumber: 122,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 120,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Topbar.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/layout/Topbar.tsx",
                lineNumber: 113,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-[1px] bg-border mx-2"
            }, void 0, false, {
                fileName: "[project]/app/components/layout/Topbar.tsx",
                lineNumber: 130,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex bg-muted/50 p-1 rounded-lg gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleBackground,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium", showBackground ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"),
                        title: "Toggle Background Image",
                        children: [
                            showBackground ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 142,
                                columnNumber: 39
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 142,
                                columnNumber: 69
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden sm:inline",
                                children: "Ref Image"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 143,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Topbar.tsx",
                        lineNumber: 134,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setMode('2d'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium", mode === '2d' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 153,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "2D Editor"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 154,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Topbar.tsx",
                        lineNumber: 146,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            // Restore: Calibration Check & Generation Trigger
                            if (!isCalibrated) {
                                // Changed alert to nice toast
                                showToast("Calibration Required! Please select the Ruler Tool to calibrate.", 'error');
                                // setActiveTool('ruler') // Removed: User wants manual control
                                return;
                            }
                            if (isGenerating3D) {
                                showToast("3D Generation is already in progress...", 'info');
                                return;
                            }
                            setMode('3d');
                            syncSVGAndEnter3D();
                        },
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-medium", mode === '3d' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50", // Add visual feedback for generating state
                        isGenerating3D && "animate-pulse text-yellow-500"),
                        title: "Generate 3D Model",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 180,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "3D View"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/Topbar.tsx",
                                lineNumber: 181,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/Topbar.tsx",
                        lineNumber: 156,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/layout/Topbar.tsx",
                lineNumber: 133,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative flex items-center gap-2",
                    children: [
                        uploadedImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: runStatus === 'processing',
                            onClick: async ()=>{
                                if (!fileToUpload) return;
                                // Auth Check
                                if (!token) {
                                    showToast("Please login to process floorplans", 'error');
                                    return;
                                }
                                setRunStatus('processing');
                                const formData = new FormData();
                                formData.append('image', fileToUpload);
                                try {
                                    const res = await fetch('/api/runs', {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: formData
                                    });
                                    // Trigger Popup based on Worker Status
                                    if (workerCount > 0) {
                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setShowProcessingModal(true);
                                    } else {
                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setShowQueueModal(true);
                                    }
                                    // Check Status
                                    if (res.status === 403) {
                                        showToast(`Limit Reached (5/5). Load an existing project or Delete one to create new.`, 'error');
                                        // Auto-open projects modal to let them delete
                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setProjectsModalOpen(true);
                                        setRunStatus('idle');
                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setShowProcessingModal(false);
                                        return;
                                    }
                                    const text = await res.text();
                                    if (!res.ok) throw new Error(text);
                                    const data = JSON.parse(text);
                                    if (data.ok) {
                                        setRunId(data.run_id);
                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setRunId(data.run_id);
                                        // If Server says it's Offline Queue, switch modals
                                        if (data.status === 'QUEUED_OFFLINE') {
                                            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setShowProcessingModal(false);
                                            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setShowQueueModal(true);
                                            showToast("Job saved to Offline Queue (No Workers Online)", 'info');
                                        }
                                    } else {
                                        throw new Error(data.detail);
                                    }
                                } catch (e) {
                                    console.error(e);
                                    setRunStatus('failed');
                                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().setShowProcessingModal(false); // Fix: Close modal on error
                                    // Don't alert if we already handled 403
                                    if (!e.message?.includes("Limit")) {
                                        alert('Upload failed: ' + e.message);
                                    }
                                }
                            },
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2", "bg-green-600 text-white hover:bg-green-700 shadow-sm"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/Topbar.tsx",
                                    lineNumber: 264,
                                    columnNumber: 29
                                }, this),
                                "Process Floorplan"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/Topbar.tsx",
                            lineNumber: 190,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2", "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-transparent", isDragging && "border-primary bg-primary/10 text-primary"),
                            onDragOver: (e)=>{
                                e.preventDefault();
                                setIsDragging(true);
                            },
                            onDragLeave: (e)=>{
                                e.preventDefault();
                                setIsDragging(false);
                            },
                            onDrop: (e)=>{
                                e.preventDefault();
                                setIsDragging(false);
                                if (runStatus === 'processing') return;
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleFile_Local(file);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "file",
                                    className: "hidden",
                                    accept: "image/*",
                                    disabled: runStatus === 'processing',
                                    onChange: (e)=>{
                                        const file = e.target.files?.[0];
                                        if (file) handleFile_Local(file);
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/Topbar.tsx",
                                    lineNumber: 291,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-4 h-4 rotate-180", runStatus === 'processing' && "animate-spin")
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/Topbar.tsx",
                                    lineNumber: 301,
                                    columnNumber: 25
                                }, this),
                                runStatus === 'processing' ? 'Processing...' : uploadedImage ? 'Change Image' : 'Select Floorplan'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/Topbar.tsx",
                            lineNumber: 269,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/Topbar.tsx",
                    lineNumber: 187,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/layout/Topbar.tsx",
                lineNumber: 185,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/layout/Topbar.tsx",
        lineNumber: 112,
        columnNumber: 9
    }, this);
}
_s(Topbar, "Z4dTgaF4dqzAzt9l7HwOXUUMbT4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = Topbar;
var _c;
__turbopack_context__.k.register(_c, "Topbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/RightSidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RightSidebar",
    ()=>RightSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-2.js [app-client] (ecmascript) <export default as MousePointer2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function RightSidebar() {
    _s();
    const { activeTool, mode, token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const downloadWithAuth = async (url, filename)=>{
        if (!token) {
            alert('You are not signed in. Please sign in and try again.');
            return;
        }
        const res = await fetch(url, {
            cache: 'no-store',
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        });
        if (!res.ok) {
            const txt = await res.text().catch(()=>'');
            console.error('[Download] failed', res.status, txt);
            try {
                const errParse = JSON.parse(txt);
                alert(`Download failed: ${errParse.detail || txt}`);
            } catch  {
                alert(`Download failed: ${res.statusText}`);
            }
            return;
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
    };
    // --- AI / SAM3D State ---
    const [imageSrc, setImageSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [jobId, setJobId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isProcessingAI, setIsProcessingAI] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [statusMsg, setStatusMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [masks, setMasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [generatedModels, setGeneratedModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const overlayRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Show sidebar if:
    // 1. "Furniture" tool (now AI Reconstruction) is active
    // 2. Mode is "3d" (3D Options/Results)
    const isVisible = activeTool === 'furniture' || mode === '3d';
    // --- AI Handlers ---
    // 1. Upload Image
    const handleFileUpload = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        setIsProcessingAI(true);
        setStatusMsg("Uploading...");
        // Preview
        const reader = new FileReader();
        reader.onload = (ev)=>{
            if (ev.target?.result) setImageSrc(ev.target.result);
        };
        reader.readAsDataURL(file);
        // Upload to API
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch('/api/runs', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.ok) {
                setJobId(data.run_id);
                setStatusMsg("Ready. Click object to segment.");
            } else {
                setStatusMsg("Upload failed.");
            }
        } catch (err) {
            console.error(err);
            setStatusMsg("Error uploading.");
        } finally{
            setIsProcessingAI(false);
        }
    };
    // 2. Adjust Canvas Size when image loads
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RightSidebar.useEffect": ()=>{
            if (!imageSrc || !canvasRef.current || !overlayRef.current) return;
            const img = new Image();
            img.src = imageSrc;
            img.onload = ({
                "RightSidebar.useEffect": ()=>{
                    if (canvasRef.current && overlayRef.current) {
                        // Fit to sidebar width (approx 280px minus padding)
                        // We keep aspect ratio but scale down for display
                        // Actually, for segmentation click coordinates to match, we need to handle scaling carefully.
                        // We'll let CSS handle display size, but set internal resolution to match image?
                        // Or just set strict width.
                        // Let's stick to intrinsic size for canvas and scale visually with CSS max-w-full
                        canvasRef.current.width = img.width;
                        canvasRef.current.height = img.height;
                        overlayRef.current.width = img.width;
                        overlayRef.current.height = img.height;
                        const ctx = canvasRef.current.getContext('2d');
                        ctx?.drawImage(img, 0, 0);
                    }
                }
            })["RightSidebar.useEffect"];
        }
    }["RightSidebar.useEffect"], [
        imageSrc
    ]);
    // 3. Click Segmentation
    const handleCanvasClick = async (e)=>{
        if (!jobId || isProcessingAI || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        setIsProcessingAI(true);
        setStatusMsg("Segmenting...");
        try {
            const formData = new FormData();
            formData.append('job_id', jobId);
            formData.append('x', x.toString());
            formData.append('y', y.toString());
            formData.append('intent', 'user_click');
            const res = await fetch('/api/sam3d/segment-click', {
                method: 'POST',
                body: formData,
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : undefined
            });
            const data = await res.json().catch(()=>({}));
            if (res.status === 429) {
                setStatusMsg(data?.message || 'GPU busy. Please wait and try again.');
                return;
            }
            if (data.ok || data.mask_id) {
                // The new server endpoint returns `job_id` for the specific click task.
                const clickJobId = data.job_id;
                // If polygon is missing (async worker), poll for it via the status endpoint
                let result = data;
                if (!result.polygon && clickJobId) {
                    setStatusMsg("Processing click...");
                    const pollStart = Date.now();
                    while(Date.now() - pollStart < 15000){
                        await new Promise((r)=>setTimeout(r, 150));
                        try {
                            const check = await fetch(`/api/runs/${clickJobId}/status?t=${Date.now()}`);
                            if (check.ok) {
                                const statusData = await check.json();
                                // The worker writes the mask polygon into the DB result column when COMPLETED
                                if (statusData.status === 'COMPLETED' && statusData.result) {
                                    if (statusData.result.polygon && statusData.result.polygon.length > 0) {
                                        result = statusData.result;
                                        break;
                                    }
                                } else if (statusData.status === 'FAILED') {
                                    setStatusMsg("Segmentation failed internally.");
                                    break;
                                }
                            }
                        } catch (e) {}
                    }
                }
                if (result.polygon) {
                    setMasks([
                        result
                    ]);
                    drawMasks([
                        result
                    ]);
                    setStatusMsg("Segmented! Ready to generate.");
                } else {
                    setStatusMsg("Segmentation timed out.");
                }
            } else {
                setStatusMsg("No object found.");
            }
        } catch (err) {
            console.error(err);
            setStatusMsg("Segmentation failed.");
        } finally{
            setIsProcessingAI(false);
        }
    };
    const drawMasks = (maskList)=>{
        if (!overlayRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        maskList.forEach((mask)=>{
            if (mask.polygon && mask.polygon.length > 0) {
                ctx.beginPath();
                ctx.moveTo(mask.polygon[0][0], mask.polygon[0][1]);
                for(let i = 1; i < mask.polygon.length; i++){
                    ctx.lineTo(mask.polygon[i][0], mask.polygon[i][1]);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        });
    };
    // 4. Trigger 3D
    const trigger3D = async ()=>{
        if (!jobId || masks.length === 0) return;
        setIsProcessingAI(true);
        setStatusMsg("Queuing 3D Generation...");
        try {
            const res = await fetch('/api/sam3d/reconstruct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_id: jobId,
                    polygon: masks[0].polygon
                })
            });
            const data = await res.json();
            if (data.ok) {
                // Don't poll here. Just notify queued.
                // The backend handles the job separately.
                setStatusMsg(`Queued: ${data.message || "3D Model"}`);
                setIsProcessingAI(false);
            // Add to list immediately as placeholder? 
            // No, let the user continue.
            } else {
                setStatusMsg("Failed to start 3D gen.");
                setIsProcessingAI(false);
            }
        } catch (err) {
            console.error(err);
            setIsProcessingAI(false);
            setStatusMsg("Error calling backend.");
        }
    };
    const pollFor3D = async (currentJobId)=>{
        setStatusMsg("Worker is generating 3D...");
        const interval = setInterval(async ()=>{
            try {
                const res = await fetch(`/api/runs/${currentJobId}/status`);
                const data = await res.json();
                if (data.status === 'COMPLETED') {
                    clearInterval(interval);
                    setIsProcessingAI(false);
                    setStatusMsg("3D Ready!");
                    addGeneratedModel(currentJobId);
                } else if (data.status === 'FAILED') {
                    clearInterval(interval);
                    setIsProcessingAI(false);
                    setStatusMsg("3D Generation Failed: " + data.error);
                }
            } catch (e) {
                console.error(e);
            }
        }, 2000);
    };
    const addGeneratedModel = (id)=>{
        const glbUrl = `/api/runs/${id}/download/glb`;
        if (!generatedModels.find((m)=>m.id === id)) {
            setGeneratedModels((prev)=>[
                    {
                        id,
                        url: glbUrl
                    },
                    ...prev
                ]);
        }
    };
    if (!isVisible) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-[320px] border-l bg-card h-[calc(100vh-3.5rem)] flex flex-col select-none overflow-hidden animate-in slide-in-from-right duration-300",
        children: activeTool === 'furniture' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 flex flex-col overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-b",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                            children: "AI Reconstruction"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                            lineNumber: 311,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] text-muted-foreground mt-1",
                            children: "Upload an image and segment objects to create 3D models."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                            lineNumber: 312,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                    lineNumber: 310,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 overflow-y-auto flex-1 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>fileInputRef.current?.click(),
                                            className: "flex-1 flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 px-3 py-2 rounded text-xs font-semibold transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 324,
                                                    columnNumber: 37
                                                }, this),
                                                "Upload Image"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 320,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            ref: fileInputRef,
                                            type: "file",
                                            className: "hidden",
                                            accept: "image/*",
                                            onChange: handleFileUpload
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 327,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: trigger3D,
                                            disabled: masks.length === 0 || isProcessingAI,
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold transition-colors border", masks.length > 0 ? "bg-accent text-accent-foreground border-accent" : "bg-muted text-muted-foreground border-border cursor-not-allowed"),
                                            children: [
                                                isProcessingAI ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-3 h-3 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 337,
                                                    columnNumber: 55
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 337,
                                                    columnNumber: 102
                                                }, this),
                                                "Generate 3D"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 329,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 319,
                                    columnNumber: 29
                                }, this),
                                statusMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `text-[10px] font-mono text-center p-1.5 rounded ${statusMsg.includes("Queued") ? "bg-green-500/20 text-green-300" : statusMsg.includes("Error") || statusMsg.includes("Failed") ? "bg-red-500/20 text-red-300" : "bg-secondary/30 text-muted-foreground"}`,
                                    children: statusMsg
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 343,
                                    columnNumber: 33
                                }, this),
                                statusMsg.includes("Queued") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setStatusMsg("Ready. Click object to segment.");
                                        setMasks([]);
                                        if (overlayRef.current) {
                                            const ctx = overlayRef.current.getContext('2d');
                                            ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
                                        }
                                    },
                                    className: "w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded text-xs font-semibold transition-colors animate-in fade-in",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__["MousePointer2"], {
                                            className: "w-3 h-3"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 363,
                                            columnNumber: 37
                                        }, this),
                                        "Segment Another Object"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 352,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                            lineNumber: 318,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative border rounded-lg overflow-hidden bg-black/20 flex items-center justify-center min-h-[200px] border-dashed border-border/50",
                            children: [
                                !imageSrc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center text-muted-foreground/50 p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__["MousePointer2"], {
                                            className: "w-8 h-8 mx-auto mb-2 opacity-50"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 373,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs",
                                            children: "No image loaded"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 374,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 372,
                                    columnNumber: 33
                                }, this),
                                imageSrc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative max-w-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: canvasRef,
                                            className: "block w-full h-auto cursor-crosshair",
                                            onMouseDown: handleCanvasClick
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 380,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: overlayRef,
                                            className: "absolute top-0 left-0 w-full h-full pointer-events-none"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 385,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 379,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                            lineNumber: 370,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 border-b bg-primary/5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
                                    children: "AI Status"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 394,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between text-[11px]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-muted-foreground",
                                                    children: "Job ID:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 397,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-mono text-primary truncate max-w-[100px]",
                                                    children: jobId || 'None'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 396,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between text-[11px]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-muted-foreground",
                                                    children: "State:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 401,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("font-semibold", statusMsg.includes("Error") ? "text-red-400" : statusMsg.includes("Ready") ? "text-green-400" : "text-yellow-400"),
                                                    children: statusMsg || 'Idle'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 402,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 400,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 395,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                            lineNumber: 393,
                            columnNumber: 25
                        }, this),
                        generatedModels.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 border-b border-border/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-[10px] font-semibold text-muted-foreground uppercase mb-2",
                                    children: "Generated Models"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 415,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: generatedModels.map((model)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-secondary/20 rounded-md p-2 border border-border/50 flex items-center justify-between group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-mono text-muted-foreground truncate max-w-[120px]",
                                                    children: model.id
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 419,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>downloadWithAuth(`${model.url}?t=${Date.now()}`, 'floorplan.glb'),
                                                    className: "text-[9px] flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded hover:bg-primary/20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                            lineNumber: 426,
                                                            columnNumber: 49
                                                        }, this),
                                                        "GLB"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 422,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>downloadWithAuth(`/api/runs/${model.id}/svg/raw?t=${Date.now()}`, `inference_raw_${model.id}.svg`),
                                                    className: "text-[9px] flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded hover:bg-primary/20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                            lineNumber: 433,
                                                            columnNumber: 49
                                                        }, this),
                                                        "SVG"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: async ()=>{
                                                        await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().triggerBlenderGeneration();
                                                        downloadWithAuth(`/api/runs/${model.id}/download/blend?t=${Date.now()}`, 'floorplan.blend');
                                                    },
                                                    disabled: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().isGenerating3D,
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-[9px] flex items-center gap-1 border px-2 py-1 rounded transition-colors", __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().isGenerating3D ? "bg-primary/5 text-primary/50 border-primary/10 cursor-not-allowed" : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                            lineNumber: 449,
                                                            columnNumber: 49
                                                        }, this),
                                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"].getState().isGenerating3D ? 'Gen...' : 'Blend'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                                    lineNumber: 436,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, model.id, true, {
                                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                            lineNumber: 418,
                                            columnNumber: 41
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                                    lineNumber: 416,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/RightSidebar.tsx",
                            lineNumber: 414,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/RightSidebar.tsx",
                    lineNumber: 315,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/RightSidebar.tsx",
            lineNumber: 309,
            columnNumber: 17
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/RightSidebar.tsx",
        lineNumber: 305,
        columnNumber: 9
    }, this);
}
_s(RightSidebar, "vUfgcW3eAhiLpcGAWK2jkdxRXK0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = RightSidebar;
var _c;
__turbopack_context__.k.register(_c, "RightSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/FloatingUpgradeCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingUpgradeCard",
    ()=>FloatingUpgradeCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
'use client';
;
;
function FloatingUpgradeCard({ onUpgrade, onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 duration-500",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#121217] border border-white/5 rounded-2xl p-4 shadow-2xl w-[280px] backdrop-blur-md relative group",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:text-white p-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-lg",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "w-3 h-3"
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                        lineNumber: 21,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                    lineNumber: 17,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between mb-3",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-1.5 rounded-md bg-purple-500/20 text-purple-400",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                                    lineNumber: 28,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                                lineNumber: 27,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-semibold text-white tracking-wide",
                                children: "FurnAI"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                                lineNumber: 30,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                        lineNumber: 26,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                    lineNumber: 25,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-[11px] text-zinc-400 mb-4 leading-relaxed",
                    children: "Turn your reference images to 3D."
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                    lineNumber: 35,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onUpgrade,
                    className: "w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] hover:opacity-90 transition-opacity text-xs font-semibold text-white shadow-lg shadow-purple-900/20",
                    children: "Upgrade"
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
                    lineNumber: 40,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
            lineNumber: 14,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/FloatingUpgradeCard.tsx",
        lineNumber: 13,
        columnNumber: 9
    }, this);
}
_c = FloatingUpgradeCard;
var _c;
__turbopack_context__.k.register(_c, "FloatingUpgradeCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/PremiumModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PremiumModal",
    ()=>PremiumModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-client] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
'use client';
;
;
function PremiumModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-[600px] bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300",
            style: {
                boxShadow: '0 0 40px -10px rgba(124, 58, 237, 0.2), 0 0 20px -10px rgba(124, 58, 237, 0.1)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                    lineNumber: 25,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                    lineNumber: 26,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "w-5 h-5"
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/PremiumModal.tsx",
                        lineNumber: 33,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                    lineNumber: 29,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8 flex flex-col items-center text-center relative z-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full aspect-video bg-black/40 rounded-xl border border-white/5 mb-8 flex items-center justify-center group cursor-pointer relative overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                    lineNumber: 42,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                        className: "w-6 h-6 text-white fill-white ml-1"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                        lineNumber: 46,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                    lineNumber: 45,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute bottom-4 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full w-1/3 bg-white/80 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                        lineNumber: 51,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                    lineNumber: 50,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/PremiumModal.tsx",
                            lineNumber: 39,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-white mb-2",
                            children: [
                                "Unlock ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400",
                                    children: "AI Reconstruction"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                    lineNumber: 57,
                                    columnNumber: 32
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/PremiumModal.tsx",
                            lineNumber: 56,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-white/60 mb-8 max-w-sm text-sm leading-relaxed",
                            children: "Transform your 2D sketches into stunning 3D models instantly. Get access to advanced furniture recognition and high-quality renders."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/PremiumModal.tsx",
                            lineNumber: 60,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "w-full max-w-xs group relative overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                    lineNumber: 67,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-3 text-sm font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                            className: "w-4 h-4 mr-2 text-yellow-500"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                            lineNumber: 69,
                                            columnNumber: 29
                                        }, this),
                                        "Upgrade to Premium"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                    lineNumber: 68,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                                    lineNumber: 74,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/PremiumModal.tsx",
                            lineNumber: 66,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "mt-4 text-xs text-white/30 hover:text-white/50 transition-colors",
                            children: "Dismiss"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/PremiumModal.tsx",
                            lineNumber: 77,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/PremiumModal.tsx",
                    lineNumber: 36,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/PremiumModal.tsx",
            lineNumber: 18,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/PremiumModal.tsx",
        lineNumber: 16,
        columnNumber: 9
    }, this);
}
_c = PremiumModal;
var _c;
__turbopack_context__.k.register(_c, "PremiumModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/FurnAIProcessingModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FurnAIProcessingModal",
    ()=>FurnAIProcessingModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function FurnAIProcessingModal({ isOpen }) {
    _s();
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FurnAIProcessingModal.useEffect": ()=>{
            if (isOpen) {
                setProgress(0);
                const interval = setInterval({
                    "FurnAIProcessingModal.useEffect.interval": ()=>{
                        setProgress({
                            "FurnAIProcessingModal.useEffect.interval": (prev)=>Math.min(prev + 1, 100)
                        }["FurnAIProcessingModal.useEffect.interval"]);
                    }
                }["FurnAIProcessingModal.useEffect.interval"], 480);
                return ({
                    "FurnAIProcessingModal.useEffect": ()=>clearInterval(interval)
                })["FurnAIProcessingModal.useEffect"];
            }
        }
    }["FurnAIProcessingModal.useEffect"], [
        isOpen
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col items-center text-center p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-primary/10 p-2 rounded-lg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                className: "w-5 h-5 text-primary"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                                lineNumber: 32,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                            lineNumber: 31,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-lg font-bold text-foreground",
                            children: "Strukt AI Processing"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                            lineNumber: 34,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                    lineNumber: 30,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full aspect-video bg-muted rounded-xl mb-6 overflow-hidden relative border border-border group",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                            className: "w-full h-full object-cover opacity-80 mix-blend-luminosity",
                            autoPlay: true,
                            loop: true,
                            muted: true,
                            playsInline: true,
                            src: "/step1.mp4"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                            lineNumber: 41,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                            lineNumber: 49,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                    lineNumber: 40,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-foreground font-medium mb-2",
                    children: "Analyzing Geometry"
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                    lineNumber: 53,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground mb-6 max-w-[90%]",
                    children: "Our AI is converting your floorplan measurements into a 3D environment. This may take a moment."
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                    lineNumber: 54,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-1 bg-secondary rounded-full overflow-hidden mb-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full bg-primary transition-all duration-100 ease-linear",
                        style: {
                            width: `${progress}%`
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                        lineNumber: 60,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                    lineNumber: 59,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 text-xs text-muted-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "w-3 h-3 animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                            lineNumber: 66,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Processing..."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                            lineNumber: 67,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
                    lineNumber: 65,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
            lineNumber: 27,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/FurnAIProcessingModal.tsx",
        lineNumber: 26,
        columnNumber: 9
    }, this);
}
_s(FurnAIProcessingModal, "ZVQpwjU6Dz5R8VBOzPsnxGRmMVo=");
_c = FurnAIProcessingModal;
var _c;
__turbopack_context__.k.register(_c, "FurnAIProcessingModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/FurnAIQueueModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FurnAIQueueModal",
    ()=>FurnAIQueueModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function FurnAIQueueModal({ isOpen, onClose }) {
    _s();
    const { currentRunId, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submitted, setSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Auto-Submit for Logged In Users
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FurnAIQueueModal.useEffect": ()=>{
            console.log("[Queue] Check Auto-Submit:", {
                user: user?.email,
                isOpen,
                submitted,
                isSubmitting
            });
            if (user?.email && isOpen && !submitted && !isSubmitting) {
                console.log("[Queue] Triggering Auto-Submit for", user.email);
                handleSubmit();
            }
        }
    }["FurnAIQueueModal.useEffect"], [
        isOpen,
        user,
        submitted,
        isSubmitting
    ]);
    const handleSubmit = async (e)=>{
        if (e) e.preventDefault();
        const targetEmail = email || user?.email;
        if (!targetEmail || !currentRunId) return;
        setIsSubmitting(true);
        try {
            // 1. Send Email to Backend
            const res = await fetch(`/api/runs/${currentRunId}/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: targetEmail
                })
            });
            if (!res.ok) throw new Error('Failed to join queue');
            // 2. Trigger Floorplan Download (as promised)
            // ... (Download logic same as before)
            const downloadRes = await fetch(`/api/runs/${currentRunId}/svg`);
            if (downloadRes.ok) {
                const blob = await downloadRes.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `floorplan-${currentRunId}.svg`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
            setSubmitted(true);
            setTimeout(onClose, 3000); // Auto close after success
        } catch (err) {
            console.error(err);
            if (!user?.email) alert("Failed to join queue. Please try again.");
        } finally{
            setIsSubmitting(false);
        }
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full max-w-md bg-card border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "w-5 h-5"
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                        lineNumber: 79,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                    lineNumber: 75,
                    columnNumber: 17
                }, this),
                !submitted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-amber-500/10 p-3 rounded-xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        className: "w-6 h-6 text-amber-500"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                        lineNumber: 86,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                    lineNumber: 85,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-bold text-foreground",
                                            children: "Workers Offline"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                            lineNumber: 89,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-amber-500/80 font-medium",
                                            children: "HIGH DEMAND • SERVER BUSY"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                            lineNumber: 90,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                    lineNumber: 88,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                            lineNumber: 84,
                            columnNumber: 25
                        }, this),
                        user?.email ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center py-6 animate-pulse",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "w-8 h-8 text-amber-500 animate-spin mb-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                    lineNumber: 96,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold text-foreground",
                                    children: [
                                        "Confirming spot for ",
                                        user.name,
                                        "..."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                    lineNumber: 97,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: user.email
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                    lineNumber: 98,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                            lineNumber: 95,
                            columnNumber: 29
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-muted-foreground text-sm mb-6 leading-relaxed",
                                    children: [
                                        "We are currently running short on compute power. Don't worry, your work isn't lost.",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                            lineNumber: 104,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                            lineNumber: 104,
                                            columnNumber: 43
                                        }, this),
                                        "Enter your email below. We will place you in the ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Priority Queue"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                            lineNumber: 105,
                                            columnNumber: 86
                                        }, this),
                                        " and email you the ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-foreground font-semibold",
                                            children: ".blend file"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                            lineNumber: 106,
                                            columnNumber: 51
                                        }, this),
                                        " as soon as a worker becomes available."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                    lineNumber: 102,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    onSubmit: handleSubmit,
                                    className: "flex flex-col gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                    className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                                    lineNumber: 111,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "email",
                                                    required: true,
                                                    placeholder: "Enter your email address",
                                                    value: email,
                                                    onChange: (e)=>setEmail(e.target.value),
                                                    className: "w-full bg-secondary/50 border border-border rounded-lg py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                                    lineNumber: 112,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                            lineNumber: 110,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: isSubmitting,
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all", "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20", isSubmitting && "opacity-70 cursor-wait"),
                                            children: [
                                                isSubmitting ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-4 h-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 57
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 104
                                                }, this),
                                                isSubmitting ? "Queueing..." : "Queue & Auto-Download Floorplan"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                            lineNumber: 122,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                    lineNumber: 109,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center text-center py-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                className: "w-8 h-8 text-green-500"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                                lineNumber: 141,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                            lineNumber: 140,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold text-foreground mb-2",
                            children: "You're on the list!"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                            lineNumber: 143,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground text-sm max-w-[260px]",
                            children: "We've saved your spot. Check your inbox (and spam) folder in a few minutes."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                            lineNumber: 144,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
                    lineNumber: 139,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
            lineNumber: 73,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/FurnAIQueueModal.tsx",
        lineNumber: 72,
        columnNumber: 9
    }, this);
}
_s(FurnAIQueueModal, "DNnw4D8SwjK3z4J0s6LumhyUJyA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = FurnAIQueueModal;
var _c;
__turbopack_context__.k.register(_c, "FurnAIQueueModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/GlobalToast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GlobalToast",
    ()=>GlobalToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function GlobalToast() {
    _s();
    const toast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "GlobalToast.useFloorplanStore[toast]": (s)=>s.toast
    }["GlobalToast.useFloorplanStore[toast]"]);
    if (!toast) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md min-w-[320px]", "bg-[#0f0f13]/90 border-white/10 text-white"),
            children: [
                toast.type === 'error' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                    className: "w-5 h-5 text-red-500"
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/GlobalToast.tsx",
                    lineNumber: 18,
                    columnNumber: 44
                }, this),
                toast.type === 'success' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                    className: "w-5 h-5 text-green-500"
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/GlobalToast.tsx",
                    lineNumber: 19,
                    columnNumber: 46
                }, this),
                toast.type === 'info' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                    className: "w-5 h-5 text-blue-500"
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/GlobalToast.tsx",
                    lineNumber: 20,
                    columnNumber: 43
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm font-medium tracking-wide",
                    children: toast.message
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/GlobalToast.tsx",
                    lineNumber: 22,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/GlobalToast.tsx",
            lineNumber: 14,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/GlobalToast.tsx",
        lineNumber: 13,
        columnNumber: 9
    }, this);
}
_s(GlobalToast, "P6kCoFb/q/6bMUai75JNzxiGbro=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = GlobalToast;
var _c;
__turbopack_context__.k.register(_c, "GlobalToast");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/TermsModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TermsModal",
    ()=>TermsModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
'use client';
;
;
function TermsModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between p-6 border-b border-white/5 bg-white/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 rounded-lg bg-purple-500/10 text-purple-400",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/TermsModal.tsx",
                                        lineNumber: 21,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                                    lineNumber: 20,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-bold text-white",
                                            children: "Terms & Privacy Policy"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                                            lineNumber: 24,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-white/40",
                                            children: "Last Updated: 1/02/2026"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                                            lineNumber: 25,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                                    lineNumber: 23,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 19,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/TermsModal.tsx",
                                lineNumber: 32,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 28,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                    lineNumber: 18,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-y-auto p-6 text-sm text-white/70 custom-scrollbar whitespace-pre-line leading-relaxed",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "1. Introduction"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 39,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: 'Welcome to StruktAI (the "Service", "Platform", "Application", or "Product"), operated by an independent solo developer ("we", "us", "our"). By accessing, registering for, or using this Service in any manner, you ("User", "you", "your") acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions ("Terms").'
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 40,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "2. Beta / Early Access Disclaimer"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 45,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-semibold",
                                    children: "This Service is provided as a Beta / Early Access product."
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                                    lineNumber: 47,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "You expressly acknowledge and agree that:"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                                    lineNumber: 48,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "list-disc pl-5 mt-1 space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "The Service is experimental, unfinished, and under active development"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                                            lineNumber: 50,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "Features may be incomplete, unstable, inaccurate, or change without notice"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                                            lineNumber: 51,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "Bugs, errors, downtime, interruptions, or unexpected behavior may occur"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                                            lineNumber: 52,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "Data loss, corruption, or deletion may occur"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                                            lineNumber: 53,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "Performance, availability, and accuracy are not guaranteed"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                                            lineNumber: 54,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                                    lineNumber: 49,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-xs opacity-80",
                                    children: 'The Service is provided "AS IS" and "AS AVAILABLE", solely for testing, evaluation, and early feedback purposes.'
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                                    lineNumber: 56,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 46,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "3. Eligibility"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 59,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "By using this Service, you represent that you are at least 18 years old, have the legal capacity to enter into these Terms, and are using the Service for lawful purposes only. We reserve the right to refuse access to anyone at our sole discretion."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 60,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "4. Use of the Service"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 64,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "You agree to use the Service responsibly and lawfully. You will not misuse, abuse, reverse-engineer, scrape, or exploit the Service. You also agree not to rely on the Service for mission-critical, legal, medical, financial, or safety-critical decisions."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 65,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "5. Data, Storage, and Security"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 69,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-2 font-semibold",
                            children: "5.1 User Data"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 70,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-2",
                            children: "The Service may process and store user-provided data (images, files) and generated outputs (3D models). We use third-party infrastructure and tools."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 71,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-2 font-semibold",
                            children: "5.2 No Guarantee of Data Retention"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 72,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-2",
                            children: "We do not guarantee permanent storage. Data may be deleted, reset, or lost at any time. You are responsible for maintaining your own backups."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 73,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4 font-semibold",
                            children: "5.3 Security Disclaimer"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 74,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "No system is completely secure. Unauthorized access or breaches may occur. You use the Service at your own risk."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 75,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "6. AI & Generated Output Disclaimer"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 77,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "Outputs may be inaccurate, incomplete, misleading, or unusable. Results are not guaranteed to be correct or fit for any purpose. Generated outputs should be reviewed and validated independently."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 78,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "7. No Warranty"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 82,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "To the maximum extent permitted by law, the Service is provided WITHOUT WARRANTIES OF ANY KIND."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 83,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "8. Limitation of Liability"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 87,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-bold uppercase text-xs tracking-wider mb-1",
                                    children: "Very Important"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                                    lineNumber: 89,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "In no event shall we be liable for loss of data, profits, revenue, or business interruption. Maximum liability is limited to the amount paid by you or ₹0/$0, whichever is greater."
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                                    lineNumber: 90,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 88,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "9. User Responsibility & Indemnification"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 93,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "You are solely responsible for how you use the Service and its outputs. You agree to indemnify and hold harmless the Service operator from any claims arising from your use."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 94,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "10. Prohibited Activities"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 98,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "Strictly prohibited: Unauthorized access, hacking, data abuse, privacy violations, intellectual property abuse (copying/scraping), and illegal/harmful use."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 99,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "11. Monitoring & Enforcement"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 103,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "We reserve the right to monitor usage, investigate violations, and suspend/terminate accounts without notice."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 104,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "12. Legal Consequences"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 108,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "Any attempt to hack or exploit the Service is a serious violation. We reserve the right to pursue legal action and seek financial damages."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 109,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "13. suspension & Termination"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 113,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "We reserve the right to suspend or terminate accounts, reset data, or discontinue the Service at any time without notice."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 114,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-white font-bold mb-2",
                            children: "17. Governing Law"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 118,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-4",
                            children: "Terms governed by the laws of India. Jurisdiction: Courts of Telangana, INDIA."
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 119,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-white/30 pt-4 border-t border-white/10",
                            children: "Contact: Founder@struktai.co.in"
                        }, void 0, false, {
                            fileName: "[project]/app/components/layout/TermsModal.tsx",
                            lineNumber: 123,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                    lineNumber: 37,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-t border-white/5 bg-white/5 flex justify-end",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors",
                        children: "I Understand"
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/TermsModal.tsx",
                        lineNumber: 131,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/layout/TermsModal.tsx",
                    lineNumber: 130,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/layout/TermsModal.tsx",
            lineNumber: 15,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/layout/TermsModal.tsx",
        lineNumber: 14,
        columnNumber: 9
    }, this);
}
_c = TermsModal;
var _c;
__turbopack_context__.k.register(_c, "TermsModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/layout/WelcomeScreen.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WelcomeScreen",
    ()=>WelcomeScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-2.js [app-client] (ecmascript) <export default as MousePointer2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wand-sparkles.js [app-client] (ecmascript) <export default as Wand2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$oauth$2f$google$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-oauth/google/dist/index.esm.js [app-client] (ecmascript)"); // Import GoogleLogin
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jwt-decode/build/esm/index.js [app-client] (ecmascript)"); // Import decoder
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)"); // Import Store
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$TermsModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/TermsModal.tsx [app-client] (ecmascript)"); // Import Modal
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function WelcomeScreen({ onStart }) {
    _s();
    const [isExiting, setIsExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [termsAccepted, setTermsAccepted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false) // T&C State
    ;
    const [showTerms, setShowTerms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false) // Modal State
    ;
    const { setToken, setUser, setProjectsModalOpen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const handleStart = ()=>{
        setIsExiting(true);
        setTimeout(onStart, 500); // Wait for exit animation
    };
    const handleGoogleSuccess = (credentialResponse)=>{
        if (!termsAccepted) {
            alert("Please accept the Terms and Conditions to proceed.");
            return;
        }
        if (credentialResponse.credential) {
            const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jwtDecode"])(credentialResponse.credential);
            setToken(credentialResponse.credential);
            setUser({
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture
            });
            // Open Projects Modal immediately
            setProjectsModalOpen(true);
            handleStart();
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center overflow-hidden transition-opacity duration-500", isExiting ? "opacity-0 pointer-events-none" : "opacity-100"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-500/10 blur-[120px] rounded-full animate-pulse opacity-50"
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 53,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[100px] rounded-full opacity-50"
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 54,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 55,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                lineNumber: 52,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 max-w-4xl w-full px-6 flex flex-col items-center text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono tracking-widest uppercase backdrop-blur-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                    className: "w-3 h-3 text-purple-400"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                    lineNumber: 63,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Strukt AI BETA"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                    lineNumber: 64,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                            lineNumber: 62,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 61,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200",
                        children: [
                            "Transform 2D Plans into ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                lineNumber: 70,
                                columnNumber: 45
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400",
                                children: "Editable 3D Spaces"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                lineNumber: 71,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 69,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg text-white/50 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 leading-relaxed",
                        children: "The world's first AI-powered platform for interior designers. Calculate costs, apply materials, and visualize in seconds."
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 76,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400",
                        children: [
                            {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__["MousePointer2"],
                                title: "Texturize",
                                desc: "Access our library of real-world brochures. Apply authentic laminates and deliver exactly what you specify."
                            },
                            {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"],
                                title: "Floorplan to 3D",
                                desc: "Convert any floorplan into 3D instantly. Export fully editable models directly to Blender."
                            },
                            {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"],
                                title: "Furn AI",
                                desc: "Turn any furniture reference image to 3D"
                            }
                        ].map((feature, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-left flex flex-col gap-3 group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 w-fit rounded-lg bg-white/5 text-white/80 group-hover:text-white transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(feature.icon, {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                            lineNumber: 89,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                        lineNumber: 88,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-white/90",
                                                children: feature.title
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                lineNumber: 92,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-white/40",
                                                children: feature.desc
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                lineNumber: 93,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                        lineNumber: 91,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                lineNumber: 87,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 81,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-2 bg-black/40 px-3 py-2 rounded-lg border border-white/5 backdrop-blur-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        id: "terms",
                                        checked: termsAccepted,
                                        onChange: (e)=>setTermsAccepted(e.target.checked),
                                        className: "w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50 cursor-pointer accent-purple-500"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                        lineNumber: 104,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "terms",
                                        className: "text-[11px] text-white/60 cursor-pointer select-none",
                                        children: [
                                            "I agree to the ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                onClick: (e)=>{
                                                    e.preventDefault();
                                                    setShowTerms(true);
                                                },
                                                className: "text-white underline decoration-white/30 hover:decoration-white hover:text-purple-300 transition-colors",
                                                children: "Terms & Conditions"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                lineNumber: 112,
                                                columnNumber: 44
                                            }, this),
                                            " regarding data privacy."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                        lineNumber: 111,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                lineNumber: 103,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("transition-opacity duration-300 flex flex-col items-center gap-4", !termsAccepted && "opacity-50 grayscale pointer-events-none"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleStart,
                                        disabled: !termsAccepted,
                                        className: "group relative px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-medium transition-all duration-300 overflow-hidden disabled:cursor-not-allowed",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                lineNumber: 122,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "relative flex items-center gap-3",
                                                children: [
                                                    "Enter Studio (Guest)",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                        className: "w-4 h-4 group-hover:translate-x-1 transition-transform"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                        lineNumber: 125,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                lineNumber: 123,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                        lineNumber: 117,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white/30 text-xs uppercase tracking-widest",
                                                children: "or sign in to save projects"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                lineNumber: 130,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "scale-110",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$oauth$2f$google$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleLogin"], {
                                                    onSuccess: handleGoogleSuccess,
                                                    onError: ()=>console.log('Login Failed'),
                                                    theme: "filled_black",
                                                    shape: "pill",
                                                    text: "signin_with"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                                lineNumber: 131,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                        lineNumber: 129,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                lineNumber: 116,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 100,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-16 text-white/20 text-xs animate-in fade-in duration-1000 delay-700",
                        children: [
                            "Press ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                className: "font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/40",
                                children: "Space"
                            }, void 0, false, {
                                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                                lineNumber: 145,
                                columnNumber: 27
                            }, this),
                            " or Click to Start"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                        lineNumber: 144,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                lineNumber: 58,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$TermsModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TermsModal"], {
                isOpen: showTerms,
                onClose: ()=>setShowTerms(false)
            }, void 0, false, {
                fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
                lineNumber: 150,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/layout/WelcomeScreen.tsx",
        lineNumber: 47,
        columnNumber: 9
    }, this);
}
_s(WelcomeScreen, "XKA0OOvcWY2NDO3Z8D2X1YX94zI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = WelcomeScreen;
var _c;
__turbopack_context__.k.register(_c, "WelcomeScreen");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/TemplateGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TemplateGrid",
    ()=>TemplateGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3X3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.js [app-client] (ecmascript) <export default as Grid3X3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panels-top-left.js [app-client] (ecmascript) <export default as Layout>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis.js [app-client] (ecmascript) <export default as MoreHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function TemplateGrid() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('templates');
    const [recentProjects, setRecentProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Template definitions with categories
    const templates = [
        // Blank
        {
            id: 'blank',
            title: 'Blank Canvas',
            description: 'Start from scratch',
            category: 'Blank',
            color: 'from-gray-500 to-gray-600'
        },
        // Residential
        {
            id: 'modern',
            title: 'Modern Living',
            description: 'Contemporary open floor plan',
            category: 'Residential',
            color: 'from-blue-500 to-blue-600'
        },
        {
            id: 'contemporary',
            title: 'Contemporary Home',
            description: 'Clean lines and natural light',
            category: 'Residential',
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            id: 'minimalist',
            title: 'Minimalist Studio',
            description: 'Simple, functional space',
            category: 'Residential',
            color: 'from-zinc-500 to-zinc-600'
        },
        {
            id: 'loft',
            title: 'Urban Loft',
            description: 'Industrial chic style',
            category: 'Residential',
            'color': 'from-amber-500 to-orange-600'
        },
        {
            id: 'traditional',
            title: 'Traditional House',
            description: 'Classic home layout',
            category: 'Residential',
            color: 'from-rose-500 to-pink-600'
        },
        // Commercial
        {
            id: 'office',
            title: 'Office Layout',
            description: 'Professional workspace',
            category: 'Commercial',
            color: 'from-indigo-500 to-indigo-600'
        },
        {
            id: 'retail',
            title: 'Retail Store',
            description: 'Shop floor plan',
            category: 'Commercial',
            color: 'from-violet-500 to-purple-600'
        },
        {
            id: 'restaurant',
            title: 'Restaurant',
            description: 'Dining layout',
            category: 'Commercial',
            color: 'from-cyan-500 to-teal-600'
        },
        // Specialty
        {
            id: 'hotel',
            title: 'Hotel Room',
            description: 'Hospitality layout',
            category: 'Specialty',
            color: 'from-slate-500 to-slate-600'
        },
        {
            id: 'apartment',
            title: 'Apartment Complex',
            description: 'Multi-unit building',
            category: 'Specialty',
            color: 'from-teal-500 to-emerald-600'
        },
        {
            id: 'warehouse',
            title: 'Warehouse',
            description: 'Industrial space',
            category: 'Specialty',
            color: 'from-neutral-500 to-stone-600'
        }
    ];
    const categories = [
        'All',
        'Blank',
        'Residential',
        'Commercial',
        'Specialty'
    ];
    // Filter templates based on search
    const filteredTemplates = templates.filter((t)=>t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const openTemplate = (templateId)=>{
        // Navigate to home page with template parameter
        // The App component will handle showing the editor
        router.push(`/?template=${templateId}`);
    };
    const createNewProject = ()=>{
        router.push('/?template=blank');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#1A1A1A] text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "sticky top-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-white/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-6 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                            className: "w-4 h-4 text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 81,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                        lineNumber: 80,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold text-lg",
                                        children: "Strukt AI"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                        lineNumber: 83,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/TemplateGrid.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 max-w-xl mx-8",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 89,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            placeholder: "Search templates, projects...",
                                            value: searchQuery,
                                            onChange: (e)=>setSearchQuery(e.target.value),
                                            className: "w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 90,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/TemplateGrid.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "p-2 hover:bg-white/10 rounded-lg transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                            className: "w-5 h-5 text-white/60"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 103,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                        lineNumber: 102,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "p-2 hover:bg-white/10 rounded-lg transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                            className: "w-5 h-5 text-white/60"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 106,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                        lineNumber: 105,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/TemplateGrid.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/TemplateGrid.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 px-6 pb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab('templates'),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === 'templates' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3X3$3e$__["Grid3X3"], {
                                        className: "w-4 h-4 inline-block mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this),
                                    "Templates"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/TemplateGrid.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab('projects'),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === 'projects' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                        className: "w-4 h-4 inline-block mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                        lineNumber: 134,
                                        columnNumber: 13
                                    }, this),
                                    "Your Projects"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/TemplateGrid.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/TemplateGrid.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/TemplateGrid.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "p-6",
                children: activeTab === 'templates' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 mb-6 overflow-x-auto pb-2",
                            children: categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors", cat === 'All' ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20"),
                                    children: cat
                                }, cat, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 147,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/components/TemplateGrid.tsx",
                            lineNumber: 145,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: createNewProject,
                            className: "mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 166,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: "Create New Design"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 167,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/TemplateGrid.tsx",
                            lineNumber: 162,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
                            children: filteredTemplates.map((template)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>openTemplate(template.id),
                                    className: "group cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative aspect-[4/3] rounded-xl overflow-hidden mb-3", "bg-gradient-to-br", template.color),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute inset-0 flex items-center justify-center",
                                                    children: [
                                                        template.category === 'Residential' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                                            className: "w-12 h-12 text-white/30"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                                            lineNumber: 186,
                                                            columnNumber: 63
                                                        }, this),
                                                        template.category === 'Commercial' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                            className: "w-12 h-12 text-white/30"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                                            lineNumber: 187,
                                                            columnNumber: 62
                                                        }, this),
                                                        template.category === 'Specialty' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                                            className: "w-12 h-12 text-white/30"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                                            lineNumber: 188,
                                                            columnNumber: 61
                                                        }, this),
                                                        template.category === 'Blank' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"], {
                                                            className: "w-12 h-12 text-white/30"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                                            lineNumber: 189,
                                                            columnNumber: 57
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                                    lineNumber: 185,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-4 py-2 bg-white text-black rounded-full text-sm font-medium",
                                                        children: "Use Template"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                                        lineNumber: 194,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                                    lineNumber: 193,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 179,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-white group-hover:text-purple-400 transition-colors",
                                                    children: template.title
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                                    lineNumber: 202,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-white/50",
                                                    children: template.description
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                                    lineNumber: 205,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 201,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, template.id, true, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 173,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/components/TemplateGrid.tsx",
                            lineNumber: 171,
                            columnNumber: 13
                        }, this),
                        filteredTemplates.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-16",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                    className: "w-12 h-12 text-white/20 mx-auto mb-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 214,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-medium text-white/60",
                                    children: "No templates found"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 215,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-white/40",
                                    children: "Try a different search term"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 216,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/TemplateGrid.tsx",
                            lineNumber: 213,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true) : /* Projects Tab */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: createNewProject,
                            className: "mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 228,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: "Create New Project"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 229,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/TemplateGrid.tsx",
                            lineNumber: 224,
                            columnNumber: 13
                        }, this),
                        recentProjects.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
                            children: recentProjects.map((project)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>router.push(`/editor?project=${project.id}`),
                                    className: "group cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "aspect-[4/3] rounded-xl bg-white/10 mb-3 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"], {
                                                className: "w-12 h-12 text-white/30"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/TemplateGrid.tsx",
                                                lineNumber: 242,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 241,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "font-medium text-white group-hover:text-purple-400 transition-colors",
                                                            children: project.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                                            lineNumber: 246,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-white/50",
                                                            children: project.lastModified
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                                            lineNumber: 249,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                                    lineNumber: 245,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreHorizontal$3e$__["MoreHorizontal"], {
                                                        className: "w-4 h-4 text-white/60"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                                    lineNumber: 251,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 244,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, project.id, true, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 236,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/components/TemplateGrid.tsx",
                            lineNumber: 234,
                            columnNumber: 15
                        }, this) : /* Empty State for Projects */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                        className: "w-10 h-10 text-white/30"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/TemplateGrid.tsx",
                                        lineNumber: 262,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 261,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-medium text-white mb-2",
                                    children: "No projects yet"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 264,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-white/50 mb-6",
                                    children: "Create your first design to get started"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 265,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: createNewProject,
                                    className: "inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 270,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            children: "Create Your First Design"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 271,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/TemplateGrid.tsx",
                                            lineNumber: 272,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/TemplateGrid.tsx",
                                    lineNumber: 266,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/TemplateGrid.tsx",
                            lineNumber: 260,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/TemplateGrid.tsx",
                    lineNumber: 222,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/TemplateGrid.tsx",
                lineNumber: 141,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/TemplateGrid.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(TemplateGrid, "4WIowg5pRtTR6d3/7l8KBi21ziw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = TemplateGrid;
var _c;
__turbopack_context__.k.register(_c, "TemplateGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/App.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$Topbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/Topbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$RightSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/RightSidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FloatingUpgradeCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/FloatingUpgradeCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$PremiumModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/PremiumModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FurnAIProcessingModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/FurnAIProcessingModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FurnAIQueueModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/FurnAIQueueModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$GlobalToast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/GlobalToast.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$WelcomeScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/layout/WelcomeScreen.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$TemplateGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/TemplateGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
;
;
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const Scene = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/app/components/editor/Scene.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>mod.Scene), {
    loadableGenerated: {
        modules: [
            "[project]/app/components/editor/Scene.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = Scene;
const RenderGallery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/app/components/editor/RenderGallery.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>mod.RenderGallery), {
    loadableGenerated: {
        modules: [
            "[project]/app/components/editor/RenderGallery.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c1 = RenderGallery;
;
;
;
;
;
;
;
;
;
function App() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const template = searchParams.get('template');
    const { showProcessingModal, setShowProcessingModal, showQueueModal, setShowQueueModal } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const [showPremiumModal, setShowPremiumModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showUpgradeCard, setShowUpgradeCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showWelcome, setShowWelcome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showTemplateGrid, setShowTemplateGrid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Use useMemo to determine the current view - if template is in URL, go directly to editor
    const currentView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "App.useMemo[currentView]": ()=>{
            if (template) return 'editor';
            return null;
        }
    }["App.useMemo[currentView]"], [
        template
    ]);
    // After welcome screen, show template grid (home screen)
    const handleWelcomeComplete = ()=>{
        setShowWelcome(false);
        setShowTemplateGrid(true);
    };
    // When user selects a template from template grid
    const handleTemplateSelect = ()=>{
        setShowTemplateGrid(false);
    };
    // Logout - go back to welcome
    const handleLogout = ()=>{
        setShowWelcome(true);
        setShowTemplateGrid(false);
    };
    // If template is in URL, skip welcome/template grid and show editor directly
    if (currentView === 'editor') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$PremiumModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PremiumModal"], {
                    isOpen: showPremiumModal,
                    onClose: ()=>setShowPremiumModal(false)
                }, void 0, false, {
                    fileName: "[project]/app/components/App.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$GlobalToast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GlobalToast"], {}, void 0, false, {
                    fileName: "[project]/app/components/App.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$Topbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Topbar"], {}, void 0, false, {
                    fileName: "[project]/app/components/App.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-1 overflow-hidden relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sidebar"], {
                            onLogout: handleLogout
                        }, void 0, false, {
                            fileName: "[project]/app/components/App.tsx",
                            lineNumber: 68,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Scene, {}, void 0, false, {
                            fileName: "[project]/app/components/App.tsx",
                            lineNumber: 69,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$RightSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RightSidebar"], {}, void 0, false, {
                            fileName: "[project]/app/components/App.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        showUpgradeCard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FloatingUpgradeCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloatingUpgradeCard"], {
                            onUpgrade: ()=>setShowPremiumModal(true),
                            onClose: ()=>setShowUpgradeCard(false)
                        }, void 0, false, {
                            fileName: "[project]/app/components/App.tsx",
                            lineNumber: 72,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/App.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RenderGallery, {}, void 0, false, {
                    fileName: "[project]/app/components/App.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FurnAIProcessingModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FurnAIProcessingModal"], {
                    isOpen: showProcessingModal
                }, void 0, false, {
                    fileName: "[project]/app/components/App.tsx",
                    lineNumber: 79,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FurnAIQueueModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FurnAIQueueModal"], {
                    isOpen: showQueueModal,
                    onClose: ()=>setShowQueueModal(false)
                }, void 0, false, {
                    fileName: "[project]/app/components/App.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/App.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative",
        children: [
            showWelcome && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$WelcomeScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WelcomeScreen"], {
                onStart: handleWelcomeComplete
            }, void 0, false, {
                fileName: "[project]/app/components/App.tsx",
                lineNumber: 88,
                columnNumber: 23
            }, this),
            showTemplateGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$TemplateGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TemplateGrid"], {}, void 0, false, {
                fileName: "[project]/app/components/App.tsx",
                lineNumber: 91,
                columnNumber: 28
            }, this),
            !showWelcome && !showTemplateGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$PremiumModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PremiumModal"], {
                        isOpen: showPremiumModal,
                        onClose: ()=>setShowPremiumModal(false)
                    }, void 0, false, {
                        fileName: "[project]/app/components/App.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$GlobalToast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GlobalToast"], {}, void 0, false, {
                        fileName: "[project]/app/components/App.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$Topbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Topbar"], {}, void 0, false, {
                        fileName: "[project]/app/components/App.tsx",
                        lineNumber: 98,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-1 overflow-hidden relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sidebar"], {
                                onLogout: handleLogout
                            }, void 0, false, {
                                fileName: "[project]/app/components/App.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Scene, {}, void 0, false, {
                                fileName: "[project]/app/components/App.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$RightSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RightSidebar"], {}, void 0, false, {
                                fileName: "[project]/app/components/App.tsx",
                                lineNumber: 102,
                                columnNumber: 13
                            }, this),
                            showUpgradeCard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FloatingUpgradeCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloatingUpgradeCard"], {
                                onUpgrade: ()=>setShowPremiumModal(true),
                                onClose: ()=>setShowUpgradeCard(false)
                            }, void 0, false, {
                                fileName: "[project]/app/components/App.tsx",
                                lineNumber: 104,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/App.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RenderGallery, {}, void 0, false, {
                        fileName: "[project]/app/components/App.tsx",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FurnAIProcessingModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FurnAIProcessingModal"], {
                isOpen: showProcessingModal
            }, void 0, false, {
                fileName: "[project]/app/components/App.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$layout$2f$FurnAIQueueModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FurnAIQueueModal"], {
                isOpen: showQueueModal,
                onClose: ()=>setShowQueueModal(false)
            }, void 0, false, {
                fileName: "[project]/app/components/App.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/App.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
_s(App, "0H6gKd4jnEr9wgPlTc2CbkqgLDY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c2 = App;
const __TURBOPACK__default__export__ = App;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Scene");
__turbopack_context__.k.register(_c1, "RenderGallery");
__turbopack_context__.k.register(_c2, "App");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/App.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/components/App.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=app_6e20ce31._.js.map