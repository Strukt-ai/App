'use client'

import { useState } from 'react'
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
import { FloatingToolbar } from '@/components/layout/FloatingToolbar'
import { ContextToolbar } from '@/components/layout/ContextToolbar'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { PremiumModal } from '@/components/layout/PremiumModal'
import { FurnAIProcessingModal } from '@/components/layout/FurnAIProcessingModal'
import { FurnAIQueueModal } from '@/components/layout/FurnAIQueueModal'
import { GlobalToast } from '@/components/layout/GlobalToast'
import { WelcomeScreen } from '@/components/layout/WelcomeScreen'
import { ProjectsDashboard } from '@/components/layout/ProjectsDashboard'
import { useFloorplanStore } from '@/store/floorplanStore'

function App() {
  useKeyboardShortcuts()
  const showProcessingModal = useFloorplanStore(s => s.showProcessingModal)
  const showQueueModal = useFloorplanStore(s => s.showQueueModal)
  const setShowQueueModal = useFloorplanStore(s => s.setShowQueueModal)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showUpgradeCard, setShowUpgradeCard] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showDashboard, setShowDashboard] = useState(true)
  const projectsModalOpen = useFloorplanStore(s => s.projectsModalOpen)
  const setProjectsModalOpen = useFloorplanStore(s => s.setProjectsModalOpen)

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
            {/* Sidebar renders with its own mobile drawer via store */}
            <Sidebar onLogout={() => { setShowWelcome(true); setShowDashboard(true) }} />
            
            {/* Main Scene Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Scene />
              <FloatingToolbar />
              <ContextToolbar />
            </div>
            
            {/* RightSidebar renders with its own mobile drawer via store */}
            <RightSidebar />
            
            {/* Floating Upgrade Card */}
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
