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
  const [view, setView] = useState<'welcome' | 'dashboard' | 'editor'>('welcome')

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative">
      {/* 1. Welcome Screen (Login/Enter) */}
      {view === 'welcome' && (
        <WelcomeScreen onStart={() => setView('dashboard')} />
      )}

      {/* 2. Project Dashboard (Create New / Load Existing) */}
      {view === 'dashboard' && (
        <ProjectsDashboard
          onOpenEditor={() => setView('editor')}
          onLogout={() => setView('welcome')}
        />
      )}

      {/* 3. Editor */}
      {view === 'editor' && (
        <>
          <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
          <GlobalToast />
          <Topbar />
          <div className="flex flex-1 overflow-hidden relative">
            <Sidebar onLogout={() => setView('dashboard')} />
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
