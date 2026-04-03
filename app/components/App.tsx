'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { FloatingUpgradeCard } from '@/components/layout/FloatingUpgradeCard'
import { PremiumModal } from '@/components/layout/PremiumModal'
import { FurnAIProcessingModal } from '@/components/layout/FurnAIProcessingModal'
import { FurnAIQueueModal } from '@/components/layout/FurnAIQueueModal'
import { GlobalToast } from '@/components/layout/GlobalToast'
import { WelcomeScreen } from '@/components/layout/WelcomeScreen'
import { FloatingToolbar } from '@/components/layout/FloatingToolbar'
import { ContextToolbar } from '@/components/layout/ContextToolbar'
import { ProjectsDashboard } from '@/components/layout/ProjectsDashboard'
import { ReferenceOverlay } from '@/components/editor/ReferenceOverlay'
import { TutorialOverlay } from '@/components/editor/TutorialOverlay'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useFloorplanStore } from '@/store/floorplanStore'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Blueprint3D Room Designer - imported dynamically to avoid SSR issues
const RoomDesignerEmbedded = dynamic(
  () => import('@/components/editor/RoomDesignerEmbedded').then((mod) => mod.RoomDesignerEmbedded),
  { ssr: false, loading: () => <div className="flex items-center justify-center w-full h-full bg-slate-900">Loading 3D Editor...</div> }
)
const RenderGallery = dynamic(
  () => import('@/components/editor/RenderGallery').then((mod) => mod.RenderGallery),
  { ssr: false }
)

interface AppProps {
  template?: string
}

