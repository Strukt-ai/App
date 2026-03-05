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
"[project]/app/components/editor/WallManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WallManager",
    ()=>WallManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export G as useLoader>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII=';
// Static Geometries to prevent memory leaks/GC thrashing during rapid updates
const wallGeometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoxGeometry"](1, 1, 1);
const selectionGeometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoxGeometry"](1.002, 1.002, 1.002);
// Rounded, disc-like handles for a cleaner look (end handles slightly larger)
const endHandleGeometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.24, 0.24, 0.16, 24);
const sideHandleGeometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.2, 0.2, 0.14, 20);
// Static Materials - Using StandardMaterial for realistic lighting
// Walls respond to scene lighting for proper 3D appearance
const regularMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
    color: 0xf2f2f0,
    roughness: 0.98,
    metalness: 0.0
});
const selectedMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
    color: 0x3b82f6,
    roughness: 0.6,
    metalness: 0.1,
    emissive: 0x1a365d,
    emissiveIntensity: 0.2
});
const wireframeMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
    color: 0xffffff,
    wireframe: true
});
// Canva-like handles: light, slightly glowing discs with soft material
const handleMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.05,
    emissive: 0x7dd3fc,
    emissiveIntensity: 0.35
});
const sideHandleMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
    color: 0x38bdf8,
    roughness: 0.3,
    metalness: 0.08,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.25
});
// Helper to check if a point projects onto a line segment
function projectPointOntoLine(p, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return 0 // Degenerate line
    ;
    const t = ((p.x - start.x) * dx + (p.y - start.y) * dy) / len2;
    return t // Unclamped for better detection logic
    ;
}
const WallItem = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(_s(function WallItem({ wall, isSelected, is2D, furniture, onPointerDown, onWheel, onSideHandleDown }) {
    _s();
    // Calculate geometry basics
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const centerX = (wall.start.x + wall.end.x) / 2;
    const centerY = (wall.start.y + wall.end.y) / 2;
    const textureUrl = wall.textureDataUrl;
    const texture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureLoader"], textureUrl || _EMPTY_TEX_DATA_URL);
    const wallLen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WallItem.WallItem.useMemo[wallLen]": ()=>Math.max(0.0001, length)
    }["WallItem.WallItem.useMemo[wallLen]"], [
        length
    ]);
    const wallH = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WallItem.WallItem.useMemo[wallH]": ()=>Math.max(0.0001, wall.height || 2.5)
    }["WallItem.WallItem.useMemo[wallH]"], [
        wall.height
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WallItem.WallItem.useEffect": ()=>{
            if (!textureUrl) return;
            const tw = Number(wall.textureTileWidthM || 0);
            const th = Number(wall.textureTileHeightM || 0);
            if (!(tw > 0) || !(th > 0)) return;
            texture.wrapS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RepeatWrapping"];
            texture.wrapT = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RepeatWrapping"];
            // Map U along wall length, V along wall height
            texture.repeat.set(wallLen / tw, wallH / th);
            texture.needsUpdate = true;
        }
    }["WallItem.WallItem.useEffect"], [
        textureUrl,
        wall.textureTileWidthM,
        wall.textureTileHeightM,
        wallLen,
        wallH,
        texture
    ]);
    // Detect openings (Windows/Doors) that intersect this wall
    // 1. Filter furniture that is strictly ON the wall or very close.
    // 2. Sort them by position along the wall.
    // 3. Generate wall segments around them.
    // Using simple distance threshold to associate window with wall
    const openings = furniture.filter((f)=>{
        if (f.type !== 'window' && f.type !== 'door') return false;
        // Check distance to wall line
        // Line equation: Ax + By + C = 0
        // A = -dy, B = dx, C = dy*start.x - dx*start.y
        const A = -dy;
        const B = dx;
        const C = dy * wall.start.x - dx * wall.start.y;
        const dist = Math.abs(A * f.position.x + B * f.position.z + C) / Math.sqrt(A * A + B * B);
        // Also check if it projects ONTO the segment (t between 0 and 1)
        const t = projectPointOntoLine({
            x: f.position.x,
            y: f.position.z
        }, wall.start, wall.end);
        // Threshold: 0.5m dist. t check relaxed to -0.1 to 1.1 to catch corner windows.
        return dist < 0.5 && t > -0.1 && t < 1.1;
    }).map((f)=>{
        // Calculate 't' (0 to 1) position along the wall
        const t = projectPointOntoLine({
            x: f.position.x,
            y: f.position.z
        }, wall.start, wall.end);
        // Calculate width in 't' units
        // f.dimensions.width is in meters. wall length is in meters.
        // widthT = (width / length)
        const widthT = f.dimensions.width / length;
        // Default height logic if missing/zero to prevents solid walls
        const height = f.dimensions.height || (f.type === 'door' ? 2.1 : 1.2);
        const yBottom = f.position.y || 0;
        return {
            id: f.id,
            tCenter: t,
            tStart: Math.max(0, t - widthT / 2),
            tEnd: Math.min(1, t + widthT / 2),
            yBottom: yBottom,
            height: height,
            type: f.type
        };
    }).sort((a, b)=>a.tStart - b.tStart);
    // DEBUG: If NO openings or 2D mode, render simple block
    if (is2D || openings.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    name: "Wall",
                    position: [
                        centerX,
                        wall.height / 2,
                        centerY
                    ],
                    rotation: [
                        0,
                        -angle,
                        0
                    ],
                    scale: [
                        Math.max(length, 0.01),
                        wall.height,
                        wall.thickness
                    ],
                    onPointerDown: (e)=>onPointerDown(e, wall.id, 'body'),
                    onWheel: (e)=>onWheel(e, wall.id),
                    geometry: wallGeometry,
                    castShadow: true,
                    receiveShadow: true,
                    children: [
                        textureUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                            map: texture,
                            color: isSelected ? 0x3b82f6 : 0xffffff,
                            roughness: 0.98,
                            metalness: 0.0
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/WallManager.tsx",
                            lineNumber: 168,
                            columnNumber: 25
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                            color: isSelected ? 0x3b82f6 : wall.color || 0xffffff,
                            roughness: isSelected ? 0.6 : 1.0,
                            metalness: isSelected ? 0.1 : 0.0,
                            emissive: isSelected ? 0x1a365d : 0x000000,
                            emissiveIntensity: isSelected ? 0.2 : 0
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/WallManager.tsx",
                            lineNumber: 175,
                            columnNumber: 25
                        }, this),
                        isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            geometry: selectionGeometry,
                            material: wireframeMaterial
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/WallManager.tsx",
                            lineNumber: 184,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/editor/WallManager.tsx",
                    lineNumber: 156,
                    columnNumber: 17
                }, this),
                is2D && isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            position: [
                                wall.start.x,
                                2.7,
                                wall.start.y
                            ],
                            rotation: [
                                -Math.PI / 2,
                                0,
                                0
                            ],
                            onPointerDown: (e)=>onPointerDown(e, wall.id, 'start'),
                            geometry: endHandleGeometry,
                            material: handleMaterial
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/WallManager.tsx",
                            lineNumber: 190,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            position: [
                                wall.end.x,
                                2.7,
                                wall.end.y
                            ],
                            rotation: [
                                -Math.PI / 2,
                                0,
                                0
                            ],
                            onPointerDown: (e)=>onPointerDown(e, wall.id, 'end'),
                            geometry: endHandleGeometry,
                            material: handleMaterial
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/WallManager.tsx",
                            lineNumber: 191,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/editor/WallManager.tsx",
            lineNumber: 155,
            columnNumber: 13
        }, this);
    }
    // 3D MODE WITH CUTOUTS
    // console.log(`[WallManager] Rendering Multi-Segment Wall ${wall.id} with ${openings.length} openings`)
    // We construct segments.
    // Start at t=0. Iterate openings.
    // 1. Solid segment from currentT to opening.tStart
    // 2. Header segment (above opening) from opening.tStart to opening.tEnd
    // 3. Sill segment (below opening) from opening.tStart to opening.tEnd
    // 4. Update currentT = opening.tEnd
    // 5. Final solid segment from currentT to 1.0
    const segments = [];
    // 1. Calculate Unified Holes (Boolean Union of all openings)
    // Sort by start time (already sorted above)
    const unifiedHoles = [];
    if (openings.length > 0) {
        let currentHole = {
            start: openings[0].tStart,
            end: openings[0].tEnd
        };
        for(let i = 1; i < openings.length; i++){
            const op = openings[i];
            if (op.tStart < currentHole.end) {
                // Overlap: Merge
                currentHole.end = Math.max(currentHole.end, op.tEnd);
            } else {
                // No overlap: Push current, start new
                unifiedHoles.push(currentHole);
                currentHole = {
                    start: op.tStart,
                    end: op.tEnd
                };
            }
        }
        unifiedHoles.push(currentHole);
    }
    // 2. Invert Holes to find Solid Wall Segments
    // solidIntervals = [0, 1] - unifiedHoles
    let currentT = 0;
    unifiedHoles.forEach((hole)=>{
        // Solid wall before this hole
        if (hole.start > currentT) {
            const segStart = currentT;
            const segEnd = hole.start;
            const segLen = (segEnd - segStart) * length;
            if (segLen > 0.01) {
                const segCenterT = (segStart + segEnd) / 2;
                const lx = wall.start.x + dx * segCenterT;
                const ly = wall.start.y + dy * segCenterT;
                // console.log(`[WallManager] SOLID: ${segStart.toFixed(3)} -> ${segEnd.toFixed(3)} (T)`)
                segments.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    position: [
                        lx,
                        wall.height / 2,
                        ly
                    ],
                    rotation: [
                        0,
                        -angle,
                        0
                    ],
                    scale: [
                        segLen,
                        wall.height,
                        wall.thickness
                    ],
                    geometry: wallGeometry,
                    material: isSelected ? selectedMaterial : regularMaterial,
                    castShadow: true,
                    receiveShadow: true,
                    onPointerDown: (e)=>onPointerDown(e, wall.id, 'body')
                }, `solid-${segStart.toFixed(3)}-${hole.end.toFixed(3)}-${Math.random().toString(36).substr(2, 5)}`, false, {
                    fileName: "[project]/app/components/editor/WallManager.tsx",
                    lineNumber: 248,
                    columnNumber: 21
                }, this));
            }
        }
        currentT = Math.max(currentT, hole.end);
    });
    // Final Solid Segment (after last hole)
    if (currentT < 1) {
        const segLen = (1 - currentT) * length;
        if (segLen > 0.01) {
            const segCenterT = (currentT + 1) / 2;
            const lx = wall.start.x + dx * segCenterT;
            const ly = wall.start.y + dy * segCenterT;
            segments.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    lx,
                    wall.height / 2,
                    ly
                ],
                rotation: [
                    0,
                    -angle,
                    0
                ],
                scale: [
                    segLen,
                    wall.height,
                    wall.thickness
                ],
                geometry: wallGeometry,
                material: isSelected ? selectedMaterial : regularMaterial,
                castShadow: true,
                receiveShadow: true,
                onPointerDown: (e)=>onPointerDown(e, wall.id, 'body')
            }, `solid-end-${currentT.toFixed(3)}-${Math.random().toString(36).substr(2, 5)}`, false, {
                fileName: "[project]/app/components/editor/WallManager.tsx",
                lineNumber: 273,
                columnNumber: 17
            }, this));
        }
    }
    // 3. Render Headers and Sills for ALL openings (independent of solids)
    openings.forEach((op)=>{
        const opLen = (op.tEnd - op.tStart) * length;
        const opCenterT = (op.tStart + op.tEnd) / 2;
        const lx = wall.start.x + dx * opCenterT;
        const ly = wall.start.y + dy * opCenterT;
        // Header (Above opening)
        const headerH = wall.height - (op.yBottom + op.height);
        if (headerH > 0.01) {
            segments.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    lx,
                    op.yBottom + op.height + headerH / 2,
                    ly
                ],
                rotation: [
                    0,
                    -angle,
                    0
                ],
                scale: [
                    opLen,
                    headerH,
                    wall.thickness
                ],
                geometry: wallGeometry,
                material: isSelected ? selectedMaterial : regularMaterial,
                castShadow: true,
                receiveShadow: true,
                onPointerDown: (e)=>onPointerDown(e, wall.id, 'body')
            }, `header-${op.id}`, false, {
                fileName: "[project]/app/components/editor/WallManager.tsx",
                lineNumber: 298,
                columnNumber: 17
            }, this));
        }
        // Sill (Below opening)
        const sillH = op.yBottom;
        if (sillH > 0.01) {
            segments.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    lx,
                    sillH / 2,
                    ly
                ],
                rotation: [
                    0,
                    -angle,
                    0
                ],
                scale: [
                    opLen,
                    sillH,
                    wall.thickness
                ],
                geometry: wallGeometry,
                material: isSelected ? selectedMaterial : regularMaterial,
                castShadow: true,
                receiveShadow: true,
                onPointerDown: (e)=>onPointerDown(e, wall.id, 'body')
            }, `sill-${op.id}`, false, {
                fileName: "[project]/app/components/editor/WallManager.tsx",
                lineNumber: 315,
                columnNumber: 17
            }, this));
        }
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: segments
    }, void 0, false, {
        fileName: "[project]/app/components/editor/WallManager.tsx",
        lineNumber: 330,
        columnNumber: 9
    }, this);
}, "HHUjjOQHgxRJKzi3+/CILzzFSoE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"]
    ];
}));
_c = WallItem;
function WallManager() {
    _s1();
    const walls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "WallManager.useFloorplanStore[walls]": (s)=>s.walls
    }["WallManager.useFloorplanStore[walls]"]);
    const furniture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "WallManager.useFloorplanStore[furniture]": (s)=>s.furniture
    }["WallManager.useFloorplanStore[furniture]"]) // Fetch furniture
    ;
    const selectedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "WallManager.useFloorplanStore[selectedId]": (s)=>s.selectedId
    }["WallManager.useFloorplanStore[selectedId]"]);
    const selectObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "WallManager.useFloorplanStore[selectObject]": (s)=>s.selectObject
    }["WallManager.useFloorplanStore[selectObject]"]);
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "WallManager.useFloorplanStore[mode]": (s)=>s.mode
    }["WallManager.useFloorplanStore[mode]"]);
    const activeTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "WallManager.useFloorplanStore[activeTool]": (s)=>s.activeTool
    }["WallManager.useFloorplanStore[activeTool]"]);
    const startInteraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "WallManager.useFloorplanStore[startInteraction]": (s)=>s.startInteraction
    }["WallManager.useFloorplanStore[startInteraction]"]);
    const updateWall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "WallManager.useFloorplanStore[updateWall]": (s)=>s.updateWall
    }["WallManager.useFloorplanStore[updateWall]"]);
    const handlePointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WallManager.useCallback[handlePointerDown]": (e, id, type)=>{
            if (mode !== '2d') return;
            if (e.button !== 0) return;
            e.stopPropagation();
            // Use startTransition to prevent blocking UI (circle cursor)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startTransition"])({
                "WallManager.useCallback[handlePointerDown]": ()=>{
                    selectObject(id);
                    // Handle based on active tool
                    if (activeTool === 'resize' || type !== 'body') {
                        // Resize tool or clicking on handles
                        startInteraction('resizing', id, {
                            x: e.point.x,
                            y: e.point.z
                        }, type === 'body' ? 'end' : type);
                    } else if (activeTool === 'rotate') {
                        // User prefers move instead of rotate; treat rotate tool like move/drag
                        startInteraction('dragging', id, {
                            x: e.point.x,
                            y: e.point.z
                        });
                    } else if (activeTool === 'label') {
                        // Just select; label editing happens in the floating menu UI
                        selectObject(id);
                    } else {
                        // Default: move/drag
                        startInteraction('dragging', id, {
                            x: e.point.x,
                            y: e.point.z
                        });
                    }
                }
            }["WallManager.useCallback[handlePointerDown]"]);
        }
    }["WallManager.useCallback[handlePointerDown]"], [
        mode,
        activeTool,
        selectObject,
        startInteraction,
        walls,
        updateWall
    ]);
    const handleSideHandleDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WallManager.useCallback[handleSideHandleDown]": (e, id)=>{
            if (mode !== '2d') return;
            if (e.button !== 0) return;
            e.stopPropagation();
            selectObject(id);
            startInteraction('resizing', id, {
                x: e.point.x,
                y: e.point.z
            }, 'thickness');
        }
    }["WallManager.useCallback[handleSideHandleDown]"], [
        mode,
        selectObject,
        startInteraction
    ]);
    const handleWheel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WallManager.useCallback[handleWheel]": (e, id)=>{
            if (mode !== '2d' || activeTool !== 'resize') return;
            e.stopPropagation();
            e.preventDefault();
            // const wall = walls.find(w => w.id === id) // Removed to avoid dependency on walls list inside callback heavily
            // Actually we need the wall object. But since we are memoizing, it is better to pass update function logic.
            // Let's rely on finding it in the store actions or parent.
            // For now, finding in 'walls' is fine if walls updates trigger re-render anyway.
            const wall = walls.find({
                "WallManager.useCallback[handleWheel].wall": (w)=>w.id === id
            }["WallManager.useCallback[handleWheel].wall"]);
            if (!wall) return;
            const delta = -e.deltaY * 0.0015 // scroll up to decrease, down to increase
            ;
            const next = Math.min(2, Math.max(0.05, wall.thickness + delta));
            if (next !== wall.thickness) {
                updateWall(id, {
                    thickness: next
                });
            }
        }
    }["WallManager.useCallback[handleWheel]"], [
        mode,
        activeTool,
        walls,
        updateWall
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: walls.map((wall)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WallItem, {
                wall: wall,
                isSelected: selectedId === wall.id,
                is2D: mode === '2d',
                furniture: furniture,
                onPointerDown: handlePointerDown,
                onWheel: handleWheel,
                onSideHandleDown: handleSideHandleDown
            }, wall.id, false, {
                fileName: "[project]/app/components/editor/WallManager.tsx",
                lineNumber: 401,
                columnNumber: 17
            }, this))
    }, void 0, false, {
        fileName: "[project]/app/components/editor/WallManager.tsx",
        lineNumber: 399,
        columnNumber: 9
    }, this);
}
_s1(WallManager, "sjNZtQW7ZOeI374R/Fq1XQodJpw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c1 = WallManager;
var _c, _c1;
__turbopack_context__.k.register(_c, "WallItem");
__turbopack_context__.k.register(_c1, "WallManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/items/Door3D.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Door3D",
    ()=>Door3D
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function Door3D({ width, height, depth, isSelected }) {
    _s();
    const frameThickness = 0.1;
    const frameDepth = depth;
    const doorThickness = 0.05;
    // Materials
    const frameMaterial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Door3D.useMemo[frameMaterial]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: '#5D4037',
                roughness: 0.3,
                metalness: 0.05
            })
    }["Door3D.useMemo[frameMaterial]"], []);
    const doorMaterial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Door3D.useMemo[doorMaterial]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: isSelected ? '#3b82f6' : '#8B4513',
                roughness: 0.6,
                metalness: 0.1
            })
    }["Door3D.useMemo[doorMaterial]"], [
        isSelected
    ]);
    const handleMaterial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Door3D.useMemo[handleMaterial]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: '#cccccc',
                roughness: 0.1,
                metalness: 0.9
            })
    }["Door3D.useMemo[handleMaterial]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    0,
                    height - frameThickness / 2,
                    0
                ],
                material: frameMaterial,
                castShadow: true,
                receiveShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        width,
                        frameThickness,
                        frameDepth
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Door3D.tsx",
                    lineNumber: 41,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Door3D.tsx",
                lineNumber: 40,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    -width / 2 + frameThickness / 2,
                    height / 2,
                    0
                ],
                material: frameMaterial,
                castShadow: true,
                receiveShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        frameThickness,
                        height,
                        frameDepth
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Door3D.tsx",
                    lineNumber: 45,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Door3D.tsx",
                lineNumber: 44,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    width / 2 - frameThickness / 2,
                    height / 2,
                    0
                ],
                material: frameMaterial,
                castShadow: true,
                receiveShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        frameThickness,
                        height,
                        frameDepth
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Door3D.tsx",
                    lineNumber: 49,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Door3D.tsx",
                lineNumber: 48,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    0,
                    height / 2,
                    0
                ],
                material: doorMaterial,
                castShadow: true,
                receiveShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        width - frameThickness * 2,
                        height - frameThickness,
                        doorThickness
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Door3D.tsx",
                    lineNumber: 59,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Door3D.tsx",
                lineNumber: 53,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                position: [
                    width / 2 - 0.2,
                    height / 2,
                    doorThickness / 2 + 0.02
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        rotation: [
                            Math.PI / 2,
                            0,
                            0
                        ],
                        material: handleMaterial,
                        castShadow: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                            args: [
                                0.01,
                                0.01,
                                0.05
                            ]
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/items/Door3D.tsx",
                            lineNumber: 65,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/items/Door3D.tsx",
                        lineNumber: 64,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            -0.06,
                            0,
                            0.03
                        ],
                        rotation: [
                            0,
                            0,
                            Math.PI / 2
                        ],
                        material: handleMaterial,
                        castShadow: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                            args: [
                                0.01,
                                0.01,
                                0.12
                            ]
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/items/Door3D.tsx",
                            lineNumber: 68,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/items/Door3D.tsx",
                        lineNumber: 67,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/items/Door3D.tsx",
                lineNumber: 63,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/items/Door3D.tsx",
        lineNumber: 38,
        columnNumber: 9
    }, this);
}
_s(Door3D, "H4+06P3aAuF0ks6HNqC0dB+gAYE=");
_c = Door3D;
var _c;
__turbopack_context__.k.register(_c, "Door3D");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/items/Window3D.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Window3D",
    ()=>Window3D
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function Window3D({ width, height, depth, isSelected }) {
    _s();
    const frameThickness = 0.08;
    const frameDepth = Math.max(depth, 0.25) // Ensure it's thicker than standard 0.2 walls
    ;
    // Materials
    const upvcMaterial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Window3D.useMemo[upvcMaterial]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: isSelected ? '#3b82f6' : '#0000FF',
                roughness: 0.2,
                metalness: 0.1
            })
    }["Window3D.useMemo[upvcMaterial]"], [
        isSelected
    ]);
    const glassMaterial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Window3D.useMemo[glassMaterial]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshPhysicalMaterial"]({
                color: '#ffffff',
                metalness: 0,
                roughness: 0,
                transmission: 0.95,
                thickness: 0.05,
                envMapIntensity: 1,
                transparent: true,
                opacity: 0.3 // Fallback
            })
    }["Window3D.useMemo[glassMaterial]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    0,
                    height - frameThickness / 2,
                    0
                ],
                material: upvcMaterial,
                castShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        width,
                        frameThickness,
                        frameDepth
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Window3D.tsx",
                    lineNumber: 39,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Window3D.tsx",
                lineNumber: 38,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    0,
                    frameThickness / 2,
                    0
                ],
                material: upvcMaterial,
                castShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        width,
                        frameThickness,
                        frameDepth
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Window3D.tsx",
                    lineNumber: 43,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Window3D.tsx",
                lineNumber: 42,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    -width / 2 + frameThickness / 2,
                    height / 2,
                    0
                ],
                material: upvcMaterial,
                castShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        frameThickness,
                        height,
                        frameDepth
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Window3D.tsx",
                    lineNumber: 47,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Window3D.tsx",
                lineNumber: 46,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    width / 2 - frameThickness / 2,
                    height / 2,
                    0
                ],
                material: upvcMaterial,
                castShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        frameThickness,
                        height,
                        frameDepth
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Window3D.tsx",
                    lineNumber: 51,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Window3D.tsx",
                lineNumber: 50,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    0,
                    height / 2,
                    0
                ],
                material: upvcMaterial,
                castShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        frameThickness * 0.8,
                        height - frameThickness * 2,
                        frameDepth * 0.8
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Window3D.tsx",
                    lineNumber: 56,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Window3D.tsx",
                lineNumber: 55,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    -width / 4,
                    height / 2,
                    0
                ],
                material: glassMaterial,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        width / 2 - frameThickness * 2,
                        height - frameThickness * 2,
                        0.02
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Window3D.tsx",
                    lineNumber: 62,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Window3D.tsx",
                lineNumber: 61,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    width / 4,
                    height / 2,
                    0
                ],
                material: glassMaterial,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                    args: [
                        width / 2 - frameThickness * 2,
                        height - frameThickness * 2,
                        0.02
                    ]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/items/Window3D.tsx",
                    lineNumber: 66,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/items/Window3D.tsx",
                lineNumber: 65,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/items/Window3D.tsx",
        lineNumber: 36,
        columnNumber: 9
    }, this);
}
_s(Window3D, "2dLVc6l1TNpKh8Mm5VOWkMbDU1I=");
_c = Window3D;
var _c;
__turbopack_context__.k.register(_c, "Window3D");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/FurnitureManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FurnitureManager",
    ()=>FurnitureManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$shapes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/shapes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$items$2f$Door3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/items/Door3D.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$items$2f$Window3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/items/Window3D.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function FurnitureManager() {
    _s();
    const { furniture, selectedId, selectObject, mode, startInteraction, activeTool, updateFurniture } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const handlePointerDown = (e, id)=>{
        if (mode !== '2d') return;
        e.stopPropagation();
        selectObject(id);
        const item = furniture.find((f)=>f.id === id);
        if (!item) return;
        if (activeTool === 'rotate') {
            // Rotate 90 degrees - OR maybe just let Gizmo handle it?
            // User requested "Handles", so Gizmo is key. But clicking might still be useful as a quick 90deg turn.
            updateFurniture(id, {
                rotation: {
                    y: (item.rotation.y || 0) + Math.PI / 2
                }
            });
        } else if (activeTool === 'label') {
            // Add label (store in type temporarily)
            const label = prompt('Enter label for this item:', item.type);
            if (label !== null) {
                // We'd need an updateFurniture method, for now just log
                console.log('Label:', label);
            }
        } else if (activeTool === 'resize') {
            // Start resizing interaction
            startInteraction('resizing', id, {
                x: e.point.x,
                y: e.point.z
            });
        } else {
            // Default: move/drag
            startInteraction('dragging', id, {
                x: e.point.x,
                y: e.point.z
            });
        }
    };
    const handleResizeDown = (e, id, subType)=>{
        if (mode !== '2d') return;
        e.stopPropagation();
        // Force selection just in case
        selectObject(id);
        startInteraction('resizing', id, {
            x: e.point.x,
            y: e.point.z
        }, subType);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: furniture.map((item)=>{
            const isSelected = selectedId === item.id;
            const width = item.dimensions.width || 1;
            const depth = item.dimensions.depth || 1;
            const height = item.dimensions.height || 0.5;
            // In 2D (top-down) mode, walls have tall height and their top faces can occlude
            // doors/windows (which are slightly shorter). Render openings above wall tops
            // so they remain visible and clickable.
            const isOpening = item.type === 'door' || item.type === 'window';
            const yPos = mode === '2d' && isOpening ? 3.1 : item.position.y || 0;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                name: "Item",
                userData: {
                    id: item.id,
                    isFurniture: true,
                    type: item.type
                },
                position: [
                    item.position.x,
                    yPos,
                    item.position.z
                ],
                rotation: [
                    item.rotation.x,
                    item.rotation.y,
                    item.rotation.z
                ],
                onPointerDown: (e)=>handlePointerDown(e, item.id),
                children: [
                    item.type === 'door' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$items$2f$Door3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Door3D"], {
                        width: width,
                        height: height,
                        depth: depth,
                        isSelected: isSelected
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                        lineNumber: 74,
                        columnNumber: 29
                    }, this) : item.type === 'window' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$items$2f$Window3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Window3D"], {
                        width: width,
                        height: height,
                        depth: depth,
                        isSelected: isSelected
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                        lineNumber: 81,
                        columnNumber: 29
                    }, this) : mode === '3d' && item.modelUrl ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$shapes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                        args: [
                            width,
                            height,
                            depth
                        ],
                        position: [
                            0,
                            height / 2,
                            0
                        ],
                        castShadow: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                            color: isSelected ? "#3b82f6" : "#4a5568",
                            roughness: 0.7,
                            metalness: 0.1
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                            lineNumber: 90,
                            columnNumber: 37
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                        lineNumber: 89,
                        columnNumber: 33
                    }, this),
                    isSelected && mode === '2d' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        position: [
                            0,
                            0.02,
                            0
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                rotation: [
                                    -Math.PI / 2,
                                    0,
                                    0
                                ],
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                                        args: [
                                            width + 0.1,
                                            depth + 0.1
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 103,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                        color: "#ffffff",
                                        transparent: true,
                                        opacity: 0.2
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 104,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                lineNumber: 102,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("edgesGeometry", {
                                        args: [
                                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoxGeometry"](width + 0.05, 0.1, depth + 0.05)
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 108,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                                        color: "#3b82f6"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 109,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                lineNumber: 107,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                position: [
                                    width / 2 + 0.2,
                                    height / 2,
                                    0
                                ],
                                onClick: (e)=>handleResizeDown(e, item.id, 'resize-width'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                        args: [
                                            0.2,
                                            0.2,
                                            0.2
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 117,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                                        color: "#3b82f6",
                                        emissive: "#3b82f6",
                                        emissiveIntensity: 0.5
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 118,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                lineNumber: 113,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                position: [
                                    -width / 2 - 0.2,
                                    height / 2,
                                    0
                                ],
                                onClick: (e)=>handleResizeDown(e, item.id, 'resize-width'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                        args: [
                                            0.2,
                                            0.2,
                                            0.2
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 124,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                                        color: "#3b82f6",
                                        emissive: "#3b82f6",
                                        emissiveIntensity: 0.5
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 125,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                lineNumber: 120,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                position: [
                                    0,
                                    height / 2,
                                    depth / 2 + 0.2
                                ],
                                onClick: (e)=>handleResizeDown(e, item.id, 'resize-depth'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                        args: [
                                            0.15,
                                            0.15,
                                            0.15
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 136,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                                        color: "#38bdf8",
                                        emissive: "#38bdf8",
                                        emissiveIntensity: 0.5
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 137,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                lineNumber: 132,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                position: [
                                    0,
                                    height / 2,
                                    -depth / 2 - 0.2
                                ],
                                onClick: (e)=>handleResizeDown(e, item.id, 'resize-depth'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                        args: [
                                            0.15,
                                            0.15,
                                            0.15
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 143,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                                        color: "#38bdf8",
                                        emissive: "#38bdf8",
                                        emissiveIntensity: 0.5
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                        lineNumber: 144,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                                lineNumber: 139,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                        lineNumber: 101,
                        columnNumber: 29
                    }, this)
                ]
            }, item.id, true, {
                fileName: "[project]/app/components/editor/FurnitureManager.tsx",
                lineNumber: 65,
                columnNumber: 21
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/app/components/editor/FurnitureManager.tsx",
        lineNumber: 51,
        columnNumber: 9
    }, this);
}
_s(FurnitureManager, "BEoOW/0lDleMKAdgPmShRL/rxCE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = FurnitureManager;
var _c;
__turbopack_context__.k.register(_c, "FurnitureManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/Ground.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Ground",
    ()=>Ground
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
function Ground() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        name: "Ground",
        rotation: [
            -Math.PI / 2,
            0,
            0
        ],
        position: [
            0,
            -0.01,
            0
        ],
        receiveShadow: true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                args: [
                    100,
                    100
                ]
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Ground.tsx",
                lineNumber: 13,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                color: "#151515",
                roughness: 1,
                metalness: 0
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Ground.tsx",
                lineNumber: 14,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/Ground.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
_c = Ground;
var _c;
__turbopack_context__.k.register(_c, "Ground");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/FloorManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloorManager",
    ()=>FloorManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$Html$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/web/Html.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export G as useLoader>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII=';
// Create floor shape geometry from room polygon points
function createFloorGeometry(points) {
    if (points.length < 3) return null;
    const shape = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Shape"]();
    // Positive Y aligns with Wall Z-axis (+Y in store -> +Z in world after -90deg rotation)
    shape.moveTo(points[0].x, points[0].y);
    for(let i = 1; i < points.length; i++){
        shape.lineTo(points[i].x, points[i].y);
    }
    shape.closePath();
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShapeGeometry"](shape);
}
// Memoized room component for performance
const RoomItem = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(_s(function RoomItem({ room, selected, onSelect, onInteraction }) {
    _s();
    const geometry = createFloorGeometry(room.points);
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "RoomItem.RoomItem.useFloorplanStore[mode]": (s)=>s.mode
    }["RoomItem.RoomItem.useFloorplanStore[mode]"]);
    const textureUrl = room.textureDataUrl;
    const texture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureLoader"], textureUrl || _EMPTY_TEX_DATA_URL);
    const bounds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RoomItem.RoomItem.useMemo[bounds]": ()=>{
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const p of room.points){
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
            }
            if (minX === Infinity) return {
                w: 0,
                h: 0
            };
            return {
                w: Math.max(0.0001, maxX - minX),
                h: Math.max(0.0001, maxY - minY)
            };
        }
    }["RoomItem.RoomItem.useMemo[bounds]"], [
        room.points
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RoomItem.RoomItem.useEffect": ()=>{
            if (!textureUrl) return;
            const tw = Number(room.textureTileWidthM || 0);
            const th = Number(room.textureTileHeightM || 0);
            if (!(tw > 0) || !(th > 0)) return;
            texture.wrapS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RepeatWrapping"];
            texture.wrapT = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RepeatWrapping"];
            texture.repeat.set(bounds.w / tw, bounds.h / th);
            texture.needsUpdate = true;
        }
    }["RoomItem.RoomItem.useEffect"], [
        textureUrl,
        room.textureTileWidthM,
        room.textureTileHeightM,
        bounds.w,
        bounds.h,
        texture
    ]);
    if (!geometry) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                name: "Floor",
                rotation: [
                    -Math.PI / 2,
                    0,
                    0
                ],
                position: [
                    0,
                    0.002,
                    0
                ],
                geometry: geometry,
                onClick: (e)=>{
                    e.stopPropagation();
                    onSelect(room.id);
                },
                children: textureUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                    map: texture,
                    color: selected ? '#fbbf24' : '#ffffff',
                    roughness: 1.0,
                    metalness: 0.0,
                    transparent: true,
                    opacity: mode === '3d' ? selected ? 0.9 : 1 : selected ? 0.85 : 0.25,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/FloorManager.tsx",
                    lineNumber: 85,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                    color: selected ? '#fbbf24' : room.color,
                    roughness: 1.0,
                    metalness: 0.0,
                    transparent: true,
                    opacity: mode === '3d' ? selected ? 0.9 : 1 : selected ? 0.85 : 0.25,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/FloorManager.tsx",
                    lineNumber: 95,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/FloorManager.tsx",
                lineNumber: 74,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                rotation: [
                    -Math.PI / 2,
                    0,
                    0
                ],
                position: [
                    0,
                    0.003,
                    0
                ],
                geometry: geometry,
                visible: false,
                onPointerDown: (e)=>{
                    e.stopPropagation();
                    onInteraction(room.id, e);
                }
            }, void 0, false, {
                fileName: "[project]/app/components/editor/FloorManager.tsx",
                lineNumber: 107,
                columnNumber: 13
            }, this),
            room.name && mode === '2d' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$Html$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Html"], {
                position: [
                    room.center.x,
                    0.1,
                    room.center.y
                ],
                center: true,
                sprite: true,
                style: {
                    pointerEvents: 'none'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: selected ? 'rgba(251, 191, 36, 0.9)' : 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(4px)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        color: selected ? 'black' : 'white',
                        fontSize: '11px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        userSelect: 'none'
                    },
                    children: room.name
                }, void 0, false, {
                    fileName: "[project]/app/components/editor/FloorManager.tsx",
                    lineNumber: 127,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/FloorManager.tsx",
                lineNumber: 121,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/FloorManager.tsx",
        lineNumber: 72,
        columnNumber: 9
    }, this);
}, "ndjpZvSFxR2DGlphF8snDKNGxPE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"]
    ];
}));
_c = RoomItem;
function FloorManager() {
    _s1();
    const rooms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FloorManager.useFloorplanStore[rooms]": (s)=>s.rooms
    }["FloorManager.useFloorplanStore[rooms]"]);
    const selectedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FloorManager.useFloorplanStore[selectedId]": (s)=>s.selectedId
    }["FloorManager.useFloorplanStore[selectedId]"]);
    const activeTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FloorManager.useFloorplanStore[activeTool]": (s)=>s.activeTool
    }["FloorManager.useFloorplanStore[activeTool]"]);
    const selectObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FloorManager.useFloorplanStore[selectObject]": (s)=>s.selectObject
    }["FloorManager.useFloorplanStore[selectObject]"]);
    const startInteraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FloorManager.useFloorplanStore[startInteraction]": (s)=>s.startInteraction
    }["FloorManager.useFloorplanStore[startInteraction]"]);
    // Debug: log rooms (throttled/conditional logging better in prod, but keeping per established pattern)
    // console.log('[DEBUG FloorManager] Rooms count:', rooms.length)
    const handleInteraction = (id, e)=>{
        if (activeTool === 'move') {
            startInteraction('dragging', id, e.point);
        } else if (activeTool === 'resize') {
            startInteraction('resizing', id, e.point);
        }
    };
    // Only show in 2D mode for now - Wait, USER WANTS IT IN 3D TO!
    // if (mode !== '2d') return null
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: rooms.map((room)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RoomItem, {
                room: room,
                selected: room.id === selectedId,
                onSelect: selectObject,
                onInteraction: handleInteraction
            }, room.id, false, {
                fileName: "[project]/app/components/editor/FloorManager.tsx",
                lineNumber: 172,
                columnNumber: 17
            }, this))
    }, void 0, false, {
        fileName: "[project]/app/components/editor/FloorManager.tsx",
        lineNumber: 170,
        columnNumber: 9
    }, this);
}
_s1(FloorManager, "J/qJUOvUcRrU8lIdnpa0h4vwYXY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c1 = FloorManager;
var _c, _c1;
__turbopack_context__.k.register(_c, "RoomItem");
__turbopack_context__.k.register(_c1, "FloorManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/SelectionTransform.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SelectionTransform",
    ()=>SelectionTransform
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$TransformControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/TransformControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function SelectionTransform() {
    _s();
    const { selectedId, updateFurniture, mode: viewMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])();
    const { scene, camera, gl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    const [target, setTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [transformMode, setTransformMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('translate');
    // Find the object in the scene when selectedId changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SelectionTransform.useEffect": ()=>{
            if (!selectedId) {
                setTarget(null);
                return;
            }
            let found = null;
            scene.traverse({
                "SelectionTransform.useEffect": (obj)=>{
                    if (obj.userData && obj.userData.id === selectedId) {
                        found = obj;
                    }
                }
            }["SelectionTransform.useEffect"]);
            setTarget(found);
        }
    }["SelectionTransform.useEffect"], [
        selectedId,
        scene
    ]);
    // Keyboard shortcuts for modes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SelectionTransform.useEffect": ()=>{
            const handleKeyDown = {
                "SelectionTransform.useEffect.handleKeyDown": (e)=>{
                    if (e.key.toLowerCase() === 'r') setTransformMode('rotate');
                    if (e.key.toLowerCase() === 't') setTransformMode('translate');
                    if (e.key.toLowerCase() === 'm') setTransformMode('translate'); // M also for Move
                }
            }["SelectionTransform.useEffect.handleKeyDown"];
            window.addEventListener('keydown', handleKeyDown);
            return ({
                "SelectionTransform.useEffect": ()=>window.removeEventListener('keydown', handleKeyDown)
            })["SelectionTransform.useEffect"];
        }
    }["SelectionTransform.useEffect"], []);
    if (!target) return null;
    if (viewMode !== '2d' && viewMode !== '3d') return null // Works in both now? User said "everyhing"
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$TransformControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransformControls"], {
            object: target,
            mode: transformMode,
            space: "local",
            onChange: ()=>{
                // Sync back to store
                // We need to know WHAT we are updating. userData helps.
                if (target.userData.isFurniture) {
                    updateFurniture(target.userData.id, {
                        position: {
                            x: target.position.x,
                            y: target.position.y,
                            z: target.position.z
                        },
                        rotation: {
                            x: target.rotation.x,
                            y: target.rotation.y,
                            z: target.rotation.z
                        }
                    });
                }
            }
        }, void 0, false, {
            fileName: "[project]/app/components/editor/SelectionTransform.tsx",
            lineNumber: 48,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/editor/SelectionTransform.tsx",
        lineNumber: 47,
        columnNumber: 9
    }, this);
}
_s(SelectionTransform, "t0ROIm0te30QlRlr/0LgZ99P3iU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"]
    ];
});
_c = SelectionTransform;
var _c;
__turbopack_context__.k.register(_c, "SelectionTransform");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/FurnAIAssetsManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FurnAIAssetsManager",
    ()=>FurnAIAssetsManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Gltf.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
