'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Scene } from '@/components/editor/Scene'
import { RenderGallery } from '@/components/editor/RenderGallery'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { FloatingUpgradeCard } from '@/components/layout/FloatingUpgradeCard'
import { PremiumModal } from '@/components/layout/PremiumModal'
import { FurnAIProcessingModal } from '@/components/layout/FurnAIProcessingModal' // New Import
import { FurnAIQueueModal } from '@/components/layout/FurnAIQueueModal' // New Import
import { GlobalToast } from '@/components/layout/GlobalToast' // New Import
import { WelcomeScreen } from '@/components/layout/WelcomeScreen' // New Import
import { useFloorplanStore } from '@/store/floorplanStore' // Import store

interface AppProps {
  /**
   * optional template id chosen from the landing page.  not used yet but
   * passed through so that future logic can bootstrap the workspace.
   */
  template?: string
}

function App({ template }: AppProps) {
  const { showProcessingModal, setShowProcessingModal, showQueueModal, setShowQueueModal } = useFloorplanStore() // Store hook
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showUpgradeCard, setShowUpgradeCard] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true) // Welcome State

  // if a template was supplied, you could open it automatically or
  // prepopulate some state here.  placeholder hook:
  // useEffect(() => { if (template) { /* loadTemplate(template) */ } }, [template])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground relative">
      {showWelcome && <WelcomeScreen onStart={() => setShowWelcome(false)} />}

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <GlobalToast />

      <Topbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar onLogout={() => setShowWelcome(true)} />
        <Scene />
        <RightSidebar />

        {/* Floating Card positioned within the main content area (over scene) */}
        {showUpgradeCard && (
          <FloatingUpgradeCard
            onUpgrade={() => setShowPremiumModal(true)}
            onClose={() => setShowUpgradeCard(false)}
          />
        )}
      </div>
      <RenderGallery />

      {/* Processing Popup */}
      <FurnAIProcessingModal
        isOpen={showProcessingModal}
      />

      {/* Queue/Offline Popup */}
      <FurnAIQueueModal
        isOpen={showQueueModal}
        onClose={() => setShowQueueModal(false)}
      />
    </div>
  )
}

export default App
