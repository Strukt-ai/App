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

function App({ template }: AppProps) {
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


  if (isEditorFlow) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative">
        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
        <GlobalToast />
        <Topbar />
        <div className="flex flex-1 overflow-hidden relative w-full">
          <Sidebar onLogout={() => { setShowWelcome(true); setShowDashboard(true) }} />

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <RoomDesignerEmbedded />
            <ReferenceOverlay />
            <TutorialOverlay />
            <FloatingToolbar />
            <ContextToolbar />
          </div>

          <RightSidebar />

          {showUpgradeCard && (
            <FloatingUpgradeCard
              onUpgrade={() => setShowPremiumModal(true)}
              onClose={() => setShowUpgradeCard(false)}
            />
          )}
        </div>
        <RenderGallery />

        <FurnAIProcessingModal isOpen={showProcessingModal} />
        <FurnAIQueueModal isOpen={showQueueModal} onClose={() => setShowQueueModal(false)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative">
      {/* Welcome Screen */}
      {showWelcome && (
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      )}

      {/* Editor - always rendered after welcome */}
      {!showWelcome && (
        <>
          <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
          <GlobalToast />
          <Topbar />
          <div className="flex flex-1 overflow-hidden relative w-full">
            <Sidebar onLogout={() => { setShowWelcome(true); setShowDashboard(true) }} />

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <RoomDesignerEmbedded />
              <ReferenceOverlay />
              <TutorialOverlay />
              <FloatingToolbar />
              <ContextToolbar />
            </div>

            <RightSidebar />

            {showUpgradeCard && (
              <FloatingUpgradeCard
                onUpgrade={() => setShowPremiumModal(true)}
                onClose={() => setShowUpgradeCard(false)}
              />
            )}
          </div>
          <RenderGallery />

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

      {/* Modals */}
      <FurnAIProcessingModal isOpen={showProcessingModal} />
      <FurnAIQueueModal isOpen={showQueueModal} onClose={() => setShowQueueModal(false)} />
    </div>
  )
}

export default App
