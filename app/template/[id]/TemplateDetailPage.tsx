'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Sparkles } from 'lucide-react'
import { loadTemplateDetail, downloadTemplate, TemplateDetail } from '@/lib/templateService'
import { useFloorplanStore } from '@/store/floorplanStore'

interface TemplateDetailPageProps {
  templateId: string
}

export function TemplateDetailPage({ templateId }: TemplateDetailPageProps) {
  const router = useRouter()
  const [template, setTemplate] = useState<TemplateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true)
        setError(null)
        const detail = await loadTemplateDetail(templateId)
        if (!detail) {
          setError(`Template "${templateId}" not found`)
          return
        }
        setTemplate(detail)
      } catch (err) {
        console.error('Error loading template:', err)
        setError('Failed to load template')
      } finally {
        setLoading(false)
      }
    }

    loadTemplate()
  }, [templateId])

  const handleCreateDesign = async () => {
    if (!template) return

    try {
      setIsDownloading(true)

      // Download template in parallel
      downloadTemplate(templateId).catch((err) => {
        console.warn('Template download failed, continuing anyway:', err)
      })

      // Redirect to editor with template
      router.push(`/editor?template=${templateId}`)
    } catch (err) {
      console.error('Error creating design:', err)
      setError('Failed to create design')
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0c0d10]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-neutral-400">Loading template...</p>
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0c0d10]">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#12141a] p-8 text-center">
          <h2 className="text-xl font-semibold text-red-400">{error || 'Failed to load template'}</h2>
          <p className="text-sm text-neutral-400">The template you're looking for doesn't exist or couldn't be loaded.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0c0d10] text-neutral-100">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-white/5 bg-[#0c0d10] px-6 py-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{template.title}</h1>
          <p className="mt-1 text-sm text-neutral-400">{template.category}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col items-center justify-center border-r border-white/5 p-8"
        >
          <div className="w-full max-w-2xl">
            {template.preview ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12141a] shadow-xl">
                <img
                  src={template.preview}
                  alt={template.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-96 w-full items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-[#12141a]">
                <div className="text-center">
                  <p className="text-neutral-500">No preview available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md flex flex-col justify-between overflow-y-auto p-8"
        >
          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Description</h2>
              <p className="mt-2 text-base text-neutral-300">{template.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Room Type</p>
                <p className="mt-2 text-sm font-medium text-white">{template.roomType}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Size</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {template.sqft > 0 ? `${template.sqft} sqft` : 'Custom'}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Category</p>
              <div className="mt-2 flex gap-2">
                <span className="inline-block rounded-full bg-indigo-600/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                  {template.category}
                </span>
              </div>
            </div>

            {template.readyToUse && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Ready to Use
                </p>
                <p className="mt-1 text-xs text-emerald-200">This template is fully configured and ready for editing</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleCreateDesign}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isDownloading ? 'Creating Design...' : 'Create New Design'}
            </button>

            <button
              onClick={() => downloadTemplate(templateId)}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
