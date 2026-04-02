'use client'

import { useFloorplanStore } from '@/store/floorplanStore'
import { useState } from 'react'
import { X, Download, Camera, Loader2, Maximize2, Trash2, Clock } from 'lucide-react'

function formatTimestamp(): string {
    const d = new Date()
    return d.toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export function RenderGallery() {
    const renders = useFloorplanStore(s => s.renders)
    const isRendering = useFloorplanStore(s => s.isRendering)
    const isOpen = useFloorplanStore(s => s.rendersModalOpen)
    const onClose = () => useFloorplanStore.getState().setRendersModalOpen(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    if (!isOpen) return null

    const downloadRender = (url: string, index: number, e: React.MouseEvent) => {
        e.stopPropagation()
        const link = document.createElement('a')
        link.href = url
        link.download = `StruktAI_Screenshot_${index + 1}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const downloadAllScreenshots = () => {
        renders.forEach((url, i) => {
            const link = document.createElement('a')
            link.href = url
            link.download = `StruktAI_Screenshot_${i + 1}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        })
    }

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in duration-200">
                <div className="w-[95vw] max-w-5xl bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-secondary/5">
                        <div className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">My Screenshots</h2>
                            {renders.length > 0 && (
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                    {renders.length}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {renders.length > 0 && (
                                <button
                                    onClick={downloadAllScreenshots}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-lg transition-colors"
                                    title="Download all screenshots"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download All Screenshots
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors ml-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-background/50">
                        {renders.length === 0 && !isRendering ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                                <Camera className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-lg font-medium">No screenshots yet.</p>
                                <p className="text-sm opacity-70 mt-1">Open the 3D editor and take a screenshot to see it here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {isRendering && (
                                    <div className="group relative border border-border/50 border-dashed rounded-xl overflow-hidden bg-secondary/10 flex flex-col items-center justify-center aspect-[4/3] animate-pulse">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                                        <p className="text-sm text-muted-foreground font-medium">Capturing...</p>
                                    </div>
                                )}
                                
                                {renders.map((url, i) => (
                                    <div
                                        key={url + i}
                                        onClick={() => setSelectedImage(url)}
                                        className="group relative border border-border/80 rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer bg-card hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col"
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-[4/3] bg-black/40 flex items-center justify-center relative overflow-hidden border-b border-border/50 group-hover:scale-[1.02] transition-transform duration-500">
                                            <img
                                                src={url}
                                                alt={`Screenshot ${i + 1}`}
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75"><rect fill="%23333" width="100" height="75"/><text x="50" y="40" text-anchor="middle" fill="%23666" font-size="10">Lost</text></svg>'
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-white/10 backdrop-blur-md rounded-full p-3 text-white">
                                                    <Maximize2 className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-3.5 bg-card/95 relative z-10">
                                            <div className="text-sm font-semibold truncate mb-2 text-foreground">
                                                Shot {String(i + 1).padStart(3, '0')}
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
                                                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="truncate">{formatTimestamp()}</span>
                                                </div>
                                                <div className="flex gap-1 border-t border-transparent">
                                                    <button
                                                        onClick={(e) => downloadRender(url, i, e)}
                                                        className="p-1.5 flex-shrink-0 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                                                        title="Download HQ"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newRenders = [...renders];
                                                            newRenders.splice(i, 1);
                                                            useFloorplanStore.setState({ renders: newRenders });
                                                        }}
                                                        className="p-1.5 flex-shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                        title="Delete Screenshot"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Maximized Fullscreen Image Modal - Overlayed higher */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent flex justify-end p-4 z-10">
                        <div className="flex items-center gap-3">
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = selectedImage;
                                    link.download = "StruktAI_Screenshot_HQ.png";
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                            >
                                <Download className="w-4 h-4" />
                                Save
                            </button>
                            <button
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                                onClick={() => setSelectedImage(null)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <img
                        src={selectedImage}
                        alt="Full render preview"
                        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-400"
                    />
                </div>
            )}
        </>
    )
}
