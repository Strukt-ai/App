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
import { useFloorplanStore } from '@/store/floorplanStore'

function App() {
  useKeyboardShortcuts()
  const showProcessingModal = useFloorplanStore(s => s.showProcessingModal)
  const showQueueModal = useFloorplanStore(s => s.showQueueModal)
  const setShowQueueModal = useFloorplanStore(s => s.setShowQueueModal)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showUpgradeCard, setShowUpgradeCard] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)

  // After welcome screen (login or guest), go straight to editor
  const handleWelcomeComplete = () => {
    setShowWelcome(false)
  }

  // Logout - go back to welcome
  const handleLogout = () => {
    setShowWelcome(true)
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative">
      {/* 1. Welcome Screen (Login/Enter) */}
      {showWelcome && <WelcomeScreen onStart={handleWelcomeComplete} />}

      {/* 2. Editor - After Welcome (login opens Projects modal automatically) */}
      {!showWelcome && (
        <>
          <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
          <GlobalToast />
          <Topbar />
          <div className="flex flex-1 overflow-hidden relative">
            <Sidebar onLogout={handleLogout} />
            <Scene />
            <FloatingToolbar />
            <ContextToolbar />
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