function App({ template: _template }: AppProps) {
  void _template
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const templateQuery = searchParams.get('template')
  const currentView = useMemo(() => {
    if (pathname === '/editor' || templateQuery) return 'editor'
    return null
  }, [pathname, templateQuery])

  const isEditorFlow = currentView === 'editor'

  useKeyboardShortcuts()
  const showProcessingModal = useFloorplanStore(s => s.showProcessingModal)
  const showQueueModal = useFloorplanStore(s => s.showQueueModal)
  const setShowQueueModal = useFloorplanStore(s => s.setShowQueueModal)
  const projectsModalOpen = useFloorplanStore(s => s.projectsModalOpen)
  const setProjectsModalOpen = useFloorplanStore(s => s.setProjectsModalOpen)
  const resetFloorplan = useFloorplanStore(s => s.resetFloorplan)
  const setUploadedImage = useFloorplanStore(s => s.setUploadedImage)
  const setCalibrationFactor = useFloorplanStore(s => s.setCalibrationFactor)
  const setMode = useFloorplanStore(s => s.setMode)
  const mode = useFloorplanStore(s => s.mode)
  const activeTool = useFloorplanStore(s => s.activeTool)
  const uploadedImage = useFloorplanStore(s => s.uploadedImage)
  const isCalibrated = useFloorplanStore(s => s.isCalibrated)
  const mobileSidebarOpen = useFloorplanStore(s => s.mobileSidebarOpen)
  const mobileRightSidebarOpen = useFloorplanStore(s => s.mobileRightSidebarOpen)
  const setMobileSidebarOpen = useFloorplanStore(s => s.setMobileSidebarOpen)
  const setMobileRightSidebarOpen = useFloorplanStore(s => s.setMobileRightSidebarOpen)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showUpgradeCard, setShowUpgradeCard] = useState(true)
  const [showWelcome, setShowWelcome] = useState(!isEditorFlow)
  const [showDashboard, setShowDashboard] = useState(true)

  useEffect(() => {
    if (isEditorFlow) {
      setShowWelcome(false)
      setShowDashboard(false)
    }
  }, [isEditorFlow])

  useEffect(() => {
    if (!templateQuery || templateQuery === 'blank') {
      if (templateQuery === 'blank') {
        resetFloorplan()
        setMode('2d')
      }
      return
    }

    let canceled = false

    import('@/lib/templateService').then(({ loadTemplateDetail }) => {
      if (canceled) return
      loadTemplateDetail(templateQuery).then((detail) => {
        if (!canceled && detail?.thumbnail) {
          const img = new window.Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            setUploadedImage(detail.thumbnail, img.naturalWidth, img.naturalHeight)
            setCalibrationFactor(0.05)
            setMode('2d')
          }
          img.onerror = (err) => {
            console.warn('Could not load template background image:', err)
          }
          img.src = detail.thumbnail
        }
      })
    }).catch((err) => {
      console.warn('Could not load template details:', err)
    })

    return () => {
      canceled = true
    }
  }, [templateQuery, resetFloorplan, setUploadedImage, setCalibrationFactor, setMode])

  useEffect(() => {
    if (!isEditorFlow) {
      setMobileSidebarOpen(false)
      setMobileRightSidebarOpen(false)
    }
  }, [isEditorFlow, setMobileRightSidebarOpen, setMobileSidebarOpen])

  const editorHint = useMemo(() => {
    if (mode === '3d') return 'Orbit, inspect, and render the scene from the framed preview stage.'
    switch (activeTool) {
      case 'wall':
        return 'Draw walls directly on the plan. Hold Shift for hard orthogonal lines.'
      case 'floor':
        return 'Block out rooms as clean rectangles, then refine from the inspector.'
      case 'ruler':
        return 'Select a wall and enter its real length to lock the plan scale.'
      case 'label':
        return 'Click a room or item to rename it and keep the layout readable.'
      case 'move':
        return 'Drag walls, rooms, and furniture into place.'
      default:
        return uploadedImage
          ? 'Work the 2D plan on the left and use the right inspector for context-sensitive controls.'
          : 'Upload a floorplan to start building. The editor keeps the canvas clear while controls stay docked.'
    }
  }, [activeTool, mode, uploadedImage])

  const editorShell = (
    <>
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <GlobalToast />
      <Topbar />
      <div className="relative flex flex-1 overflow-hidden">
        <button
          type="button"
          aria-label="Close editor panels"
          className={cn(
            "absolute inset-0 z-30 bg-slate-950/55 opacity-0 backdrop-blur-sm transition xl:hidden",
            (mobileSidebarOpen || mobileRightSidebarOpen) ? "pointer-events-auto opacity-100" : "pointer-events-none"
          )}
          onClick={() => {
            setMobileSidebarOpen(false)
            setMobileRightSidebarOpen(false)
          }}
        />

        <Sidebar onLogout={() => { setShowWelcome(true); setShowDashboard(true) }} />

        <div className="relative flex-1 min-w-0 overflow-hidden px-3 pb-3 pt-3 xl:px-4 xl:pb-4 xl:pt-4">
          <div className="relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.92),rgba(2,6,23,0.98)_65%),linear-gradient(180deg,rgba(15,23,42,0.18),rgba(2,6,23,0.75))] shadow-[0_35px_120px_rgba(2,6,23,0.55)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-slate-950/55 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-slate-950/60 to-transparent" />

            <div className="pointer-events-none absolute left-5 top-5 z-20 hidden max-w-[460px] rounded-2xl border border-white/10 bg-slate-950/58 px-4 py-3 text-slate-100 shadow-[0_16px_45px_rgba(2,6,23,0.4)] backdrop-blur-xl lg:block">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                  {mode === '3d' ? '3D Preview' : '2D Editor'}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300">
                  {activeTool === 'none' ? 'Idle' : activeTool}
                </span>
                <span className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
                  isCalibrated
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                    : "border-amber-400/20 bg-amber-400/10 text-amber-100"
                )}>
                  {isCalibrated ? 'Scale Synced' : 'Needs Calibration'}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-white">{uploadedImage ? 'Editor Workspace' : 'Start With A Reference'}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{editorHint}</p>
            </div>

            <div className="relative h-full overflow-hidden">
              <RoomDesignerEmbedded />
              <ReferenceOverlay />
              <TutorialOverlay />
              <FloatingToolbar />
              <ContextToolbar />

              {showUpgradeCard && (
                <FloatingUpgradeCard
                  className="bottom-5 left-5 right-auto"
                  onUpgrade={() => setShowPremiumModal(true)}
                  onClose={() => setShowUpgradeCard(false)}
                />
              )}
            </div>
          </div>
        </div>

        <RightSidebar />
      </div>
      <RenderGallery />

      <FurnAIProcessingModal isOpen={showProcessingModal} />
      <FurnAIQueueModal isOpen={showQueueModal} onClose={() => setShowQueueModal(false)} />
    </>
  )


  if (isEditorFlow) {
    return (
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.75),rgba(2,6,23,1)_58%)] text-foreground">
        {editorShell}
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.75),rgba(2,6,23,1)_58%)] text-foreground">
      {/* Welcome Screen */}
      {showWelcome && (
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      )}

      {/* Editor - always rendered after welcome */}
      {!showWelcome && (
        <>
          {editorShell}

          {/* Projects Dashboard - closable overlay */}
          {(showDashboard || projectsModalOpen) && (
            <ProjectsDashboard
              onOpenEditor={() => { setShowDashboard(false); setProjectsModalOpen(false) }}
              onClose={() => { setShowDashboard(false); setProjectsModalOpen(false) }}
              onLogout={() => { setShowWelcome(true); setShowDashboard(true); setProjectsModalOpen(false) }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
