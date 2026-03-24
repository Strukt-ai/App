'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { FloatingUpgradeCard } from '@/components/layout/FloatingUpgradeCard'
import { PremiumModal } from '@/components/layout/PremiumModal'
import { FurnAIProcessingModal } from '@/components/layout/FurnAIProcessingModal'
import { FurnAIQueueModal } from '@/components/layout/FurnAIQueueModal'
import { GlobalToast } from '@/components/layout/GlobalToast'
import { WelcomeScreen } from '@/components/layout/WelcomeScreen'
import { useFloorplanStore } from '@/store/floorplanStore'
import dynamic from 'next/dynamic'

// Blueprint3D Room Designer - imported dynamically to avoid SSR issues
const RoomDesignerEmbedded = dynamic(
  () => import('@/components/editor/RoomDesignerEmbedded').then((mod) => mod.RoomDesignerEmbedded),
  { ssr: false, loading: () => <div className="flex items-center justify-center w-full h-full bg-slate-900">Loading 3D Editor...</div> }
)

interface AppProps {
  template?: string
}

function App({ template }: AppProps) {
  const { showProcessingModal, setShowProcessingModal, showQueueModal, setShowQueueModal } = useFloorplanStore()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showUpgradeCard, setShowUpgradeCard] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)

  // If welcome is shown, display welcome screen only
  if (showWelcome) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative">
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      </div>
    )
  }

  // Main editor view with Blueprint3D room designer
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative">
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <GlobalToast />

      <Topbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar onLogout={() => setShowWelcome(true)} />
        
        {/* Blueprint3D Room Designer replaces old Scene component */}
        <RoomDesignerEmbedded />
        
        <RightSidebar />

        {showUpgradeCard && (
          <FloatingUpgradeCard
            onUpgrade={() => setShowPremiumModal(true)}
            onClose={() => setShowUpgradeCard(false)}
          />
        )}
      </div>

      {/* Modals */}
      <FurnAIProcessingModal isOpen={showProcessingModal} />
      <FurnAIQueueModal isOpen={showQueueModal} onClose={() => setShowQueueModal(false)} />
    </div>
  )
}

export default App
