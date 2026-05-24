'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, SkipForward, Clock, Users } from 'lucide-react'
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
}

export function GameplayDashboard({
  sessionData,
  playState,
  onCorrectAnswer,
  onSkip,
}: GameplayDashboardProps) {
  const [timeLeft, setTimeLeft] = useState(sessionData.timePerPlayer)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [showTimeWarning, setShowTimeWarning] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          // Auto-skip when time runs out
          onSkip()
          return 0
        }
        // Show warning at 5 seconds
        if (prev <= 6) setShowTimeWarning(true)
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimerRunning, timeLeft, onSkip])

  // Reset timer when turn changes
  useEffect(() => {
    setTimeLeft(sessionData.timePerPlayer)
    setIsTimerRunning(true)
    setShowTimeWarning(false)
  }, [playState.currentTeamTurn, sessionData.timePerPlayer])

  const handleCorrect = useCallback(() => {
    setIsTimerRunning(false)
    onCorrectAnswer()
  }, [onCorrectAnswer])

  const handleSkip = useCallback(() => {
    setIsTimerRunning(false)
    onSkip()
  }, [onSkip])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get current player name
  const currentPlayer = playState.currentTeamTurn === 1
    ? playState.matchedPlayers.team1Player
    : playState.matchedPlayers.team2Player

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Team scores and turn indicator */}
      <header className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Team 1 Score */}
          <div 
            className={`flex-1 max-w-xs transition-all duration-300 ${
              playState.currentTeamTurn === 1 ? 'scale-105' : 'opacity-70'
            }`}
          >
            <div 
              className={`bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 border-2 rounded-2xl p-4 text-center ${
                playState.currentTeamTurn === 1 ? 'border-cyan-400' : 'border-cyan-400/30'
              }`}
              style={{
                boxShadow: playState.currentTeamTurn === 1 ? '0 0 30px rgba(34, 211, 238, 0.3)' : 'none',
              }}
            >
              <p className="text-cyan-400 text-sm font-medium mb-1">{sessionData.team1Data.name}</p>
              <p className="text-4xl md:text-5xl font-black text-white">{playState.team1Score}</p>
            </div>
          </div>

          {/* Center - Turn indicator */}
          <div className="flex-shrink-0">
            <div 
              className={`px-4 py-2 rounded-full text-white text-sm md:text-base font-bold transition-colors duration-300 ${
                playState.currentTeamTurn === 1 
                  ? 'bg-cyan-500' 
                  : 'bg-red-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                دور: {playState.currentTeamTurn === 1 ? sessionData.team1Data.name : sessionData.team2Data.name}
              </span>
            </div>

            {/* Category badge */}
            {playState.selectedCategory && (
              <div className="mt-2 text-center">
                <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-300 text-xs font-medium">
                  {playState.selectedCategory}
                </span>
              </div>
            )}
          </div>

          {/* Team 2 Score */}
          <div 
            className={`flex-1 max-w-xs transition-all duration-300 ${
              playState.currentTeamTurn === 2 ? 'scale-105' : 'opacity-70'
            }`}
          >
            <div 
              className={`bg-gradient-to-r from-red-500/20 to-red-600/10 border-2 rounded-2xl p-4 text-center ${
                playState.currentTeamTurn === 2 ? 'border-red-400' : 'border-red-400/30'
              }`}
              style={{
                boxShadow: playState.currentTeamTurn === 2 ? '0 0 30px rgba(248, 113, 113, 0.3)' : 'none',
              }}
            >
              <p className="text-red-400 text-sm font-medium mb-1">{sessionData.team2Data.name}</p>
              <p className="text-4xl md:text-5xl font-black text-white">{playState.team2Score}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Image placeholder and timer */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        {/* Current player display */}
        {currentPlayer && (
          <div className="mb-6 text-center">
            <p className="text-white/60 text-sm mb-1">اللاعب الحالي</p>
            <p 
              className={`text-2xl md:text-3xl font-bold ${
                playState.currentTeamTurn === 1 ? 'text-cyan-400' : 'text-red-400'
              }`}
            >
              {currentPlayer.name}
            </p>
          </div>
        )}

        {/* Timer */}
        <div 
          className={`mb-8 flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
            showTimeWarning 
              ? 'bg-red-500/20 border-2 border-red-500 animate-pulse' 
              : 'bg-white/10 border-2 border-white/20'
          }`}
        >
          <Clock className={`w-6 h-6 ${showTimeWarning ? 'text-red-400' : 'text-white/60'}`} />
          <span 
            className={`text-3xl md:text-4xl font-mono font-bold ${
              showTimeWarning ? 'text-red-400' : 'text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Image placeholder container */}
        <div className="w-full max-w-2xl aspect-video bg-gradient-to-br from-white/5 to-white/10 border-2 border-white/20 rounded-3xl flex items-center justify-center mb-8 relative overflow-hidden">
          {/* Placeholder content */}
          <div className="text-center p-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/60 text-lg">منطقة عرض الصورة</p>
            <p className="text-white/40 text-sm mt-2">سيتم عرض السؤال أو التحدي هنا</p>
          </div>

          {/* Decorative corner accents */}
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
        </div>

        {/* Round indicator */}
        <div className="mb-6">
          <span className="px-4 py-1.5 bg-white/10 rounded-full text-white/60 text-sm font-medium">
            الجولة {playState.currentRound} من {sessionData.rounds}
          </span>
        </div>
      </main>

      {/* Footer - Action buttons */}
      <footer className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 md:gap-6">
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="flex-1 max-w-xs flex items-center justify-center gap-3 px-6 py-4 md:py-5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 border-2 border-gray-500/50 text-white text-lg md:text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <SkipForward className="w-6 h-6" />
            <span>تجاوز / سكب</span>
          </button>

          {/* Correct answer button */}
          <button
            onClick={handleCorrect}
            className="flex-1 max-w-xs flex items-center justify-center gap-3 px-6 py-4 md:py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white text-lg md:text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30"
          >
            <Check className="w-6 h-6" />
            <span>إجابة صحيحة</span>
          </button>
        </div>
      </footer>
    </div>
  )
}
