'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Video {
  id: string
  title: string
  duration: string
  thumbnail: string
  url?: string
}

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videos: Video[]
  selectedVideo?: Video | null
}

export function VideoModal({ isOpen, onClose, videos, selectedVideo = null }: VideoModalProps) {
  // If a specific video is selected, show full player modal
  if (selectedVideo) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-[#12141a] border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Video Container */}
              <div className="aspect-video w-full bg-black">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="h-full w-full object-cover"
                />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600/20 border-2 border-indigo-400 backdrop-blur-md">
                    <div className="h-0 w-0 border-l-12 border-r-6 border-t-8 border-b-8 border-l-indigo-400 border-r-transparent border-t-transparent border-b-transparent" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white">{selectedVideo.title}</h2>
                <p className="mt-2 text-sm text-neutral-400">{selectedVideo.duration}</p>
                <p className="mt-4 text-sm text-neutral-300">
                  Video content would be embedded here. This is a video player modal demonstrating the UI.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Otherwise, show grid of all videos
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl my-8 rounded-2xl overflow-hidden bg-[#12141a] border border-white/10 p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <h2 className="text-3xl font-bold text-white mb-8">How to Videos</h2>

            {/* Grid of Videos */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    // This will be handled by parent to switch to selectedVideo mode
                  }}
                  className="group relative flex flex-col overflow-hidden rounded-xl bg-[#12141a] border border-white/5 transition hover:border-white/10 cursor-pointer"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/20 border-2 border-indigo-400 backdrop-blur-md transition group-hover:scale-110 group-hover:bg-indigo-600">
                        <div className="h-0 w-0 border-l-8 border-r-4 border-t-6 border-b-6 border-l-white border-r-transparent border-t-transparent border-b-transparent ml-1" />
                      </div>
                    </div>

                    <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-white group-hover:text-indigo-400 transition">{video.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
