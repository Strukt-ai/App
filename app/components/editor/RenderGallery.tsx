'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import { useState } from 'react'
import { X, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RenderGallery() {
    const renders = useFloorplanStore(s => s.renders)
    const isRendering = useFloorplanStore(s => s.isRendering)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(true)

    if ((renders.length === 0 && !isRendering) || !isVisible) return null

    const downloadAllRenders = () => {
        renders.forEach((url, i) => {
            const link = document.createElement('a')
            link.href = url
            link.download = `render_${i + 1}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        })
    }

    const closeGallery = () => {
        setIsVisible(false)
    }

    return (
        <>
            {/* Render Gallery Panel */}
            <div className="fixed bottom-4 right-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-4 max-w-md animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        {isRendering && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        )}
                        Rendered Images
                    </h4>
                    <button
                        onClick={closeGallery}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {renders.map((url, i) => (
                        <div
                            key={url}
                            onClick={() => setSelectedImage(url)}
                            className={cn(
                                "relative aspect-video rounded-lg overflow-hidden cursor-pointer border border-border hover:border-primary transition-all",
                                "animate-in fade-in slide-in-from-bottom-2 duration-500"
                            )}
                            style={{ animationDelay: `${i * 200}ms` }}
                        >
                            <img
                                src={url}
                                alt={`Render ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75"><rect fill="%23333" width="100" height="75"/><text x="50" y="40" text-anchor="middle" fill="%23666" font-size="10">Render</text></svg>'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                                <span className="absolute bottom-2 left-2 text-[10px] text-white/80">
                                    View {i + 1}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Loading placeholders */}
                    {isRendering && renders.length < 4 && (
                        Array.from({ length: 4 - renders.length }).map((_, i) => (
                            <div
                                key={`loading-${i}`}
                                className="aspect-video rounded-lg bg-secondary/40 animate-pulse border border-dashed border-border flex items-center justify-center"
                            >
                                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                            </div>
                        ))
                    )}
                </div>

                {/* Action Buttons */}
                {renders.length > 0 && !isRendering && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex gap-2">
                        <button
                            onClick={downloadAllRenders}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-green-600 text-white text-[10px] font-semibold hover:bg-green-700 transition-all"
                        >
                            <Download className="w-3 h-3" />
                            Download All
                        </button>
                        <button
                            onClick={closeGallery}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-secondary text-foreground text-[10px] font-semibold hover:bg-secondary/80 transition-all"
                        >
                            <X className="w-3 h-3" />
                            Close
                        </button>
                    </div>
                )}
            </div>

            {/* Fullscreen Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full render"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    />
                </div>
            )}
        </>
    )
}
