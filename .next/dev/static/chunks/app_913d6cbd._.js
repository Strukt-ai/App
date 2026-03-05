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
"[project]/app/components/editor/RenderGallery.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RenderGallery",
    ()=>RenderGallery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/floorplanStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function RenderGallery() {
    _s();
    const renders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "RenderGallery.useFloorplanStore[renders]": (s)=>s.renders
    }["RenderGallery.useFloorplanStore[renders]"]);
    const isRendering = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"])({
        "RenderGallery.useFloorplanStore[isRendering]": (s)=>s.isRendering
    }["RenderGallery.useFloorplanStore[isRendering]"]);
    const [selectedImage, setSelectedImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    if (renders.length === 0 && !isRendering || !isVisible) return null;
    const downloadAllRenders = ()=>{
        renders.forEach((url, i)=>{
            const link = document.createElement('a');
            link.href = url;
            link.download = `render_${i + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };
    const closeGallery = ()=>{
        setIsVisible(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-4 right-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-4 max-w-md animate-in slide-in-from-bottom-4 duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-sm font-semibold flex items-center gap-2",
                                children: [
                                    isRendering && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                        lineNumber: 38,
                                        columnNumber: 29
                                    }, this),
                                    "Rendered Images"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                lineNumber: 36,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: closeGallery,
                                className: "text-muted-foreground hover:text-foreground transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                    lineNumber: 46,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                lineNumber: 42,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                        lineNumber: 35,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 gap-2",
                        children: [
                            renders.map((url, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>setSelectedImage(url),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative aspect-video rounded-lg overflow-hidden cursor-pointer border border-border hover:border-primary transition-all", "animate-in fade-in slide-in-from-bottom-2 duration-500"),
                                    style: {
                                        animationDelay: `${i * 200}ms`
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: url,
                                            alt: `Render ${i + 1}`,
                                            className: "w-full h-full object-cover",
                                            onError: (e)=>{
                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75"><rect fill="%23333" width="100" height="75"/><text x="50" y="40" text-anchor="middle" fill="%23666" font-size="10">Render</text></svg>';
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                            lineNumber: 61,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute bottom-2 left-2 text-[10px] text-white/80",
                                                children: [
                                                    "View ",
                                                    i + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                                lineNumber: 70,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                            lineNumber: 69,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, url, true, {
                                    fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                    lineNumber: 52,
                                    columnNumber: 25
                                }, this)),
                            isRendering && renders.length < 4 && Array.from({
                                length: 4 - renders.length
                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "aspect-video rounded-lg bg-secondary/40 animate-pulse border border-dashed border-border flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                        lineNumber: 84,
                                        columnNumber: 33
                                    }, this)
                                }, `loading-${i}`, false, {
                                    fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                    lineNumber: 80,
                                    columnNumber: 29
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                        lineNumber: 50,
                        columnNumber: 17
                    }, this),
                    renders.length > 0 && !isRendering && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 pt-3 border-t border-border/50 flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: downloadAllRenders,
                                className: "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-green-600 text-white text-[10px] font-semibold hover:bg-green-700 transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                        lineNumber: 97,
                                        columnNumber: 29
                                    }, this),
                                    "Download All"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                lineNumber: 93,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: closeGallery,
                                className: "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-secondary text-foreground text-[10px] font-semibold hover:bg-secondary/80 transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                        lineNumber: 104,
                                        columnNumber: 29
                                    }, this),
                                    "Close"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/editor/RenderGallery.tsx",
                                lineNumber: 100,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                        lineNumber: 92,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/RenderGallery.tsx",
                lineNumber: 34,
                columnNumber: 13
            }, this),
            selectedImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-200",
                onClick: ()=>setSelectedImage(null),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "absolute top-4 right-4 text-white/70 hover:text-white transition-colors",
                        onClick: ()=>setSelectedImage(null),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-8 h-8"
                        }, void 0, false, {
                            fileName: "[project]/app/components/editor/RenderGallery.tsx",
                            lineNumber: 121,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                        lineNumber: 117,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: selectedImage,
                        alt: "Full render",
                        className: "max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    }, void 0, false, {
                        fileName: "[project]/app/components/editor/RenderGallery.tsx",
                        lineNumber: 123,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/editor/RenderGallery.tsx",
                lineNumber: 113,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true);
}
_s(RenderGallery, "I2FMyuo0sJfUpPJvQUmRL6Yepu8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$floorplanStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFloorplanStore"]
    ];
});
_c = RenderGallery;
var _c;
__turbopack_context__.k.register(_c, "RenderGallery");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/editor/RenderGallery.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/components/editor/RenderGallery.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=app_913d6cbd._.js.map