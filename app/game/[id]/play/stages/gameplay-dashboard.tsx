'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, SkipForward, Clock, Menu } from 'lucide-react'
import type { GameSessionData } from '@/contexts/popup-context'
import { PauseMenu } from '../components/pause-menu'

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
  onRestart: () => void
  isTieBreaker?: boolean
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
  onRestart,
  isTieBreaker = false,
}: GameplayDashboardProps) {
  // Dual independent timers - milliseconds for precision
  const [team1TimeMs, setTeam1TimeMs] = useState(sessionData.timePerPlayer * 1000)
  const [team2TimeMs, setTeam2TimeMs] = useState(sessionData.timePerPlayer * 1000)
  const [isPaused, setIsPaused] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Ref for precise interval timing
  const lastTickRef = useRef<number>(Date.now())
  const animationFrameRef = useRef<number | null>(null)
  const roundEndedRef = useRef(false)

  // Get current active timer based on turn
  const activeTimeMs = playState.currentTeamTurn === 1 ? team1TimeMs : team2TimeMs

  // Pause when menu opens
  useEffect(() => {
    if (isMenuOpen) {
      setIsPaused(true)
    }
  }, [isMenuOpen])

  // Handle menu close - resume timer
  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false)
    setIsPaused(false)
  }, [])

  // Handle round end when timer hits 0
  useEffect(() => {
    if (team1TimeMs <= 0 && !roundEndedRef.current) {
      roundEndedRef.current = true
      onRoundEnd(2) // Team 1's timer hit 0 - Team 2 wins
    }
    if (team2TimeMs <= 0 && !roundEndedRef.current) {
      roundEndedRef.current = true
      onRoundEnd(1) // Team 2's timer hit 0 - Team 1 wins
    }
  }, [team1TimeMs, team2TimeMs, onRoundEnd])

  // Precision countdown using requestAnimationFrame
  useEffect(() => {
    if (isPaused || roundEndedRef.current) return

    const tick = () => {
      if (roundEndedRef.current) return
      
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      // Only decrement the active team's timer
      if (playState.currentTeamTurn === 1) {
        setTeam1TimeMs(prev => {
          const newTime = prev - delta
          return Math.max(0, newTime)
        })
      } else {
        setTeam2TimeMs(prev => {
          const newTime = prev - delta
          return Math.max(0, newTime)
        })
      }

      animationFrameRef.current = requestAnimationFrame(tick)
    }

    lastTickRef.current = Date.now()
    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPaused, playState.currentTeamTurn])

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

  // Handle skip - subtract 5 seconds penalty from ACTIVE team's timer, toggle turn
  const handleSkip = useCallback(() => {
    if (playState.currentTeamTurn === 1) {
      setTeam1TimeMs(prev => Math.max(0, prev - 5000))
    } else {
      setTeam2TimeMs(prev => Math.max(0, prev - 5000))
    }
    changeImage()
    onSkip()
  }, [changeImage, onSkip, playState.currentTeamTurn])

  // Format time display (show seconds with one decimal)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, ms / 1000)
    const seconds = Math.floor(totalSeconds)
    const tenths = Math.floor((totalSeconds - seconds) * 10)
    return `${seconds}.${tenths}`
  }

  // Time warning states for each team
  const team1Seconds = team1TimeMs / 1000
  const team2Seconds = team2TimeMs / 1000
  const team1Warning = team1Seconds <= 10
  const team1Critical = team1Seconds <= 5
  const team2Warning = team2Seconds <= 10
  const team2Critical = team2Seconds <= 5

  // Get current matched players
  const { team1Player, team2Player } = playState.matchedPlayers

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0c1628]">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-4 left-4 z-50 p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
        aria-label="قائمة الإيقاف"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Pause Menu Sidebar */}
      <PauseMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onRestart={onRestart}
        gameId={sessionData.gameId}
      />

      {/* Tie-breaker indicator */}
      {isTieBreaker && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
          <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500 rounded-full animate-pulse">
            <span className="text-yellow-400 font-bold text-sm">الجولة الحاسمة الفاصلة</span>
          </div>
        </div>
      )}

      {/* Miniaturized Header - Dual Team Timers */}
      <header className="flex-shrink-0 px-4 py-2 md:px-6 md:py-3 mt-14">
        <div className="flex items-center justify-between w-full gap-2 md:gap-4">
          {/* Team 1 Score & Timer */}
          <div 
            className={`flex flex-col items-center gap-1 px-3 py-2 md:px-4 md:py-2 rounded-xl transition-all duration-300 ${
              playState.currentTeamTurn === 1 
                ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]' 
                : 'bg-cyan-500/10 border border-cyan-400/30 opacity-60'
            }`}
          >
            <span className={`text-xs md:text-sm font-medium ${playState.currentTeamTurn === 1 ? 'text-cyan-300' : 'text-cyan-400/60'}`}>
              {sessionData.team1Data.name}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xl md:text-2xl font-black ${playState.currentTeamTurn === 1 ? 'text-white' : 'text-white/60'}`}>
                {playState.team1Score}
              </span>
              {/* Team 1 Timer */}
              <div 
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  team1Critical 
                    ? 'bg-red-500/30 animate-pulse' 
                    : team1Warning
                      ? 'bg-yellow-500/20'
                      : 'bg-white/10'
                }`}
              >
                <Clock className={`w-3 h-3 ${
                  team1Critical ? 'text-red-400' : team1Warning ? 'text-yellow-400' : 'text-white/60'
                }`} />
                <span 
                  className={`text-sm font-mono font-bold tabular-nums ${
                    team1Critical ? 'text-red-400' : team1Warning ? 'text-yellow-400' : 'text-white/80'
                  }`}
                >
                  {formatTime(team1TimeMs)}
                </span>
              </div>
            </div>
            {playState.currentTeamTurn === 1 && team1Player && (
              <span className="text-xs text-cyan-300">
                {team1Player.name}
              </span>
            )}
          </div>

          {/* Center - VS indicator */}
          <div className="flex flex-col items-center">
            <span className="text-white/40 text-xs font-bold">VS</span>
            <div className="mt-1 flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                playState.currentTeamTurn === 1 ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-400/30'
              }`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                playState.currentTeamTurn === 2 ? 'bg-red-400 animate-pulse' : 'bg-red-400/30'
              }`} />
            </div>
          </div>

          {/* Team 2 Score & Timer */}
          <div 
            className={`flex flex-col items-center gap-1 px-3 py-2 md:px-4 md:py-2 rounded-xl transition-all duration-300 ${
              playState.currentTeamTurn === 2 
                ? 'bg-red-500/20 border-2 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.4)]' 
                : 'bg-red-500/10 border border-red-400/30 opacity-60'
            }`}
          >
            <span className={`text-xs md:text-sm font-medium ${playState.currentTeamTurn === 2 ? 'text-red-300' : 'text-red-400/60'}`}>
              {sessionData.team2Data.name}
            </span>
            <div className="flex items-center gap-2">
              {/* Team 2 Timer */}
              <div 
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  team2Critical 
                    ? 'bg-red-500/30 animate-pulse' 
                    : team2Warning
                      ? 'bg-yellow-500/20'
                      : 'bg-white/10'
                }`}
              >
                <Clock className={`w-3 h-3 ${
                  team2Critical ? 'text-red-400' : team2Warning ? 'text-yellow-400' : 'text-white/60'
                }`} />
                <span 
                  className={`text-sm font-mono font-bold tabular-nums ${
                    team2Critical ? 'text-red-400' : team2Warning ? 'text-yellow-400' : 'text-white/80'
                  }`}
                >
                  {formatTime(team2TimeMs)}
                </span>
              </div>
              <span className={`text-xl md:text-2xl font-black ${playState.currentTeamTurn === 2 ? 'text-white' : 'text-white/60'}`}>
                {playState.team2Score}
              </span>
            </div>
            {playState.currentTeamTurn === 2 && team2Player && (
              <span className="text-xs text-red-300">
                {team2Player.name}
              </span>
            )}
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

            {/* Paused overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-2xl text-yellow-400 font-bold animate-pulse">اللعبة متوقفة مؤقتاً</span>
              </div>
            )}

            {/* Decorative corner accents */}
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-lg pointer-events-none" />
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-lg pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-lg pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-lg pointer-events-none" />

            {/* Round indicator overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white/80 text-xs font-medium">
                {isTieBreaker ? 'جولة فاصلة' : `الجولة ${playState.currentRound} / ${sessionData.rounds}`}
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
              disabled={isPaused}
              className="w-[20%] flex items-center justify-center gap-1 md:gap-2 py-3 md:py-4 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-500/50 text-white text-sm md:text-lg font-bold rounded-xl md:rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">تجاوز</span>
              <span className="text-[10px] md:text-xs opacity-60 hidden md:inline">(-5ث)</span>
            </button>

            {/* Correct answer button - 80% width */}
            <button
              onClick={handleCorrect}
              disabled={isPaused}
              className="w-[80%] flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-gradient-to-b from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base md:text-xl font-bold rounded-xl md:rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30"
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
