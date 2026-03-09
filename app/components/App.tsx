'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import dynamic from 'next/dynamic'

const Scene = dynamic(
  () => import('@/components/editor/Scene').then((mod) => mod.Scene),
  { ssr: false }
)
const RenderGallery = dynamic(
  () => import('@/components/editor/RenderGallery').then((mod) => mod.RenderGallery),
  { ssr: false }
)
import { RightSidebar } from '@/components/layout/RightSidebar'
import { FloatingUpgradeCard } from '@/components/layout/FloatingUpgradeCard'
import { PremiumModal } from '@/components/layout/PremiumModal'
import { FurnAIProcessingModal } from '@/components/layout/FurnAIProcessingModal'
import { FurnAIQueueModal } from '@/components/layout/FurnAIQueueModal'
import { GlobalToast } from '@/components/layout/GlobalToast'
import { WelcomeScreen } from '@/components/layout/WelcomeScreen'
import { TemplateGrid } from '@/components/TemplateGrid'
import { useFloorplanStore } from '@/store/floorplanStore'

function App() {
  const searchParams = useSearchParams()
  const template = searchParams.get('template')

  const showProcessingModal = useFloorplanStore(s => s.showProcessingModal)
  const setShowProcessingModal = useFloorplanStore(s => s.setShowProcessingModal)
  const showQueueModal = useFloorplanStore(s => s.showQueueModal)
  const setShowQueueModal = useFloorplanStore(s => s.setShowQueueModal)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showUpgradeCard, setShowUpgradeCard] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showTemplateGrid, setShowTemplateGrid] = useState(false)

  // Use useMemo to determine the current view - if template is in URL, go directly to editor
  const currentView = useMemo(() => {
    if (template) return 'editor'
    return null
  }, [template])

  // After welcome screen, show template grid (home screen)
  const handleWelcomeComplete = () => {
    setShowWelcome(false)
    setShowTemplateGrid(true)
  }

  // When user selects a template from template grid
  const handleTemplateSelect = () => {
    setShowTemplateGrid(false)
  }

  // Logout - go back to welcome
  const handleLogout = () => {
    setShowWelcome(true)
    setShowTemplateGrid(false)
  }

  // If template is in URL, skip welcome/template grid and show editor directly
  if (currentView === 'editor') {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative">
        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
        <GlobalToast />
        <Topbar />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar onLogout={handleLogout} />
          <Scene />
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
      {/* 1. Welcome Screen (Login/Enter) */}
      {showWelcome && <WelcomeScreen onStart={handleWelcomeComplete} />}

      {/* 2. Template Grid (Home Screen) - After Welcome */}
      {showTemplateGrid && <TemplateGrid />}

      {/* Editor - After Template Selection (no template in URL) */}
      {!showWelcome && !showTemplateGrid && (
        <>
          <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
          <GlobalToast />
          <Topbar />
          <div className="flex flex-1 overflow-hidden relative">
            <Sidebar onLogout={handleLogout} />
            <Scene />
            <RightSidebar />
            {showUpgradeCard && (
              <FloatingUpgradeCard
                onUpgrade={() => setShowPremiumModal(true)}
                onClose={() => setShowUpgradeCard(false)}
              />
            )}
          </div>
          <RenderGallery />
        </>
      )}

      {/* Modals */}
      <FurnAIProcessingModal isOpen={showProcessingModal} />
      <FurnAIQueueModal isOpen={showQueueModal} onClose={() => setShowQueueModal(false)} />
    </div>
  )
}

export default App

