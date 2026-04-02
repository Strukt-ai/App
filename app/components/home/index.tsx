"use client"

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Home,
  LayoutDashboard,
  Play,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Settings,
  LogOut,
  UserCircle2,
  Camera,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFloorplanStore } from '@/store/floorplanStore'
import { VideoModal } from './VideoModal'
import { RenderGallery } from '@/components/editor/RenderGallery'

type TemplateTab = 'All' | 'Residential' | 'Commercial' | 'Specialty' | 'Blank'

interface Template {
  id: string
  title: string
  description: string
  category: Exclude<TemplateTab, 'All'>
  roomType: string
  sidebarCategory: string
  readyToUse?: boolean
  thumbnail: string
  sqft: number
}

const topTabs: TemplateTab[] = ['All', 'Residential', 'Commercial', 'Specialty', 'Blank']

const sidebarCategories = [
  'All Products',
  'Furniture',
  'For Walls/Ceiling',
  'Decor',
  'For Floor',
  'Paints',
  'Kitchen',
  'Lighting',
  'Bathroom',
  'Finishes',
  'Appliances',
] as const

const helperVideos = [
  { id: '1', title: 'Move Products', duration: '10 Sec', thumbnail: 'https://images.unsplash.com/photo-1616594039964-3f3b0f9ac2f0?auto=format&fit=crop&w=600&q=80' },
  { id: '2', title: 'Rotate Home', duration: '15 Sec', thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80' },
  { id: '3', title: 'Change Finishes', duration: '20 Sec', thumbnail: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=600&q=80' },
  { id: '4', title: 'Add Lighting', duration: '12 Sec', thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
]

export function TemplateGrid() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  const user = useFloorplanStore((state) => state.user)
  const setToken = useFloorplanStore((state) => state.setToken)
  const setUser = useFloorplanStore((state) => state.setUser)

  useEffect(() => {
    import('@/lib/templateService').then(({ loadAllTemplates }) => {
      loadAllTemplates().then((data) => {
        if (data && data.length > 0) {
          setTemplates(data as unknown as Template[])
        }
      })
    })
  }, [])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const [designsDropdownOpen, setDesignsDropdownOpen] = useState(false)
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<typeof helperVideos[0] | null>(null)

  const searchQuery = useFloorplanStore((state) => ((state as any).templateGridSearchQuery as string) ?? '')
  const activeTab = useFloorplanStore((state) => ((state as any).templateGridTab as TemplateTab) ?? 'All')
  const activeSidebarCategory = useFloorplanStore(
    (state) => ((state as any).templateGridSidebarCategory as string) ?? 'All Products'
  )

  const setSearchQuery = (query: string) => {
    useFloorplanStore.setState({ templateGridSearchQuery: query } as any)
  }

  const setActiveTab = (tab: TemplateTab) => {
    useFloorplanStore.setState({ templateGridTab: tab } as any)
    setDesignsDropdownOpen(false)
  }

  const setActiveSidebarCategory = (category: string) => {
    useFloorplanStore.setState({ templateGridSidebarCategory: category } as any)
    setProductsDropdownOpen(false)
  }

  const createNewProject = () => {
    router.push('/template/blank')
  }

  const openTemplate = (templateId: string) => {
    router.push(`/editor?template=${templateId}`)
  }

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return templates.filter((template) => {
      const matchesTopTab = activeTab === 'All' || template.category === activeTab
      const matchesSidebar = activeSidebarCategory === 'All Products' || template.sidebarCategory === activeSidebarCategory
      const matchesSearch =
        normalizedSearch.length === 0 ||
        template.title.toLowerCase().includes(normalizedSearch) ||
        template.description.toLowerCase().includes(normalizedSearch) ||
        template.roomType.toLowerCase().includes(normalizedSearch)

      return matchesTopTab && matchesSidebar && matchesSearch
    })
  }, [activeSidebarCategory, activeTab, searchQuery, templates])

  const displayName = user?.name?.trim() || 'there'
  const profileEmail = user?.email?.trim() || 'No email available'

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsProfileMenuOpen(false)
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0c0d10] text-neutral-100 font-sans">
      {/* Header Architecture */}
      <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#0c0d10] px-6">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer transition hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Home className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Struckt</span>
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            {/* Designs Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setDesignsDropdownOpen(!designsDropdownOpen); setProductsDropdownOpen(false) }}
                className={cn("flex items-center gap-1.5 text-sm font-medium transition", designsDropdownOpen ? "text-white" : "text-neutral-400 hover:text-white")}
              >
                Designs
                <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform", designsDropdownOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {designsDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-3 w-48 rounded-xl border border-white/10 bg-[#12141a] shadow-2xl"
                  >
                    <div className="p-1.5 flex flex-col gap-0.5">
                      {topTabs.map(tab => (
                        <button 
                          key={tab} 
                          onClick={() => setActiveTab(tab)}
                          className={cn("flex w-full items-center rounded-lg px-3 py-2 text-sm text-left transition", activeTab === tab ? "bg-indigo-600/10 text-indigo-400" : "text-neutral-300 hover:bg-white/5 hover:text-white")}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Products Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setProductsDropdownOpen(!productsDropdownOpen); setDesignsDropdownOpen(false) }}
                className={cn("flex items-center gap-1.5 text-sm font-medium transition", productsDropdownOpen ? "text-white" : "text-neutral-400 hover:text-white")}
              >
                Products
                <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform", productsDropdownOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {productsDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-3 w-56 rounded-xl border border-white/10 bg-[#12141a] shadow-2xl max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800"
                  >
                    <div className="p-1.5 flex flex-col gap-0.5">
                      {sidebarCategories.map(category => (
                        <button 
                          key={category} 
                          onClick={() => setActiveSidebarCategory(category)}
                          className={cn("flex w-full items-center rounded-lg px-3 py-2 text-sm text-left transition", activeSidebarCategory === category ? "bg-indigo-600/10 text-indigo-400" : "text-neutral-300 hover:bg-white/5 hover:text-white")}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative mx-4 hidden w-full max-w-2xl md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search for templates, products, and finishes..."
            className="h-10 w-full rounded-full border border-white/5 bg-white/5 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none transition hover:bg-white/10 focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => console.warn('Dashboard feature not yet implemented')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
          <button 
            onClick={() => console.warn('Shopping cart feature not yet implemented')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 transition hover:bg-white/10"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
            >
              <UserCircle2 className="h-6 w-6 text-indigo-400" />
              <span className="hidden text-sm font-medium text-neutral-200 sm:inline">{displayName}</span>
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-3 w-72 rounded-xl border border-white/10 bg-[#12141a] p-2 shadow-2xl"
                  role="menu"
                >
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Signed in as</p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="truncate text-xs text-neutral-400">{profileEmail}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      useFloorplanStore.getState().setRendersModalOpen(true)
                    }}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <Camera className="h-4 w-4" />
                    My Screenshots
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      router.push('/pricing')
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Manage account
                  </button>

                  <button
                    onClick={logout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Independently Scrollable Area */}
      <main className="flex-1 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-8 md:px-10 lg:py-12">
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Welcome back, {displayName}
          </motion.h1>

          {/* How to videos section */}
          <section className="mb-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">How to videos</h2>
              <button 
                onClick={() => {
                  setShowVideoModal(true)
                  setSelectedVideo(null)
                }}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
              >
                View All
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {helperVideos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedVideo(video)
                    setShowVideoModal(true)
                  }}
                  className="group relative flex w-[280px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#12141a] border border-white/5 transition hover:border-white/10"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141a]/80 via-black/20 to-transparent transition duration-300 group-hover:bg-black/40" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-indigo-600">
                        <Play className="h-5 w-5 ml-1" />
                      </div>
                    </div>

                    <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-neutral-300 group-hover:text-white transition">{video.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* GitHub Repositories Section */}
          <section className="mb-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">GitHub Repositories</h2>
              <button 
                onClick={() => router.push('/home')}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
              >
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Mock GitHub repos - replace with real data later */}
              {[
                {
                  id: 1,
                  name: 'strukt-ai-blueprint',
                  description: 'AI-powered floor planning and 3D design tool',
                  language: 'TypeScript',
                  stars: 42,
                  updated: '2 days ago'
                },
                {
                  id: 2,
                  name: 'floorplan-generator',
                  description: 'Generate floor plans from 2D sketches using ML',
                  language: 'Python',
                  stars: 28,
                  updated: '1 week ago'
                },
                {
                  id: 3,
                  name: '3d-model-viewer',
                  description: 'Web-based 3D model viewer with annotations',
                  language: 'JavaScript',
                  stars: 15,
                  updated: '3 days ago'
                }
              ].map((repo) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-xl bg-[#12141a] border border-white/5 p-4 transition hover:border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {repo.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition">
                          {repo.name}
                        </h3>
                        <p className="text-xs text-neutral-400">strukt-ai</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-300 mb-3 line-clamp-2">
                    {repo.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-xs text-neutral-400">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>{repo.language}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>⭐ {repo.stars}</span>
                    </div>
                    <span>Updated {repo.updated}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`https://github.com/strukt-ai/${repo.name}`, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition"
                    >
                      View on GitHub
                    </button>
                    <button
                      onClick={() => router.push(`/editor?repo=${repo.name}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Open in Editor
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* My Homes & Project Section */}
          <section>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-xl font-semibold text-white">My Homes</h2>
              <button
                onClick={() => router.push('/editor?template=blank')}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-200"
              >
                <Plus className="h-4 w-4" />
                Draw by myself
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              
              {/* Project/Template Cards */}

              {/* Project/Template Cards */}
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  whileHover={{ y: -4 }}
                  className="group flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#12141a] shadow-sm transition duration-300 hover:border-white/10 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-neutral-900">
                    <img
                      src={template.thumbnail}
                      alt={template.title}
                      className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-black/20 to-transparent" />
                    
                    {template.readyToUse && (
                      <span className="absolute left-3 top-3 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20 backdrop-blur-md">
                        Ready to Use
                      </span>
                    )}
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-neutral-200 backdrop-blur-md border border-white/5">
                        {template.roomType}
                      </span>
                      <span className="text-xs font-semibold text-neutral-400 drop-shadow-md">
                        {template.sqft ? `${template.sqft} sqft` : 'Various Sizes'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h4 className="text-base font-semibold text-white group-hover:text-indigo-400 transition">{template.title}</h4>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-400 flex-1">{template.description}</p>
                    
                    <button 
                      onClick={() => openTemplate(template.id)}
                      className="mt-5 flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition duration-300 group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-600/20"
                    >
                      Open Design
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))}

            </div>

            {filteredTemplates.length === 0 && (
              <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#12141a]/50 py-20">
                <Search className="h-10 w-10 text-neutral-600 mb-4" />
                <h4 className="text-lg font-medium text-neutral-300">No templates found</h4>
                <p className="mt-1 text-sm text-neutral-500">Try another search term.</p>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => {
          setShowVideoModal(false)
          setSelectedVideo(null)
        }}
        videos={helperVideos}
        selectedVideo={selectedVideo}
      />

      {/* Renders Dashboard Modal */}
      <RenderGallery />
    </div>
  )
}
