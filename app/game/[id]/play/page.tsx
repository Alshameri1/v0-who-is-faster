import type { Metadata } from 'next'
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
  
  return <GamePlayClient gameId={id} />
}
