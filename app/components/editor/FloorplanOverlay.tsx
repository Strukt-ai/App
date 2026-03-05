'use client'

import { useMemo } from 'react'
import { useFloorplanStore } from '@/store/floorplanStore'

export function FloorplanOverlay() {
    const { mode, currentRunId, runStatus } = useFloorplanStore()

    // Keep the SVG URL stable while the run is active to prevent reloading flashes
    const svgUrl = useMemo(() => `/api/runs/${currentRunId}/svg`, [currentRunId])

    // Only show when SVG is ready (completed status)
    if (mode !== '2d' || !currentRunId || runStatus !== 'completed') return null

    return (
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <img
                src={svgUrl}
                alt="Floorplan SVG"
                className="w-full h-full object-contain opacity-15 grayscale invert"
            />
        </div>
    )
}
