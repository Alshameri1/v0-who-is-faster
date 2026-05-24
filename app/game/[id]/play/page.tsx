import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { GamePlayClient } from './game-play-client'

export const metadata: Metadata = {
  title: 'من الأسرع - اللعب',
  description: 'ابدأ التحدي الآن!',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GamePlayPage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <>
      <GamePlayClient gameId={id} />
      <Toaster 
        position="top-center" 
        dir="rtl"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </>
  )
}
