'use client'

import { useEffect, useState } from 'react'
import { Trophy, Users, Clock, Zap, WifiOff } from 'lucide-react'
import type { GameSessionData } from '@/contexts/popup-context'

interface ResultPanelClientProps {
  gameId: string
}

/**
 * ResultPanelClient Component
 * Real-time results display panel for external screens
 * Fetches game data from localStorage and displays team scores
 */
export function ResultPanelClient({ gameId }: ResultPanelClientProps) {
  const [gameData, setGameData] = useState<GameSessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Attempt to load game data from localStorage
    const loadGameData = () => {
      if (typeof window === 'undefined') return

      try {
        const storedData = localStorage.getItem('game_session_data')
        if (!storedData) {
          setError('لم يتم العثور على بيانات اللعبة')
          setIsLoading(false)
          return
        }

        const parsedData: GameSessionData = JSON.parse(storedData)
        
        // Verify the game ID matches
        if (parsedData.gameId !== gameId) {
          setError('معرف اللعبة غير متطابق')
          setIsLoading(false)
          return
        }

        setGameData(parsedData)
        setIsLoading(false)
      } catch {
        setError('خطأ في تحميل بيانات اللعبة')
        setIsLoading(false)
      }
    }

    loadGameData()

    // Poll for updates (real-time sync simulation)
    const interval = setInterval(loadGameData, 2000)
    return () => clearInterval(interval)
  }, [gameId])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a1628]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#22b8cf] border-t-transparent" />
        <p className="mt-4 text-lg text-gray-400">جارٍ تحميل بيانات اللعبة...</p>
      </div>
    )
  }

  // Error state
  if (error || !gameData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a1628] p-6">
        <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <WifiOff className="mx-auto h-16 w-16 text-red-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">خطأ في الاتصال</h1>
          <p className="mt-2 text-gray-400">{error || 'لم يتم العثور على بيانات اللعبة'}</p>
          <p className="mt-4 text-sm text-gray-500">
            تأكد من أنك في نفس المتصفح الذي تم إنشاء اللعبة فيه
          </p>
          <p className="mt-2 font-mono text-xs text-gray-600" dir="ltr">
            Game ID: {gameId}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1f35] to-[#0a1628] p-6">
      {/* Header */}
      <header className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#22b8cf]/20 px-4 py-2 text-sm text-[#22b8cf]">
          <Zap className="h-4 w-4" />
          <span>لوحة النتائج المباشرة</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
          <span className="text-[#e63946]">من </span>
          <span className="text-[#22b8cf]">الأسرع؟</span>
        </h1>
      </header>

      {/* Scoreboard */}
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Team 1 */}
          <div className="overflow-hidden rounded-2xl border-2 border-[#22b8cf]/40 bg-[#22b8cf]/10">
            <div className="bg-[#22b8cf]/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#22b8cf]">{gameData.team1Data.name}</h2>
                <Trophy className="h-6 w-6 text-[#22b8cf]" />
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 text-center">
                <span className="text-6xl font-bold text-white">0</span>
                <span className="mr-2 text-2xl text-gray-400">نقطة</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{gameData.team1Data.players.length} متسابقين</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gameData.team1Data.players.map((player) => (
                    <span
                      key={player.id}
                      className="rounded-full bg-[#22b8cf]/20 px-3 py-1 text-sm text-[#22b8cf]"
                    >
                      {player.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="overflow-hidden rounded-2xl border-2 border-[#e63946]/40 bg-[#e63946]/10">
            <div className="bg-[#e63946]/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#e63946]">{gameData.team2Data.name}</h2>
                <Trophy className="h-6 w-6 text-[#e63946]" />
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 text-center">
                <span className="text-6xl font-bold text-white">0</span>
                <span className="mr-2 text-2xl text-gray-400">نقطة</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{gameData.team2Data.players.length} متسابقين</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gameData.team2Data.players.map((player) => (
                    <span
                      key={player.id}
                      className="rounded-full bg-[#e63946]/20 px-3 py-1 text-sm text-[#e63946]"
                    >
                      {player.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-8 rounded-xl border border-[#1e3a5f] bg-[#0c1628] p-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#f59e0b]" />
              <span>{gameData.rounds} جولات</span>
            </div>
            <div className="h-6 w-px bg-[#1e3a5f]" />
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#22b8cf]" />
              <span>{gameData.timePerPlayer} ثانية لكل متسابق</span>
            </div>
          </div>
        </div>

        {/* Game ID Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            معرف اللعبة: <span className="font-mono text-[#22b8cf]" dir="ltr">{gameId}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
