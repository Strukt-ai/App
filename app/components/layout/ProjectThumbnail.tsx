'use client'

import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { HardDrive, Image as ImageIcon, FileWarning } from 'lucide-react'

interface ProjectThumbnailProps {
    runId: string
    imagePath?: string
    token: string | null
    status?: string
}

export function ProjectThumbnail({ runId, imagePath, token, status }: ProjectThumbnailProps) {
    const [svgContent, setSvgContent] = useState<string | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [_error, setError] = useState(false)

    useEffect(() => {
        let active = true
        let objectUrl: string | null = null
        const controller = new AbortController()

        const loadThumbnail = async () => {
            // Always resolve loading state; token may arrive slightly later.
            if (!runId || !token) {
                if (active) setLoading(false)
                return
            }

            try {
                // 1. Try to fetch SVG (Best quality, shows edits)
                // If a run is still processing, the SVG might appear shortly after; retry a few times.
                const shouldRetrySvg = status !== 'FAILED'
                const maxAttempts = shouldRetrySvg ? 4 : 1
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    const svgRes = await fetch(`/api/runs/${runId}/svg?t=${Date.now()}_${attempt}`, {
                        cache: 'no-store',
                        signal: controller.signal,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Cache-Control': 'no-cache',
                        }
                    })

                    if (svgRes.ok && active) {
                        const text = await svgRes.text()
                        // Basic sanity check
                        if (text.includes('<svg')) {
                            setSvgContent(text)
                            setLoading(false)
                            return
                        }
                    }

                    // Auth issues: don't spin retry loops forever.
                    if (svgRes.status === 401 || svgRes.status === 403) {
                        break
                    }

                    if (attempt < maxAttempts - 1) {
                        await new Promise(r => setTimeout(r, 500))
                    }
                }

                // 2. Fallback to Input Image
                if (imagePath && active) {
                    // Extract filename from the absolute path provided by backend
                    // e.g., "C:\...\run_id\input_image.png" -> "input_image.png"
                    // Handle both Windows and Unix separators just in case
                    const filename = imagePath.split(/[\\/]/).pop()

                    if (filename) {
                        const imgRes = await fetch(`/api/runs/${runId}/assets/${filename}?t=${Date.now()}`, {
                            cache: 'no-store',
                            signal: controller.signal,
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Cache-Control': 'no-cache',
                            }
                        })

                        if (imgRes.ok && active) {
                            const blob = await imgRes.blob()
                            objectUrl = URL.createObjectURL(blob)
                            setImageUrl(objectUrl)
                            setLoading(false)
                            return
                        }
                    }
                }

                // If we get here, both failed
                if (active) setError(true)

            } catch (e) {
                if ((e as any)?.name === 'AbortError') return
                console.error("Thumbnail load failed", e)
                if (active) setError(true)
            } finally {
                if (active) setLoading(false)
            }
        }

        loadThumbnail()

        return () => {
            active = false
            controller.abort()
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [runId, imagePath, token, status])

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-secondary/10 animate-pulse">
                <HardDrive className="w-8 h-8 text-muted-foreground/20" />
            </div>
        )
    }

    if (svgContent) {
        // Sanitize SVG with DOMPurify — allows only safe SVG elements/attributes
        const clean = DOMPurify.sanitize(svgContent, {
            USE_PROFILES: { svg: true, svgFilters: true },
            ADD_TAGS: ['use'],
            ADD_ATTR: ['viewBox', 'preserveAspectRatio', 'xmlns', 'xmlns:xlink'],
            FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'embed', 'object'],
            FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
        })
        const sanitized = clean.replace(/<svg /, '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ')
        return (
            <div
                className="w-full h-full bg-white/5 p-2 overflow-hidden flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: sanitized }}
            />
        )
    }

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt="Project Thumbnail"
                className="w-full h-full object-cover"
            />
        )
    }

    // Fallback Icon
    return (
        <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-muted-foreground/30">
            {status === 'FAILED' ? <FileWarning className="w-10 h-10" /> : <ImageIcon className="w-10 h-10" />}
        </div>
    )
}
