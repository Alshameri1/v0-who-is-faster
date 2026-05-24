'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, SkipForward, Clock } from 'lucide-react'
import type { GameSessionData } from '@/contexts/popup-context'

interface GamePlayState {
  currentRound: number
  team1Score: number
  team2Score: number
  currentTeamTurn: 1 | 2
  selectedCategory: string | null
  matchedPlayers: {
    team1Player: { id: string; name: string } | null
    team2Player: { id: string; name: string } | null
  }
  usedPlayersTeam1: string[]
  usedPlayersTeam2: string[]
}

interface GameplayDashboardProps {
  sessionData: GameSessionData
  playState: GamePlayState
  onCorrectAnswer: () => void
  onSkip: () => void
  onRoundEnd: (winningTeam: 1 | 2) => void
}

// Mock image URLs for dynamic loading
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=800&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
]

export function GameplayDashboard({
  sessionData,
  playState,
  onCorrectAnswer,
  onSkip,
  onRoundEnd,
}: GameplayDashboardProps) {
  // Timer state - milliseconds for precision
  const [timeLeftMs, setTimeLeftMs] = useState(sessionData.timePerPlayer * 1000)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Ref for precise interval timing
  const lastTickRef = useRef<number>(Date.now())
  const animationFrameRef = useRef<number | null>(null)

  // Precision countdown using requestAnimationFrame
  useEffect(() => {
    if (!isTimerRunning || timeLeftMs <= 0) return

    const tick = () => {
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      setTimeLeftMs(prev => {
        const newTime = prev - delta
        if (newTime <= 0) {
          setIsTimerRunning(false)
          // Team whose turn it is loses when timer hits 0
          // Winning team is the OTHER team
          const winningTeam: 1 | 2 = playState.currentTeamTurn === 1 ? 2 : 1
          onRoundEnd(winningTeam)
          return 0
        }
        return newTime
      })

      animationFrameRef.current = requestAnimationFrame(tick)
    }

    lastTickRef.current = Date.now()
    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isTimerRunning, playState.currentTeamTurn, onRoundEnd])

  // Change image to a random different one
  const changeImage = useCallback(() => {
    setCurrentImageIndex(prev => {
      let newIndex = Math.floor(Math.random() * MOCK_IMAGES.length)
      while (newIndex === prev && MOCK_IMAGES.length > 1) {
        newIndex = Math.floor(Math.random() * MOCK_IMAGES.length)
      }
      return newIndex
    })
  }, [])

  // Handle correct answer - change image, toggle turn, NO timer reset
  const handleCorrect = useCallback(() => {
    changeImage()
    onCorrectAnswer()
  }, [changeImage, onCorrectAnswer])

  // Handle skip - subtract 5 seconds penalty, change image, keep same turn
  const handleSkip = useCallback(() => {
    setTimeLeftMs(prev => Math.max(0, prev - 5000)) // -5 second penalty
    changeImage()
    onSkip()
  }, [changeImage, onSkip])

  // Format time display (show seconds with one decimal)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, ms / 1000)
    const seconds = Math.floor(totalSeconds)
    const tenths = Math.floor((totalSeconds - seconds) * 10)
    return `${seconds}.${tenths}`
  }

  // Time warning states
  const timeSeconds = timeLeftMs / 1000
  const showTimeWarning = timeSeconds <= 10
  const showTimeCritical = timeSeconds <= 5

  // Get current matched players
  const { team1Player, team2Player } = playState.matchedPlayers

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0c1628]">
      {/* Miniaturized Header - Team scores */}
      <header className="flex-shrink-0 px-4 py-2 md:px-6 md:py-3">
        <div className="flex items-center justify-between w-full gap-2 md:gap-4">
          {/* Team 1 Score - Compact */}
          <div 
            className={`flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all duration-300 ${
              playState.currentTeamTurn === 1 
                ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                : 'bg-cyan-500/10 border border-cyan-400/30'
            }`}
          >
            <span className={`text-xs md:text-sm font-medium ${playState.currentTeamTurn === 1 ? 'text-cyan-300' : 'text-cyan-400/60'}`}>
              {sessionData.team1Data.name}
            </span>
            <span className={`text-xl md:text-2xl font-black ${playState.currentTeamTurn === 1 ? 'text-white' : 'text-white/60'}`}>
              {playState.team1Score}
            </span>
            {playState.currentTeamTurn === 1 && team1Player && (
              <span className="hidden sm:inline text-xs text-cyan-300 border-r border-cyan-400/30 pr-2 mr-1">
                {team1Player.name}
              </span>
            )}
          </div>

          {/* Center - Timer */}
          <div 
            className={`flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full transition-all duration-200 ${
              showTimeCritical 
                ? 'bg-red-500/30 border-2 border-red-500 animate-pulse' 
                : showTimeWarning
                  ? 'bg-yellow-500/20 border-2 border-yellow-500'
                  : 'bg-white/10 border border-white/20'
            }`}
          >
            <Clock className={`w-4 h-4 md:w-5 md:h-5 ${
              showTimeCritical ? 'text-red-400' : showTimeWarning ? 'text-yellow-400' : 'text-white/60'
            }`} />
            <span 
              className={`text-2xl md:text-3xl font-mono font-bold tabular-nums ${
                showTimeCritical ? 'text-red-400' : showTimeWarning ? 'text-yellow-400' : 'text-white'
              }`}
            >
              {formatTime(timeLeftMs)}
            </span>
          </div>

          {/* Team 2 Score - Compact */}
          <div 
            className={`flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all duration-300 ${
              playState.currentTeamTurn === 2 
                ? 'bg-red-500/20 border border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.3)]' 
                : 'bg-red-500/10 border border-red-400/30'
            }`}
          >
            {playState.currentTeamTurn === 2 && team2Player && (
              <span className="hidden sm:inline text-xs text-red-300 border-l border-red-400/30 pl-2 ml-1">
                {team2Player.name}
              </span>
            )}
            <span className={`text-xs md:text-sm font-medium ${playState.currentTeamTurn === 2 ? 'text-red-300' : 'text-red-400/60'}`}>
              {sessionData.team2Data.name}
            </span>
            <span className={`text-xl md:text-2xl font-black ${playState.currentTeamTurn === 2 ? 'text-white' : 'text-white/60'}`}>
              {playState.team2Score}
            </span>
          </div>
        </div>

        {/* Turn indicator bar */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            playState.currentTeamTurn === 1 ? 'bg-cyan-400' : 'bg-cyan-400/20'
          }`} />
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            playState.currentTeamTurn === 1 ? 'bg-cyan-500 text-white' : 'bg-red-500 text-white'
          }`}>
            دور: {playState.currentTeamTurn === 1 ? sessionData.team1Data.name : sessionData.team2Data.name}
          </span>
          <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            playState.currentTeamTurn === 2 ? 'bg-red-400' : 'bg-red-400/20'
          }`} />
        </div>
      </header>

      {/* Main Content - Image takes maximum space */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 md:px-6 md:py-3 min-h-0">
        {/* Category badge */}
        {playState.selectedCategory && (
          <div className="flex-shrink-0 mb-2 md:mb-3">
            <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-300 text-xs md:text-sm font-medium">
              {playState.selectedCategory}
            </span>
          </div>
        )}

        {/* Image container - Takes maximum available space */}
        <div className="flex-1 w-full max-w-4xl flex items-center justify-center min-h-0">
          <div 
            className="relative w-full h-full max-h-full rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-white/5 to-white/10"
            style={{ aspectRatio: '16/9', maxWidth: '100%', maxHeight: '100%' }}
          >
            {/* Actual image */}
            <img
              src={MOCK_IMAGES[currentImageIndex]}
              alt="تحدي"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              crossOrigin="anonymous"
            />

            {/* Decorative corner accents */}
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-lg pointer-events-none" />
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-lg pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-lg pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-lg pointer-events-none" />

            {/* Round indicator overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white/80 text-xs font-medium">
                الجولة {playState.currentRound} / {sessionData.rounds}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Action buttons with exact width ratio */}
      <footer className="flex-shrink-0 px-4 py-3 md:px-6 md:py-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* Button wrapper - matches image width */}
          <div className="flex items-stretch gap-2 md:gap-3 w-full">
            {/* Skip button - 20% width */}
            <button
              onClick={handleSkip}
              className="w-[20%] flex items-center justify-center gap-1 md:gap-2 py-3 md:py-4 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 border border-gray-500/50 text-white text-sm md:text-lg font-bold rounded-xl md:rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">تجاوز</span>
              <span className="text-[10px] md:text-xs opacity-60 hidden md:inline">(-5ث)</span>
            </button>

            {/* Correct answer button - 80% width */}
            <button
              onClick={handleCorrect}
              className="w-[80%] flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-gradient-to-b from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-base md:text-xl font-bold rounded-xl md:rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30"
            >
              <Check className="w-5 h-5 md:w-6 md:h-6" />
              <span>إجابة صحيحة</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
