"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, Clock, Star, Grid3X3, 
  Layout, Building2, Home, Layers, 
  ChevronRight, MoreHorizontal, Trash2, FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  title: string
  description: string
  category: string
  thumbnail?: string
  color: string
}

interface RecentProject {
  id: string
  name: string
  thumbnail?: string
  lastModified: string
}

export function TemplateGrid() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'templates' | 'projects'>('templates')
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])

  // Template definitions with categories
  const templates: Template[] = [
    // Blank
    { id: 'blank', title: 'Blank Canvas', description: 'Start from scratch', category: 'Blank', color: 'from-gray-500 to-gray-600' },
    // Residential
    { id: 'modern', title: 'Modern Living', description: 'Contemporary open floor plan', category: 'Residential', color: 'from-blue-500 to-blue-600' },
    { id: 'contemporary', title: 'Contemporary Home', description: 'Clean lines and natural light', category: 'Residential', color: 'from-emerald-500 to-emerald-600' },
    { id: 'minimalist', title: 'Minimalist Studio', description: 'Simple, functional space', category: 'Residential', color: 'from-zinc-500 to-zinc-600' },
    { id: 'loft', title: 'Urban Loft', description: 'Industrial chic style', category: 'Residential', 'color': 'from-amber-500 to-orange-600' },
    { id: 'traditional', title: 'Traditional House', description: 'Classic home layout', category: 'Residential', color: 'from-rose-500 to-pink-600' },
    // Commercial
    { id: 'office', title: 'Office Layout', description: 'Professional workspace', category: 'Commercial', color: 'from-indigo-500 to-indigo-600' },
    { id: 'retail', title: 'Retail Store', description: 'Shop floor plan', category: 'Commercial', color: 'from-violet-500 to-purple-600' },
    { id: 'restaurant', title: 'Restaurant', description: 'Dining layout', category: 'Commercial', color: 'from-cyan-500 to-teal-600' },
    // Specialty
    { id: 'hotel', title: 'Hotel Room', description: 'Hospitality layout', category: 'Specialty', color: 'from-slate-500 to-slate-600' },
    { id: 'apartment', title: 'Apartment Complex', description: 'Multi-unit building', category: 'Specialty', color: 'from-teal-500 to-emerald-600' },
    { id: 'warehouse', title: 'Warehouse', description: 'Industrial space', category: 'Specialty', color: 'from-neutral-500 to-stone-600' },
  ]

  const categories = ['All', 'Blank', 'Residential', 'Commercial', 'Specialty']

  // Filter templates based on search
  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openTemplate = (templateId: string) => {
    // Navigate to home page with template parameter
    // The App component will handle showing the editor
    router.push(`/?template=${templateId}`)
  }

  const createNewProject = () => {
    router.push('/?template=blank')
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Strukt AI</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search templates, projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Clock className="w-5 h-5 text-white/60" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Star className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pb-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'templates' 
                ? "bg-white/10 text-white" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Grid3X3 className="w-4 h-4 inline-block mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'projects' 
                ? "bg-white/10 text-white" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <FolderOpen className="w-4 h-4 inline-block mr-2" />
            Your Projects
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'templates' ? (
          <>
            {/* Category Pills */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    cat === 'All' 
                      ? "bg-white text-black" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Create New Button */}
            <button
              onClick={createNewProject}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Design</span>
            </button>

            {/* Templates Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => openTemplate(template.id)}
                  className="group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className={cn(
                    "relative aspect-[4/3] rounded-xl overflow-hidden mb-3",
                    "bg-gradient-to-br",
                    template.color
                  )}>
                    {/* Icon based on category */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {template.category === 'Residential' && <Home className="w-12 h-12 text-white/30" />}
                      {template.category === 'Commercial' && <Building2 className="w-12 h-12 text-white/30" />}
                      {template.category === 'Specialty' && <Layers className="w-12 h-12 text-white/30" />}
                      {template.category === 'Blank' && <Layout className="w-12 h-12 text-white/30" />}
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium">
                        Use Template
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-white/50">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/60">No templates found</h3>
                <p className="text-white/40">Try a different search term</p>
              </div>
            )}
          </>
        ) : (
          /* Projects Tab */
          <div>
            {/* Create New Button */}
            <button
              onClick={createNewProject}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Project</span>
            </button>

            {/* Projects Grid */}
            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/editor?project=${project.id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[4/3] rounded-xl bg-white/10 mb-3 flex items-center justify-center">
                      <Layout className="w-12 h-12 text-white/30" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-white/50">{project.lastModified}</p>
                      </div>
                      <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded">
                        <MoreHorizontal className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State for Projects */
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="w-10 h-10 text-white/30" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
                <p className="text-white/50 mb-6">Create your first design to get started</p>
                <button
                  onClick={createNewProject}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create Your First Design</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