function AssetInstance({ url, x, z }) {
    _s();
    const gltf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"])(url);
    const object = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssetInstance.useMemo[object]": ()=>{
            // Clone so multiple instances can coexist safely.
            return gltf.scene.clone(true);
        }
    }["AssetInstance.useMemo[object]"], [
        gltf.scene
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
        object: object,
        position: [
            x,
            0.02,
            z
        ]
    }, void 0, false, {
        fileName: "[project]/app/components/editor/FurnAIAssetsManager.tsx",
        lineNumber: 32,
        columnNumber: 12
    }, this);
}
_s(AssetInstance, "ADPkV5eoHMJNXI2nfdaqigG2Fbo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"]
    ];
});
_c = AssetInstance;
function FurnAIAssetsManager() {
    _s1();
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FurnAIAssetsManager.useFloorplanStore[mode]": (s)=>s.mode
    }["FurnAIAssetsManager.useFloorplanStore[mode]"]);
    const currentRunId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FurnAIAssetsManager.useFloorplanStore[currentRunId]": (s)=>s.currentRunId
    }["FurnAIAssetsManager.useFloorplanStore[currentRunId]"]);
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FurnAIAssetsManager.useFloorplanStore[token]": (s)=>s.token
    }["FurnAIAssetsManager.useFloorplanStore[token]"]);
    const pxToM = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FurnAIAssetsManager.useFloorplanStore[pxToM]": (s)=>s.calibrationFactor
    }["FurnAIAssetsManager.useFloorplanStore[pxToM]"]);
    const [manifest, setManifest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [offsetPx, setOffsetPx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [blobUrls, setBlobUrls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FurnAIAssetsManager.useEffect": ()=>{
            // Cleanup blob URLs when run changes/unmounts
            return ({
                "FurnAIAssetsManager.useEffect": ()=>{
                    for (const u of Object.values(blobUrls)){
                        try {
                            URL.revokeObjectURL(u);
                        } catch  {
                        // ignore
                        }
                    }
                }
            })["FurnAIAssetsManager.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["FurnAIAssetsManager.useEffect"], [
        currentRunId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FurnAIAssetsManager.useEffect": ()=>{
            const runId = currentRunId;
            if (!runId || !token || mode !== '3d') {
                setManifest(null);
                setOffsetPx(null);
                setBlobUrls({});
                return;
            }
            let cancelled = false;
            ({
                "FurnAIAssetsManager.useEffect": async ()=>{
                    try {
                        const headers = {
                            Authorization: `Bearer ${token}`
                        };
                        const [mRes, svgRes] = await Promise.all([
                            fetch(`/api/runs/${runId}/furniture/assets`, {
                                headers
                            }),
                            fetch(`/api/runs/${runId}/svg`, {
                                headers
                            })
                        ]);
                        if (!mRes.ok) throw new Error(`manifest ${mRes.status}`);
                        if (!svgRes.ok) throw new Error(`svg ${svgRes.status}`);
                        const mJson = await mRes.json();
                        const m = mJson?.manifest || null;
                        const svgText = await svgRes.text();
                        const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
                        const svgEl = doc.querySelector('svg');
                        const vb = svgEl?.getAttribute('viewBox');
                        let ox = 0;
                        let oy = 0;
                        if (vb) {
                            const parts = vb.split(/[\s,]+/).map({
                                "FurnAIAssetsManager.useEffect.parts": (p)=>parseFloat(p)
                            }["FurnAIAssetsManager.useEffect.parts"]).filter({
                                "FurnAIAssetsManager.useEffect.parts": (n)=>!isNaN(n)
                            }["FurnAIAssetsManager.useEffect.parts"]);
                            if (parts.length === 4) {
                                ox = parts[0] + parts[2] / 2;
                                oy = parts[1] + parts[3] / 2;
                            }
                        }
                        if (cancelled) return;
                        setManifest(m);
                        setOffsetPx({
                            x: ox,
                            y: oy
                        });
                        // Download GLBs as blobs so we can include auth headers.
                        const items = m?.items || {};
                        const nextUrls = {};
                        for (const [key, it] of Object.entries(items)){
                            const rel = (it?.glb || '').trim();
                            if (!rel) continue;
                            const path = encodeURI(rel);
                            const glbRes = await fetch(`/api/runs/${runId}/assets/${path}`, {
                                headers
                            });
                            if (!glbRes.ok) continue;
                            const blob = await glbRes.blob();
                            const url = URL.createObjectURL(blob);
                            nextUrls[key] = url;
                        }
                        if (cancelled) return;
                        // Revoke previous URLs (avoid leaks)
                        for (const u of Object.values(blobUrls)){
                            try {
                                URL.revokeObjectURL(u);
                            } catch  {
                            // ignore
                            }
                        }
                        setBlobUrls(nextUrls);
                    } catch (e) {
                        console.error('[FurnAIAssetsManager] Failed to load assets', e);
                        if (!cancelled) {
                            setManifest(null);
                            setOffsetPx(null);
                            setBlobUrls({});
                        }
                    }
                }
            })["FurnAIAssetsManager.useEffect"]();
            return ({
                "FurnAIAssetsManager.useEffect": ()=>{
                    cancelled = true;
                }
            })["FurnAIAssetsManager.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["FurnAIAssetsManager.useEffect"], [
        currentRunId,
        token
    ]);
    if (mode !== '3d') return null;
    if (!manifest || !offsetPx) return null;
    const items = manifest.items || {};
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        name: "FurnAIAssets",
        children: Object.entries(items).map(([key, it])=>{
            const pose = it?.pose_px;
            const url = blobUrls[key];
            if (!pose || !url) return null;
            const x = (pose.x_px - offsetPx.x) * pxToM;
            const z = (pose.y_px - offsetPx.y) * pxToM;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AssetInstance, {
                url: url,
                x: x,
                z: z
            }, key, false, {
                fileName: "[project]/app/components/editor/FurnAIAssetsManager.tsx",
                lineNumber: 164,
                columnNumber: 24
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/app/components/editor/FurnAIAssetsManager.tsx",
        lineNumber: 155,
        columnNumber: 9
    }, this);
}
_s1(FurnAIAssetsManager, "iMwrLC9MSSmpsTukd/fOAumS0RA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c1 = FurnAIAssetsManager;
var _c, _c1;
__turbopack_context__.k.register(_c, "AssetInstance");
__turbopack_context__.k.register(_c1, "FurnAIAssetsManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/ImportedModelsManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImportedModelsManager",
    ()=>ImportedModelsManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Gltf.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
function ImportedInstance({ url, x, y, z, rotY }) {
    _s();
    const gltf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"])(url);
    const object = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ImportedInstance.useMemo[object]": ()=>{
            return gltf.scene.clone(true);
        }
    }["ImportedInstance.useMemo[object]"], [
        gltf.scene
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
        object: object,
        position: [
            x,
            y,
            z
        ],
        rotation: [
            0,
            rotY,
            0
        ]
    }, void 0, false, {
        fileName: "[project]/app/components/editor/ImportedModelsManager.tsx",
        lineNumber: 14,
        columnNumber: 12
    }, this);
}
_s(ImportedInstance, "ADPkV5eoHMJNXI2nfdaqigG2Fbo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"]
    ];
});
_c = ImportedInstance;
function ImportedModelsManager() {
    _s1();
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "ImportedModelsManager.useFloorplanStore[mode]": (s)=>s.mode
    }["ImportedModelsManager.useFloorplanStore[mode]"]);
    const currentRunId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "ImportedModelsManager.useFloorplanStore[currentRunId]": (s)=>s.currentRunId
    }["ImportedModelsManager.useFloorplanStore[currentRunId]"]);
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "ImportedModelsManager.useFloorplanStore[token]": (s)=>s.token
    }["ImportedModelsManager.useFloorplanStore[token]"]);
    const furniture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "ImportedModelsManager.useFloorplanStore[furniture]": (s)=>s.furniture
    }["ImportedModelsManager.useFloorplanStore[furniture]"]);
    const [blobUrls, setBlobUrls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ImportedModelsManager.useEffect": ()=>{
            // Cleanup blob URLs when run changes/unmounts
            return ({
                "ImportedModelsManager.useEffect": ()=>{
                    for (const u of Object.values(blobUrls)){
                        try {
                            URL.revokeObjectURL(u);
                        } catch  {
                        // ignore
                        }
                    }
                }
            })["ImportedModelsManager.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ImportedModelsManager.useEffect"], [
        currentRunId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ImportedModelsManager.useEffect": ()=>{
            const runId = currentRunId;
            if (!runId || !token) {
                setBlobUrls({});
                return;
            }
            let cancelled = false;
            ({
                "ImportedModelsManager.useEffect": async ()=>{
                    try {
                        const headers = {
                            Authorization: `Bearer ${token}`
                        };
                        const nextUrls = {};
                        for (const it of furniture){
                            const rel = (it.modelUrl || '').trim();
                            if (!rel) continue;
                            const safe = encodeURI(rel);
                            const res = await fetch(`/api/runs/${runId}/assets/${safe}`, {
                                headers
                            });
                            if (!res.ok) continue;
                            const blob = await res.blob();
                            nextUrls[it.id] = URL.createObjectURL(blob);
                        }
                        if (cancelled) return;
                        for (const u of Object.values(blobUrls)){
                            try {
                                URL.revokeObjectURL(u);
                            } catch  {
                            // ignore
                            }
                        }
                        setBlobUrls(nextUrls);
                    } catch (e) {
                        console.error('[ImportedModelsManager] Failed to load imported models', e);
                        if (!cancelled) setBlobUrls({});
                    }
                }
            })["ImportedModelsManager.useEffect"]();
            return ({
                "ImportedModelsManager.useEffect": ()=>{
                    cancelled = true;
                }
            })["ImportedModelsManager.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ImportedModelsManager.useEffect"], [
        currentRunId,
        token,
        furniture.map({
            "ImportedModelsManager.useEffect": (f)=>`${f.id}:${f.modelUrl}`
        }["ImportedModelsManager.useEffect"]).join('|')
    ]);
    if (mode !== '3d') return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        name: "ImportedModels",
        children: furniture.map((it)=>{
            const url = blobUrls[it.id];
            if (!url) return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ImportedInstance, {
                url: url,
                x: it.position.x,
                y: it.position.y || 0,
                z: it.position.z,
                rotY: it.rotation?.y || 0
            }, it.id, false, {
                fileName: "[project]/app/components/editor/ImportedModelsManager.tsx",
                lineNumber: 95,
                columnNumber: 21
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/app/components/editor/ImportedModelsManager.tsx",
        lineNumber: 89,
        columnNumber: 9
    }, this);
}
_s1(ImportedModelsManager, "9YlhcpK2WQuTIsxVxuew1DtYBOU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c1 = ImportedModelsManager;
var _c, _c1;
__turbopack_context__.k.register(_c, "ImportedInstance");
__turbopack_context__.k.register(_c1, "ImportedModelsManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/TutorialOverlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TutorialOverlay",
    ()=>TutorialOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ruler.js [app-client] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hammer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hammer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hammer.js [app-client] (ecmascript) <export default as Hammer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function TutorialOverlay() {
    _s();
    const tutorialStep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "TutorialOverlay.useFloorplanStore[tutorialStep]": (s)=>s.tutorialStep
    }["TutorialOverlay.useFloorplanStore[tutorialStep]"]);
    const setTutorialStep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "TutorialOverlay.useFloorplanStore[setTutorialStep]": (s)=>s.setTutorialStep
    }["TutorialOverlay.useFloorplanStore[setTutorialStep]"]);
    const completeTutorial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "TutorialOverlay.useFloorplanStore[completeTutorial]": (s)=>s.completeTutorial
    }["TutorialOverlay.useFloorplanStore[completeTutorial]"]);
    const triggerDetectRooms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "TutorialOverlay.useFloorplanStore[triggerDetectRooms]": (s)=>s.triggerDetectRooms
    }["TutorialOverlay.useFloorplanStore[triggerDetectRooms]"]);
    if (tutorialStep === 'none') return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute top-4 right-4 z-50 pointer-events-none flex flex-col items-end space-y-4",
        children: [
            tutorialStep === 'calibration' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#111]/90 border border-yellow-500/50 p-6 rounded-2xl shadow-2xl max-w-sm text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-500/30",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                            className: "w-6 h-6 text-yellow-500"
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                            lineNumber: 20,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 19,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold text-white mb-2",
                        children: "Step 1: Please Calibrate"
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 22,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground text-xs mb-4 leading-relaxed",
                        children: [
                            "Select the ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white/90 font-semibold",
                                children: "Ruler Tool"
                            }, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 24,
                                columnNumber: 36
                            }, this),
                            ", click a wall, and enter the real length.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 25,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 25,
                                columnNumber: 31
                            }, this),
                            "After calibration, editing tools will unlock."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 23,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center gap-2 text-[10px] text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                className: "w-3 h-3"
                            }, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 30,
                                columnNumber: 25
                            }, this),
                            "Look for ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white/80",
                                children: "Ruler Tool"
                            }, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 31,
                                columnNumber: 34
                            }, this),
                            " in the left panel"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 29,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                lineNumber: 18,
                columnNumber: 17
            }, this),
            tutorialStep === 'correction' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#111]/90 border border-blue-500/50 p-6 rounded-2xl shadow-2xl max-w-sm text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hammer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hammer$3e$__["Hammer"], {
                            className: "w-6 h-6 text-blue-500"
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                            lineNumber: 41,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 40,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold text-white mb-2",
                        children: "Step 2: Fix Layout"
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 43,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground text-xs mb-4 leading-relaxed",
                        children: [
                            "The AI might have missed some details.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 46,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 46,
                                columnNumber: 31
                            }, this),
                            "Use the tools to add missing walls or fix doors.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 48,
                                columnNumber: 25
                            }, this),
                            "Once you are ready, click below to find rooms."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 44,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>triggerDetectRooms(),
                        className: "bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-lg shadow-purple-900/20 w-full text-sm",
                        children: "Find Rooms (Postprocess + OCR)"
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 52,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                lineNumber: 39,
                columnNumber: 17
            }, this),
            tutorialStep === 'rooms' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#111]/90 border border-purple-500/50 p-6 rounded-2xl shadow-2xl max-w-sm text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                            className: "w-6 h-6 text-purple-400"
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                            lineNumber: 65,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 64,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold text-white mb-2",
                        children: "Step 3: Find Rooms"
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 67,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground text-xs mb-4 leading-relaxed",
                        children: "This will postprocess your current SVG, compare it with the image, and run OCR to detect room labels."
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 68,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>triggerDetectRooms(),
                        className: "bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-lg shadow-purple-900/20 w-full text-sm",
                        children: "Find Rooms (Postprocess + OCR)"
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 72,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                lineNumber: 63,
                columnNumber: 17
            }, this),
            tutorialStep === 'floor_review' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#111]/90 border border-green-500/50 p-6 rounded-2xl shadow-2xl max-w-sm text-center pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-10 duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                            className: "w-6 h-6 text-green-500"
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                            lineNumber: 85,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 84,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold text-white mb-2",
                        children: "Floor Generated!"
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 87,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground text-xs mb-4 leading-relaxed",
                        children: [
                            "The floor geometry is ready.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 90,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                                lineNumber: 90,
                                columnNumber: 31
                            }, this),
                            "You can now generate the full 3D model."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 88,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: completeTutorial,
                        className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-lg shadow-green-900/20 w-full text-sm",
                        children: "Unlock 3D Generation"
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                        lineNumber: 94,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
                lineNumber: 83,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/TutorialOverlay.tsx",
        lineNumber: 15,
        columnNumber: 9
    }, this);
}
_s(TutorialOverlay, "JUczMyhLE/IttR8Gy4g8qbg/uLs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = TutorialOverlay;
var _c;
__turbopack_context__.k.register(_c, "TutorialOverlay");
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
"[project]/app/components/editor/ReferenceOverlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReferenceOverlay",
    ()=>ReferenceOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/move.js [app-client] (ecmascript) <export default as Move>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function ReferenceOverlay() {
    _s();
    const uploadedImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "ReferenceOverlay.useFloorplanStore[uploadedImage]": (s)=>s.uploadedImage
    }["ReferenceOverlay.useFloorplanStore[uploadedImage]"]);
    const showBackground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "ReferenceOverlay.useFloorplanStore[showBackground]": (s)=>s.showBackground
    }["ReferenceOverlay.useFloorplanStore[showBackground]"]);
    const toggleBackground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "ReferenceOverlay.useFloorplanStore[toggleBackground]": (s)=>s.toggleBackground
    }["ReferenceOverlay.useFloorplanStore[toggleBackground]"]);
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "ReferenceOverlay.useFloorplanStore[mode]": (s)=>s.mode
    }["ReferenceOverlay.useFloorplanStore[mode]"]) // Check mode
    ;
    const [scale, setScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [position, setPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [isDraggingImage, setIsDraggingImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dragStart, setDragStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    // Window Position (simple draggable implementation)
    // We'll use a fixed initial position (bottom-right) and transform it
    const [windowPos, setWindowPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    }) // Offset from default bottom-right
    ;
    const [isDraggingWindow, setIsDraggingWindow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const windowRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Global Mouse Move/Up for Drags (MOVED UP to fix Hooks error)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReferenceOverlay.useEffect": ()=>{
            const handleMouseMove = {
                "ReferenceOverlay.useEffect.handleMouseMove": (e)=>{
                    if (isDraggingImage) {
                        setPosition({
                            x: e.clientX - dragStart.x,
                            y: e.clientY - dragStart.y
                        });
                    }
                    if (isDraggingWindow) {
                        setWindowPos({
                            x: e.clientX - dragStart.x,
                            y: e.clientY - dragStart.y
                        });
                    }
                }
            }["ReferenceOverlay.useEffect.handleMouseMove"];
            const handleMouseUp = {
                "ReferenceOverlay.useEffect.handleMouseUp": ()=>{
                    setIsDraggingImage(false);
                    setIsDraggingWindow(false);
                }
            }["ReferenceOverlay.useEffect.handleMouseUp"];
            if (isDraggingImage || isDraggingWindow) {
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
            }
            return ({
                "ReferenceOverlay.useEffect": ()=>{
                    window.removeEventListener('mousemove', handleMouseMove);
                    window.removeEventListener('mouseup', handleMouseUp);
                }
            })["ReferenceOverlay.useEffect"];
        }
    }["ReferenceOverlay.useEffect"], [
        isDraggingImage,
        isDraggingWindow,
        dragStart
    ]);
    if (!uploadedImage || !showBackground || mode === '3d') return null;
    // --- Image Pan/Zoom Handlers ---
    const handleWheel = (e)=>{
        // Prevent page scroll
        e.stopPropagation();
        // Determine zoom direction
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale((s)=>Math.min(Math.max(s * delta, 1), 8)); // Clamp 1x to 8x
    };
    const handleImageMouseDown = (e)=>{
        if (scale > 1) {
            e.preventDefault();
            setIsDraggingImage(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };
    // --- Window Drag Handlers ---
    const handleHeaderMouseDown = (e)=>{
        e.preventDefault();
        setIsDraggingWindow(true);
        setDragStart({
            x: e.clientX - windowPos.x,
            y: e.clientY - windowPos.y
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: windowRef,
        className: "absolute z-50 flex flex-col bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden",
        style: {
            bottom: '20px',
            right: '20px',
            width: '400px',
            height: 'auto',
            minWidth: '200px',
            minHeight: '200px',
            resize: 'both',
            transform: `translate(${windowPos.x}px, ${windowPos.y}px)`
        },
        onWheel: (e)=>e.stopPropagation(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 bg-white/5 border-b border-white/10 flex items-center justify-between px-2 cursor-move select-none",
                onMouseDown: handleHeaderMouseDown,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-xs font-medium text-white/70",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__["Move"], {
                                className: "w-3 h-3"
                            }, void 0, false, {
                                fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                                lineNumber: 108,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Reference View"
                            }, void 0, false, {
                                fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                                lineNumber: 109,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                        lineNumber: 107,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setScale(1);
                                    setPosition({
                                        x: 0,
                                        y: 0
                                    });
                                },
                                className: "flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded text-[10px] text-white/50 hover:text-white transition-colors",
                                title: "Reset Zoom & Pan",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                                        lineNumber: 118,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Reset"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                                        lineNumber: 119,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                                lineNumber: 113,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleBackground,
                                className: "flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded text-[10px] text-white/50 hover:text-red-400 transition-colors",
                                title: "Hide Reference",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                                        lineNumber: 126,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Close"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                                        lineNumber: 127,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                                lineNumber: 121,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                        lineNumber: 112,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                lineNumber: 103,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex-1 overflow-hidden relative bg-[#111] flex items-center justify-center", scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"),
                onWheel: handleWheel,
                onMouseDown: handleImageMouseDown,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: uploadedImage,
                        alt: "Ref",
                        draggable: false,
                        className: "max-w-full max-h-full object-contain transition-transform duration-75",
                        style: {
                            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                        lineNumber: 141,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white/50 pointer-events-none",
                        children: [
                            Math.round(scale * 100),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                        lineNumber: 152,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
                lineNumber: 133,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/ReferenceOverlay.tsx",
        lineNumber: 87,
        columnNumber: 9
    }, this);
}
_s(ReferenceOverlay, "j70qloW8xJbx5xdBITkX7hagQC4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = ReferenceOverlay;
var _c;
__turbopack_context__.k.register(_c, "ReferenceOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/Scene.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Scene",
    ()=>Scene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export G as useLoader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrbitControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$PerspectiveCamera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/PerspectiveCamera.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrthographicCamera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrthographicCamera.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Grid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Environment.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$ContactShadows$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/ContactShadows.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/postprocessing/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$WallManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/WallManager.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$FurnitureManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/FurnitureManager.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$Ground$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/Ground.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$FloorManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/FloorManager.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$SelectionTransform$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/SelectionTransform.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$FurnAIAssetsManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/FurnAIAssetsManager.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$ImportedModelsManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/ImportedModelsManager.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$TutorialOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/TutorialOverlay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$ReferenceOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/editor/ReferenceOverlay.tsx [app-client] (ecmascript)"); // New Import
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature();
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
;
;
;
;
;
const _EMPTY_TEX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4G8m8AAAAASUVORK5CYII=';
// --- Headless Drop Resolver ---
function DropResolver() {
    _s();
    const pendingDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "DropResolver.useFloorplanStore[pendingDrop]": (s)=>s.pendingDrop
    }["DropResolver.useFloorplanStore[pendingDrop]"]);
    const addFurniture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "DropResolver.useFloorplanStore[addFurniture]": (s)=>s.addFurniture
    }["DropResolver.useFloorplanStore[addFurniture]"]);
    const consumeDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "DropResolver.useFloorplanStore[consumeDrop]": (s)=>s.consumeDrop
    }["DropResolver.useFloorplanStore[consumeDrop]"]);
    const { raycaster, camera, scene } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DropResolver.useEffect": ()=>{
            if (pendingDrop) {
                raycaster.setFromCamera({
                    x: pendingDrop.x,
                    y: pendingDrop.y
                }, camera);
                const ground = scene.getObjectByName("Ground");
                if (ground) {
                    const intersects = raycaster.intersectObject(ground);
                    if (intersects.length > 0) {
                        const point = intersects[0].point;
                        addFurniture(pendingDrop.type, {
                            x: point.x,
                            y: point.z
                        });
                    }
                }
                consumeDrop();
            }
        }
    }["DropResolver.useEffect"], [
        pendingDrop,
        camera,
        raycaster,
        scene,
        addFurniture,
        consumeDrop
    ]);
    return null;
}
_s(DropResolver, "DnhgAlTQ8W9kZrUVqgWZZfTptD4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"]
    ];
});
_c = DropResolver;
function SvgOverlayPlane() {
    _s1();
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "SvgOverlayPlane.useFloorplanStore[mode]": (s)=>s.mode
    }["SvgOverlayPlane.useFloorplanStore[mode]"]);
    const currentRunId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "SvgOverlayPlane.useFloorplanStore[currentRunId]": (s)=>s.currentRunId
    }["SvgOverlayPlane.useFloorplanStore[currentRunId]"]);
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "SvgOverlayPlane.useFloorplanStore[token]": (s)=>s.token
    }["SvgOverlayPlane.useFloorplanStore[token]"]);
    const calibrationFactor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "SvgOverlayPlane.useFloorplanStore[calibrationFactor]": (s)=>s.calibrationFactor
    }["SvgOverlayPlane.useFloorplanStore[calibrationFactor]"]);
    const [blobUrl, setBlobUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [vb, setVb] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SvgOverlayPlane.useEffect": ()=>{
            if (mode !== '3d') return;
            if (!currentRunId || !token) {
                setVb(null);
                setBlobUrl({
                    "SvgOverlayPlane.useEffect": (prev)=>{
                        if (prev) URL.revokeObjectURL(prev);
                        return null;
                    }
                }["SvgOverlayPlane.useEffect"]);
                return;
            }
            let cancelled = false;
            ({
                "SvgOverlayPlane.useEffect": async ()=>{
                    try {
                        const res = await fetch(`/api/runs/${currentRunId}/svg`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        if (!res.ok) throw new Error(`svg ${res.status}`);
                        const svgText = await res.text();
                        const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
                        const svgEl = doc.querySelector('svg');
                        const viewBox = (svgEl?.getAttribute('viewBox') || '').trim();
                        const parts = viewBox.split(/[\s,]+/).map({
                            "SvgOverlayPlane.useEffect.parts": (v)=>parseFloat(v)
                        }["SvgOverlayPlane.useEffect.parts"]).filter({
                            "SvgOverlayPlane.useEffect.parts": (n)=>!isNaN(n)
                        }["SvgOverlayPlane.useEffect.parts"]);
                        if (parts.length === 4) {
                            setVb({
                                w: Math.max(1, parts[2]),
                                h: Math.max(1, parts[3])
                            });
                        } else {
                            const w = parseFloat((svgEl?.getAttribute('width') || '0').replace('px', ''));
                            const h = parseFloat((svgEl?.getAttribute('height') || '0').replace('px', ''));
                            if (w > 0 && h > 0) setVb({
                                w,
                                h
                            });
                        }
                        const blob = new Blob([
                            svgText
                        ], {
                            type: 'image/svg+xml'
                        });
                        const url = URL.createObjectURL(blob);
                        if (cancelled) {
                            URL.revokeObjectURL(url);
                            return;
                        }
                        setBlobUrl({
                            "SvgOverlayPlane.useEffect": (prev)=>{
                                if (prev) URL.revokeObjectURL(prev);
                                return url;
                            }
                        }["SvgOverlayPlane.useEffect"]);
                    } catch (e) {
                        console.error('[SvgOverlayPlane] Failed to load run svg', e);
                        setVb(null);
                        setBlobUrl({
                            "SvgOverlayPlane.useEffect": (prev)=>{
                                if (prev) URL.revokeObjectURL(prev);
                                return null;
                            }
                        }["SvgOverlayPlane.useEffect"]);
                    }
                }
            })["SvgOverlayPlane.useEffect"]();
            return ({
                "SvgOverlayPlane.useEffect": ()=>{
                    cancelled = true;
                }
            })["SvgOverlayPlane.useEffect"];
        }
    }["SvgOverlayPlane.useEffect"], [
        mode,
        currentRunId,
        token
    ]);
    const texture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureLoader"], blobUrl || _EMPTY_TEX_DATA_URL);
    if (mode !== '3d') return null;
    if (!blobUrl || !vb) return null;
    const factor = calibrationFactor > 0 ? calibrationFactor : 0.02;
    const width = vb.w * factor;
    const height = vb.h * factor;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        rotation: [
            -Math.PI / 2,
            0,
            0
        ],
        position: [
            0,
            0.0015,
            0
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                args: [
                    width,
                    height
                ]
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 126,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                map: texture,
                transparent: true,
                opacity: 0.55,
                depthWrite: false,
                toneMapped: false
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 127,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/Scene.tsx",
        lineNumber: 125,
        columnNumber: 9
    }, this);
}
_s1(SvgOverlayPlane, "dZtDr72efygS/O2lmJZ7somvwp0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"]
    ];
});
_c1 = SvgOverlayPlane;
// --- Fit View Handler ---
function FitHandler() {
    _s2();
    const fitViewTrigger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "FitHandler.useFloorplanStore[fitViewTrigger]": (s)=>s.fitViewTrigger
    }["FitHandler.useFloorplanStore[fitViewTrigger]"]);
    const { camera, scene, controls } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FitHandler.useEffect": ()=>{
            if (fitViewTrigger > 0) {
                console.log('[DEBUG] Auto-fitting view to bounds...');
                // Calculate bounding box of relevant objects
                const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
                const targets = [];
                scene.traverse({
                    "FitHandler.useEffect": (obj)=>{
                        // Filter what to include in bounds
                        if (obj.type === 'Mesh') {
                            // Strict filtering to avoid Environment/Skybox/Helpers
                            // We only want explicitly named parts of the house
                            if (obj.name === 'Wall' || obj.name === 'Floor' || obj.parent?.name === 'Item') {
                                targets.push(obj);
                            }
                        }
                    }
                }["FitHandler.useEffect"]);
                if (targets.length === 0) return;
                box.setFromObject(targets[0]);
                targets.forEach({
                    "FitHandler.useEffect": (t)=>box.expandByObject(t)
                }["FitHandler.useEffect"]);
                if (box.isEmpty()) return;
                const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                box.getCenter(center);
                const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                box.getSize(size);
                const maxDim = Math.max(size.x, size.z);
                const padding = 1.2;
                // Move camera to center top
                if (camera.type === 'OrthographicCamera') {
                    const cam = camera;
                    const ctrl = controls;
                    if (ctrl) {
                        ctrl.target.set(center.x, 0, center.z);
                        ctrl.object.position.set(center.x, 10, center.z);
                        // Adjust Zoom: Approximate calculation to fit maxDim
                        // Zoom = CanvasDimension / WorldDimension
                        // Use min dimension of canvas to ensure full fit
                        const newZoom = Math.min(window.innerWidth, window.innerHeight) / (maxDim * padding);
                        cam.zoom = Math.max(newZoom, 5); // Min zoom clamp
                        cam.updateProjectionMatrix();
                        ctrl.update();
                    }
                } else {
                    // Perspective
                    const ctrl = controls;
                    if (ctrl) {
                        ctrl.target.copy(center);
                        const dist = maxDim * padding;
                        ctrl.object.position.set(center.x + dist, center.y + dist, center.z + dist);
                        ctrl.update();
                    }
                }
            }
        }
    }["FitHandler.useEffect"], [
        fitViewTrigger,
        camera,
        scene,
        controls
    ]);
    return null;
}
_s2(FitHandler, "oZ0NK60eXigm7NleiW5vLjqvcbM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"]
    ];
});
_c2 = FitHandler;
// --- Interaction Handler ---
function InteractionLayer() {
    _s3();
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "InteractionLayer.useFloorplanStore[mode]": (s)=>s.mode
    }["InteractionLayer.useFloorplanStore[mode]"]);
    const activeTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "InteractionLayer.useFloorplanStore[activeTool]": (s)=>s.activeTool
    }["InteractionLayer.useFloorplanStore[activeTool]"]);
    const startInteraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "InteractionLayer.useFloorplanStore[startInteraction]": (s)=>s.startInteraction
    }["InteractionLayer.useFloorplanStore[startInteraction]"]);
    const updateInteraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "InteractionLayer.useFloorplanStore[updateInteraction]": (s)=>s.updateInteraction
    }["InteractionLayer.useFloorplanStore[updateInteraction]"]);
    const endInteraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "InteractionLayer.useFloorplanStore[endInteraction]": (s)=>s.endInteraction
    }["InteractionLayer.useFloorplanStore[endInteraction]"]);
    const selectObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "InteractionLayer.useFloorplanStore[selectObject]": (s)=>s.selectObject
    }["InteractionLayer.useFloorplanStore[selectObject]"]);
    const onPointerDown = (e)=>{
        console.log('[DEBUG] onPointerDown', {
            mode,
            activeTool,
            button: e.button,
            point: e.point
        });
        if (mode !== '2d') return;
        if (e.button !== 0) return; // Left click only
        e.stopPropagation();
        // CRITICAL FIX: Only draw if tool is strictly 'wall' or 'ruler' or 'floor'
        if (activeTool === 'wall' || activeTool === 'ruler') {
            console.log('[DEBUG] Starting interaction - drawing');
            selectObject(null);
            startInteraction('drawing', null, {
                x: e.point.x,
                y: e.point.z
            });
        } else if (activeTool === 'floor') {
            console.log('[DEBUG] Starting interaction - drawing floor');
            selectObject(null);
            startInteraction('drawing_floor', null, {
                x: e.point.x,
                y: e.point.z
            });
        } else {
            console.log('[DEBUG] Tool not active, just deselecting');
            selectObject(null);
        }
    };
    const onPointerMove = (e)=>{
        if (mode !== '2d') return;
        // Pass boolean for shiftKey if available in nativeEvent, or from the synthetic event if possible.
        // R3F events wrap native events. e.shiftKey might be available directly on some versions, or e.nativeEvent.shiftKey
        const shiftKey = e.shiftKey || e.nativeEvent?.shiftKey || false;
        updateInteraction({
            x: e.point.x,
            y: e.point.z
        }, {
            shiftKey
        });
    };
    const onPointerUp = ()=>{
        console.log('[DEBUG] onPointerUp - ending interaction');
        endInteraction();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        name: "InteractionPlane",
        rotation: [
            -Math.PI / 2,
            0,
            0
        ],
        position: [
            0,
            0.1,
            0
        ],
        onPointerDown: onPointerDown,
        onPointerMove: onPointerMove,
        onPointerUp: onPointerUp,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                args: [
                    500,
                    500
                ]
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 257,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                transparent: true,
                opacity: 0,
                depthWrite: false
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 258,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/Scene.tsx",
        lineNumber: 249,
        columnNumber: 9
    }, this);
}
_s3(InteractionLayer, "cmgk0NQeRI02rzIhplczDsW0boM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c3 = InteractionLayer;
// --- Scene Content Component ---
function SceneContent() {
    _s4();
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "SceneContent.useFloorplanStore[mode]": (s)=>s.mode
    }["SceneContent.useFloorplanStore[mode]"]);
    const lightingPreset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "SceneContent.useFloorplanStore[lightingPreset]": (s)=>s.lightingPreset
    }["SceneContent.useFloorplanStore[lightingPreset]"]);
    // Lighting presets configuration - Mapped to Environment presets + directional tweaks
    const lightingConfigs = {
        day: {
            env: 'city',
            sunIntensity: 2,
            sunColor: '#fff8e7'
        },
        night: {
            env: 'night',
            sunIntensity: 0.1,
            sunColor: '#aabbff'
        },
        studio: {
            env: 'studio',
            sunIntensity: 1,
            sunColor: '#ffffff'
        },
        sunset: {
            env: 'sunset',
            sunIntensity: 1.5,
            sunColor: '#ff9944'
        }
    };
    const lighting = lightingConfigs[lightingPreset];
    // Determine Environment Preset (drei types: apartment, city, park, lobby, etc.)
    // We map our custom names to closest available Drei presets
    const getEnvPreset = (name)=>{
        switch(name){
            case 'day':
                return 'apartment';
            case 'night':
                return 'city' // Night is tricky, city might be safest dark-ish or just low intensity
                ;
            case 'studio':
                return 'studio';
            case 'sunset':
                return 'sunset';
            default:
                return 'apartment';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("color", {
                attach: "background",
                args: [
                    '#252525'
                ]
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 292,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                intensity: 0.7,
                color: "#ffffff"
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 295,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Environment"], {
                preset: getEnvPreset(lightingPreset),
                background: false,
                blur: 0.8
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 298,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    5,
                    10,
                    5
                ],
                intensity: lighting.sunIntensity,
                color: lighting.sunColor,
                castShadow: true,
                "shadow-bias": -0.0001,
                "shadow-mapSize": [
                    2048,
                    2048
                ]
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 301,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$ContactShadows$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ContactShadows"], {
                position: [
                    0,
                    0.01,
                    0
                ],
                opacity: 0.7,
                scale: 50,
                blur: 2.5,
                far: 10,
                resolution: 1024,
                color: "#000000",
                frames: Infinity
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 311,
                columnNumber: 13
            }, this),
            mode === '3d' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$PerspectiveCamera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PerspectiveCamera"], {
                makeDefault: true,
                position: [
                    5,
                    12,
                    12
                ],
                fov: 50
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 323,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrthographicCamera$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrthographicCamera"], {
                makeDefault: true,
                position: [
                    0,
                    10,
                    0
                ],
                zoom: 40
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 325,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrbitControls"], {
                makeDefault: true,
                enableRotate: mode === '3d',
                enableZoom: true,
                enablePan: true,
                maxPolarAngle: mode === '3d' ? Math.PI / 2 : 0
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 328,
                columnNumber: 13
            }, this),
            mode === '2d' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Grid"], {
                infiniteGrid: true,
                fadeDistance: 30,
                fadeStrength: 5,
                sectionSize: 1,
                cellColor: "#353535",
                sectionColor: "#454545",
                position: [
                    0,
                    0.02,
                    0
                ]
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 337,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$FloorManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloorManager"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 350,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$WallManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WallManager"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 351,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$FurnitureManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FurnitureManager"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 352,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$FurnAIAssetsManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FurnAIAssetsManager"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 353,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$ImportedModelsManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImportedModelsManager"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 354,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$Ground$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ground"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 355,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SvgOverlayPlane, {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 356,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InteractionLayer, {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 358,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$SelectionTransform$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectionTransform"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 359,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FitHandler, {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 360,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 348,
                columnNumber: 13
            }, this),
            mode === '3d' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EffectComposer"], {
                multisampling: 0,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SMAA"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 366,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SMAA"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 367,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["N8AO"], {
                        halfRes: true,
                        color: "black",
                        aoRadius: 0.5,
                        intensity: 1.5,
                        aoSamples: 6,
                        denoiseSamples: 4
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 368,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bloom"], {
                        luminanceThreshold: 1,
                        mipmapBlur: true,
                        intensity: 0.8,
                        radius: 0.6
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 376,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToneMapping"], {}, void 0, false, {
                        fileName: "[project]/app/components/editor/Scene.tsx",
                        lineNumber: 382,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 365,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DropResolver, {}, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 386,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s4(SceneContent, "TUDDUdqagldOjc8F7HqUWWlAXVw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c4 = SceneContent;
// --- Background Image Plane ---
function BackgroundPlane() {
    _s5();
    const uploadedImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "BackgroundPlane.useFloorplanStore[uploadedImage]": (s)=>s.uploadedImage
    }["BackgroundPlane.useFloorplanStore[uploadedImage]"]);
    const showBackground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "BackgroundPlane.useFloorplanStore[showBackground]": (s)=>s.showBackground
    }["BackgroundPlane.useFloorplanStore[showBackground]"]);
    const imageDimensions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "BackgroundPlane.useFloorplanStore[imageDimensions]": (s)=>s.imageDimensions
    }["BackgroundPlane.useFloorplanStore[imageDimensions]"]);
    const calibrationFactor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "BackgroundPlane.useFloorplanStore[calibrationFactor]": (s)=>s.calibrationFactor
    }["BackgroundPlane.useFloorplanStore[calibrationFactor]"]);
    const texture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureLoader"], uploadedImage || '');
    if (!uploadedImage || !showBackground || !imageDimensions) return null;
    // Calculate world dimensions based on pixels * meters/pixel
    // Default factor is usually 0.05 or similar if not calibrated
    const factor = calibrationFactor > 0 ? calibrationFactor : 0.02 // Fallback scale
    ;
    const width = imageDimensions.width * factor;
    const height = imageDimensions.height * factor;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        rotation: [
            -Math.PI / 2,
            0,
            0
        ],
        position: [
            0,
            -0.05,
            0
        ],
        receiveShadow: true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                args: [
                    width,
                    height
                ]
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 414,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                map: texture,
                transparent: true,
                opacity: 0.3,
                depthWrite: false,
                toneMapped: false
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 415,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/Scene.tsx",
        lineNumber: 409,
        columnNumber: 9
    }, this);
}
_s5(BackgroundPlane, "rsojh0zGJ9EZtCiMuTc5PWQlBW4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"]
    ];
});
_c5 = BackgroundPlane;
function Scene() {
    _s6();
    const activeTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[activeTool]": (s)=>s.activeTool
    }["Scene.useFloorplanStore[activeTool]"]);
    const handleDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[handleDrop]": (s)=>s.handleDrop
    }["Scene.useFloorplanStore[handleDrop]"]);
    const selectedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[selectedId]": (s)=>s.selectedId
    }["Scene.useFloorplanStore[selectedId]"]);
    const deleteObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[deleteObject]": (s)=>s.deleteObject
    }["Scene.useFloorplanStore[deleteObject]"]);
    const uploadedImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[uploadedImage]": (s)=>s.uploadedImage
    }["Scene.useFloorplanStore[uploadedImage]"]) // For Reference View
    ;
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Get undo/redo/copy/paste functions
    const undo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[undo]": (s)=>s.undo
    }["Scene.useFloorplanStore[undo]"]);
    const redo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[redo]": (s)=>s.redo
    }["Scene.useFloorplanStore[redo]"]);
    const copyObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[copyObject]": (s)=>s.copyObject
    }["Scene.useFloorplanStore[copyObject]"]);
    const pasteObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "Scene.useFloorplanStore[pasteObject]": (s)=>s.pasteObject
    }["Scene.useFloorplanStore[pasteObject]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Scene.useEffect": ()=>{
            const handleKeyDown = {
                "Scene.useEffect.handleKeyDown": (e)=>{
                    // Ignore if typing in an input
                    const target = e.target;
                    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
                    // Delete selected object
                    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                        deleteObject(selectedId);
                    }
                    // Ctrl+Z - Undo
                    if (e.ctrlKey && e.key === 'z') {
                        e.preventDefault();
                        undo();
                    }
                    // Ctrl+Y - Redo
                    if (e.ctrlKey && e.key === 'y') {
                        e.preventDefault();
                        redo();
                    }
                    // Ctrl+C - Copy
                    if (e.ctrlKey && e.key === 'c' && selectedId) {
                        e.preventDefault();
                        copyObject();
                    }
                    // Ctrl+V - Paste
                    if (e.ctrlKey && e.key === 'v') {
                        e.preventDefault();
                        pasteObject();
                    }
                }
            }["Scene.useEffect.handleKeyDown"];
            window.addEventListener('keydown', handleKeyDown);
            return ({
                "Scene.useEffect": ()=>window.removeEventListener('keydown', handleKeyDown)
            })["Scene.useEffect"];
        }
    }["Scene.useEffect"], [
        selectedId,
        deleteObject,
        undo,
        redo,
        copyObject,
        pasteObject
    ]);
    const onDrop = (e)=>{
        e.preventDefault();
        const type = e.dataTransfer.getData('furniture_type');
        if (!type || !wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        handleDrop(type, x, y);
    };
    const onDragOver = (e)=>{
        e.preventDefault();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: wrapperRef,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex-1 h-full bg-[#1a1a1a] relative overflow-hidden select-none", activeTool === 'wall' ? "cursor-crosshair" : activeTool === 'ruler' ? "cursor-help" : "cursor-default"),
        onDrop: onDrop,
        onDragOver: onDragOver,
        onMouseDownCapture: (e)=>{
            // NUCLEAR FIX: Prevent browser text selection / drag behavior
            // Allow interactions with Input elements (like FloatingMenu)
            if (e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
                e.preventDefault();
            }
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
                shadows: true,
                className: "w-full h-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: null,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SceneContent, {}, void 0, false, {
                            fileName: "[project]/app/components/editor/Scene.tsx",
                            lineNumber: 511,
                            columnNumber: 21
                        }, this),
                        uploadedImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackgroundPlane, {}, void 0, false, {
                            fileName: "[project]/app/components/editor/Scene.tsx",
                            lineNumber: 512,
                            columnNumber: 39
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/editor/Scene.tsx",
                    lineNumber: 510,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 509,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$ReferenceOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReferenceOverlay"], {}, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 517,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$editor$2f$TutorialOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TutorialOverlay"], {}, void 0, false, {
                fileName: "[project]/app/components/editor/Scene.tsx",
                lineNumber: 519,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/editor/Scene.tsx",
        lineNumber: 493,
        columnNumber: 9
    }, this);
}
_s6(Scene, "7+aXMGmsXgryPgQXMOFjqZetJXk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c6 = Scene;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "DropResolver");
__turbopack_context__.k.register(_c1, "SvgOverlayPlane");
__turbopack_context__.k.register(_c2, "FitHandler");
__turbopack_context__.k.register(_c3, "InteractionLayer");
__turbopack_context__.k.register(_c4, "SceneContent");
__turbopack_context__.k.register(_c5, "BackgroundPlane");
__turbopack_context__.k.register(_c6, "Scene");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/Scene.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/components/editor/Scene.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=app_8023430e._.js.map