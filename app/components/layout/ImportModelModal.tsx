'use client'

import { useState } from 'react'
import { X, Upload, FileBox, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Update ImportModelModal to handle multiple files
interface ImportModelModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: (files: File[]) => void
}

export function ImportModelModal({ isOpen, onClose, onImport }: ImportModelModalProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFiles(Array.from(e.dataTransfer.files))
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFiles(Array.from(e.target.files))
        }
    }

    const validateAndSetFiles = (files: File[]) => {
        const validFiles: File[] = []
        files.forEach(file => {
            const ext = file.name.split('.').pop()?.toLowerCase()
            if (['glb', 'gltf', 'obj', 'fbx'].includes(ext || '')) {
                validFiles.push(file)
            }
        })

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles])
        }

        if (validFiles.length !== files.length) {
            alert("Some files were skipped. Only .glb, .gltf, .obj, .fbx are supported.")
        }
    }

    const handleSubmit = () => {
        if (selectedFiles.length > 0) {
            onImport(selectedFiles)
            onClose() // Close after import trigger
            setSelectedFiles([])
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[500px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                    <div className="flex items-center gap-2">
                        <FileBox className="w-5 h-5 text-blue-400" />
                        <h2 className="text-sm font-semibold text-white tracking-wide">Import 3D Asset</h2>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    {selectedFiles.length === 0 ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer relative group",
                                isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                            )}
                        >
                            <input
                                type="file"
                                accept=".glb,.gltf,.obj,.fbx"
                                multiple
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileSelect}
                            />

                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-8 h-8 text-blue-400" />
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-medium text-white mb-1">Click or drag files to upload</p>
                                <p className="text-xs text-white/40 font-mono">Supports Multiple GLB, OBJ, FBX</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center gap-6 animate-in fade-in">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium text-white mb-1">{selectedFiles.length} Files Selected</p>
                                <div className="max-h-24 overflow-y-auto px-4 custom-scrollbar">
                                    {selectedFiles.map((f, i) => (
                                        <p key={i} className="text-xs text-white/40 font-mono truncate max-w-[300px]">{f.name}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedFiles([])}
                                    className="text-xs text-red-400 hover:underline"
                                >
                                    Clear All
                                </button>
                                <label className="text-xs text-blue-400 hover:underline cursor-pointer">
                                    <span>Add More</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".glb,.gltf,.obj,.fbx"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selectedFiles.length === 0}
                        className={cn(
                            "px-6 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-lg",
                            selectedFiles.length > 0
                                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                                : "bg-white/10 text-white/30 cursor-not-allowed"
                        )}
                    >
                        Bring to Floorplan
                    </button>
                </div>
            </div>
        </div>
    )
}
