window.SAM3D_CONFIG = {
  // Point to the FastAPI backend mounted at root
  backendBaseUrl: "", 
  
  // Endpoints (relative to backendBaseUrl)
  segmentEndpoint: "/api/sam3d/segment",
  clickEndpoint: "/api/sam3d/segment-click", 
  reconstructEndpoint: "/api/sam3d/reconstruct",
  
  // Worker Polling
  pollIntervalMs: 2000
};
