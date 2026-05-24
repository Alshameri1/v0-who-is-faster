'use client'

import { ChallengeHero } from '@/components/challenge-hero'
import { PopupProvider } from '@/contexts/popup-context'
import { InfoModal } from '@/components/info-modal'
import { SetupModal } from '@/components/setup-modal'
import { PostSetupModal } from '@/components/post-setup-modal'
import { Toaster } from 'sonner'

export default function Page() {
  return (
    <PopupProvider>
      <main>
        <ChallengeHero />
        
        {/* Modals */}
        <InfoModal />
        <SetupModal />
        <PostSetupModal />
        
        {/* Toast notifications - RTL positioned */}
        <Toaster 
          position="top-center"
          dir="rtl"
          toastOptions={{
            style: {
              background: '#0f1f35',
              border: '1px solid #1e3a5f',
              color: '#fff',
            },
          }}
        />
      </main>
    </PopupProvider>
  )
}
