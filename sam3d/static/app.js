/**
 * FURNAI Studio - Main Application Logic
 * Handles image upload, interactions, and API communication.
 */

const App = {
    state: {
        config: window.SAM3D_CONFIG || {},
        currentImage: null, // HTMLImageElement
        currentJobId: null,
        masks: [], // Array of mask objects
        activeMaskId: null,
        isProcessing: false,
        imageScale: 1,
        generatedModels: [] // Array of { id, url, thumb }
    },

    elements: {
        fileInput: document.getElementById('image-input'),
        dropZone: document.getElementById('drop-zone'),
        canvas: document.getElementById('image-canvas'),
        overlayCanvas: document.getElementById('overlay-canvas'),
        segmentBtn: document.getElementById('segment-btn'),
        reconstructBtn: document.getElementById('reconstruct-btn'),
        drawer: document.getElementById('side-drawer'),
        drawerToggle: document.getElementById('toggle-drawer-btn'),
        drawerClose: document.getElementById('close-drawer-btn'),
        drawerList: document.getElementById('generated-list'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text'),
        toastContainer: document.getElementById('toast-container'),
    },

    init() {
        console.log("FURNAI Studio Initializing...");

        // Event Listeners
        this.elements.fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.elements.drawerToggle.addEventListener('click', () => this.toggleDrawer(true));
        this.elements.drawerClose.addEventListener('click', () => this.toggleDrawer(false));

        // Canvas Interaction
        this.elements.canvas.addEventListener('mousedown', (e) => this.handleCanvasClick(e));

        // Drag & Drop
        const viewer = document.getElementById('viewer-area');
        viewer.addEventListener('dragover', (e) => { e.preventDefault(); viewer.style.borderColor = 'var(--accent-color)'; });
        viewer.addEventListener('dragleave', (e) => { e.preventDefault(); viewer.style.borderColor = 'transparent'; });
        viewer.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                this.elements.fileInput.files = e.dataTransfer.files;
                this.handleImageUpload({ target: this.elements.fileInput });
            }
        });

        // Buttons
        this.elements.reconstructBtn.addEventListener('click', () => this.triggerReconstruction());
    },

    toggleDrawer(open) {
        if (open) {
            this.elements.drawer.classList.add('open');
            this.elements.drawerToggle.classList.add('active'); // Optional styling
        } else {
            this.elements.drawer.classList.remove('open');
            this.elements.drawerToggle.classList.remove('active');
        }
    },

    setLoading(active, text = "Processing...") {
        this.state.isProcessing = active;
        this.elements.loadingOverlay.style.display = active ? 'flex' : 'none';
        this.elements.loadingText.innerText = text;
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        this.elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        this.setLoading(true, "Uploading & Registering...");
        this.elements.dropZone.style.display = 'none';

        // Store the file for direct SAM uploads
        this.state.uploadedFile = file;

        // 1. Read locally for immediate display
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.state.currentImage = img;
                this.resizeCanvas();
                this.drawBaseImage();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);

        // 2. Upload to Backend (for run tracking / 3D generation)
        const formData = new FormData();
        formData.append('image', file);

        try {
            // NOTE: Using a generic endpoint for now, will map to backend later
            const response = await fetch('/api/runs', { method: 'POST', body: formData });
            const data = await response.json();

            if (data.ok) {
                this.state.currentJobId = data.run_id;
                this.showToast("Image Registered! Click objects to segment.", "success");
                this.elements.segmentBtn.disabled = false;
                this.elements.reconstructBtn.disabled = true; // Enable only after mask
            } else {
                throw new Error(data.detail || "Upload failed");
            }
        } catch (err) {
            console.error(err);
            this.showToast("Error uploading image: " + err.message, "error");
        } finally {
            this.setLoading(false);
        }
    },

    resizeCanvas() {
        if (!this.state.currentImage) return;

        const wrapper = document.getElementById('canvas-wrapper');
        const aspect = this.state.currentImage.width / this.state.currentImage.height;

        let w = wrapper.clientWidth;
        let h = w / aspect;

        if (h > window.innerHeight * 0.7) {
            h = window.innerHeight * 0.7;
            w = h * aspect;
        }

        this.elements.canvas.width = this.state.currentImage.width;
        this.elements.canvas.height = this.state.currentImage.height;
        this.elements.canvas.style.width = `${w}px`;
        this.elements.canvas.style.height = `${h}px`;

        this.elements.overlayCanvas.width = this.state.currentImage.width;
        this.elements.overlayCanvas.height = this.state.currentImage.height;
        this.elements.overlayCanvas.style.width = `${w}px`;
        this.elements.overlayCanvas.style.height = `${h}px`;
    },

    drawBaseImage() {
        const ctx = this.elements.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
        ctx.drawImage(this.state.currentImage, 0, 0);
    },

    async handleCanvasClick(e) {
        if (!this.state.uploadedFile || this.state.isProcessing) return;

        // Calculate clicked coordinates in image pixel space
        const rect = this.elements.canvas.getBoundingClientRect();
        const scaleX = this.elements.canvas.width / rect.width;
        const scaleY = this.elements.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        console.log(`Clicked at: ${x}, ${y}`);
        this.setLoading(true, "Segmenting...");

        try {
            const formData = new FormData();
            formData.append('image', this.state.uploadedFile);
            formData.append('x', x.toString());
            formData.append('y', y.toString());
            formData.append('run_id', this.state.currentJobId);

            const res = await fetch('/api/sam3d/segment-click', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.job_queued) {
                console.log("Job queued, entering polling loop...");
                this.pollForClickResult(data.job_id);
            } else if (data.polygon && data.polygon.length > 0) {
                this.addMask(data);
                this.showToast("Object Segmented!", "success");
                this.elements.reconstructBtn.disabled = false;
                this.setLoading(false);
            } else {
                this.showToast("No mask found. Try clicking on a different area.", "warning");
                this.setLoading(false);
            }

        } catch (err) {
            console.error(err);
            this.showToast("Error calling segmentation: " + err.message, "error");
            this.setLoading(false);
        }
    },

    async pollForClickResult(jobId) {
        const poll = async () => {
            try {
                const res = await fetch(`/api/runs/${jobId}/status`);
                const data = await res.json();

                if (data.status === 'COMPLETED') {
                    if (data.result && data.result.polygon) {
                        this.addMask(data.result);
                        this.showToast("Object Segmented!", "success");
                        this.elements.reconstructBtn.disabled = false;
                    } else {
                        this.showToast("Worker finished but no mask was found.", "warning");
                    }
                    this.setLoading(false);
                } else if (data.status === 'FAILED') {
                    this.showToast("Segmentation Failed: " + (data.result?.error || "Unknown error"), "error");
                    this.setLoading(false);
                } else {
                    // Still processing (PENDING, RUNNING)
                    setTimeout(poll, 1000);
                }
            } catch (e) {
                console.error("Click Poll Error", e);
                setTimeout(poll, 2000);
            }
        };
        poll();
    },

    addMask(maskData) {
        this.state.activeMaskId = maskData.mask_id;
        this.state.masks = [maskData]; // Single selection for now
        this.drawOverlays();
    },

    drawOverlays() {
        const ctx = this.elements.overlayCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.elements.overlayCanvas.width, this.elements.overlayCanvas.height);

        this.state.masks.forEach(mask => {
            if (mask.polygon && mask.polygon.length > 0) {
                ctx.beginPath();
                ctx.moveTo(mask.polygon[0][0], mask.polygon[0][1]);
                for (let i = 1; i < mask.polygon.length; i++) {
                    ctx.lineTo(mask.polygon[i][0], mask.polygon[i][1]);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(99, 102, 241, 0.4)'; // Indigo
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    },

    async triggerReconstruction() {
        const activeMask = this.state.masks.find(m => m.mask_id === this.state.activeMaskId);
        if (!activeMask || !activeMask.polygon) {
            this.showToast("Please segment an object first.", "warning");
            return;
        }

        this.setLoading(true, "Generating 3D Model (Worker)...");
        this.showToast("Task Sent to Worker", "info");

        try {
            const payload = {
                run_id: this.state.currentJobId,
                polygon: activeMask.polygon
            };

            const res = await fetch('/api/sam3d/reconstruct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.ok) {
                // Start Polling for Result
                this.pollFor3D(data.job_id); // Use the job_id returned by the backend
            } else {
                throw new Error(data.message || "Reconstruction Failed");
            }

        } catch (err) {
            console.error(err);
            this.showToast(err.message, "error");
            this.setLoading(false);
        }
    },

    async pollFor3D(jobId) {
        const poll = async () => {
            try {
                // Check status endpoint
                const res = await fetch(`/api/runs/${jobId}/generate-3d`, { method: 'POST' }); // Using existing check endpoint logic
                // Or better, a specific status endpoint

                // For now, let's assume if calling generate-3d returns ok=True and blend_available=True, we are good.
                // However, generate-3d is a trigger in the old API.
                // Let's rely on the config.js pattern or `get_run_status` in fastapi_main.py

                const statusRes = await fetch(`/api/runs/${jobId}/status`);
                const statusData = await statusRes.json();

                if (statusData.status === 'COMPLETED') {
                    this.setLoading(false);
                    this.showToast("3D Generation Complete!", "success");
                    this.addGeneratedModel(jobId);
                    this.toggleDrawer(true);
                } else if (statusData.status === 'FAILED') {
                    this.setLoading(false);
                    this.showToast("3D Generation Failed: " + statusData.error, "error");
                } else {
                    // Still processing
                    setTimeout(poll, 2000);
                }
            } catch (e) {
                console.error("Poll error", e);
                setTimeout(poll, 2000);
            }
        };
        poll();
    },

    addGeneratedModel(jobId) {
        // Create GLB URL
        const glbUrl = `/api/runs/${jobId}/download/glb`;

        // Check if already exists
        if (this.state.generatedModels.find(m => m.id === jobId)) return;

        this.state.generatedModels.push({ id: jobId, url: glbUrl });
        document.getElementById('drawer-empty-state').style.display = 'none';

        const card = document.createElement('div');
        card.className = 'model-card';
        card.innerHTML = `
            <div class="model-preview">
                 <model-viewer src="${glbUrl}" auto-rotate camera-controls style="width:100%; height:100%;" background-color="#000"></model-viewer>
            </div>
            <div class="model-info">
                <h3>Furniture Job: ${jobId.substring(0, 6)}...</h3>
                <div class="model-actions">
                    <a href="${glbUrl}" download class="btn-sm">⬇ GLB</a>
                    <a href="/api/runs/${jobId}/download/blend" download class="btn-sm">⬇ Blend</a>
                </div>
            </div>
        `;
        this.elements.drawerList.prepend(card);
    }
};

// Start App when DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
