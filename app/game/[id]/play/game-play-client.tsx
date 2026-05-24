'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { GameSessionData } from '@/contexts/popup-context'
import { RoundIntro } from './stages/round-intro'
import { FortuneWheel } from './stages/fortune-wheel'
import { PlayerMatchup } from './stages/player-matchup'
import { Countdown } from './stages/countdown'
import { GameplayDashboard } from './stages/gameplay-dashboard'

// Game state types
type GameState = 'LOADING' | 'ROUND_INTRO' | 'WHEEL' | 'MATCHUP' | 'COUNTDOWN' | 'PLAYING'

// Extended game state with scores and current players
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
  // Track used players to avoid repeats within a round
  usedPlayersTeam1: string[]
  usedPlayersTeam2: string[]
}

interface GamePlayClientProps {
  gameId: string
}

export function GamePlayClient({ gameId }: GamePlayClientProps) {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState>('LOADING')
  const [sessionData, setSessionData] = useState<GameSessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Game play state
  const [playState, setPlayState] = useState<GamePlayState>({
    currentRound: 1,
    team1Score: 0,
    team2Score: 0,
    currentTeamTurn: 1,
    selectedCategory: null,
    matchedPlayers: {
      team1Player: null,
      team2Player: null,
    },
    usedPlayersTeam1: [],
    usedPlayersTeam2: [],
  })

  // Load game data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('game_session_data')
      if (!stored) {
        setError('لم يتم العثور على بيانات اللعبة')
        return
      }

      const data: GameSessionData = JSON.parse(stored)
      
      // Validate game ID matches
      if (data.gameId !== gameId) {
        setError('معرف اللعبة غير متطابق')
        return
      }

      setSessionData(data)
      // Start the game flow
      setGameState('ROUND_INTRO')
    } catch (err) {
      console.error('Failed to load game data:', err)
      setError('خطأ في تحميل بيانات اللعبة')
    }
  }, [gameId])

  // Stage transition handlers
  const handleRoundIntroComplete = useCallback(() => {
    setGameState('WHEEL')
  }, [])

  const handleWheelComplete = useCallback((category: string) => {
    setPlayState(prev => ({
      ...prev,
      selectedCategory: category,
    }))
    setGameState('MATCHUP')
  }, [])

  const handleMatchupComplete = useCallback((
    team1Player: { id: string; name: string },
    team2Player: { id: string; name: string }
  ) => {
    setPlayState(prev => ({
      ...prev,
      matchedPlayers: { team1Player, team2Player },
      usedPlayersTeam1: [...prev.usedPlayersTeam1, team1Player.id],
      usedPlayersTeam2: [...prev.usedPlayersTeam2, team2Player.id],
    }))
    setGameState('COUNTDOWN')
  }, [])

  const handleCountdownComplete = useCallback(() => {
    setGameState('PLAYING')
  }, [])

  const handleCorrectAnswer = useCallback(() => {
    setPlayState(prev => {
      const newState = { ...prev }
      
      // Award point to current team
      if (prev.currentTeamTurn === 1) {
        newState.team1Score = prev.team1Score + 1
      } else {
        newState.team2Score = prev.team2Score + 1
      }

      // Switch turns
      newState.currentTeamTurn = prev.currentTeamTurn === 1 ? 2 : 1

      return newState
    })

    // After a short delay, go to next matchup or round
    setTimeout(() => {
      proceedToNextTurn()
    }, 1500)
  }, [])

  const handleSkip = useCallback(() => {
    // Switch turns without awarding points
    setPlayState(prev => ({
      ...prev,
      currentTeamTurn: prev.currentTeamTurn === 1 ? 2 : 1,
    }))

    setTimeout(() => {
      proceedToNextTurn()
    }, 1000)
  }, [])

  const proceedToNextTurn = useCallback(() => {
    if (!sessionData) return

    const allTeam1Used = playState.usedPlayersTeam1.length >= sessionData.team1Data.players.length
    const allTeam2Used = playState.usedPlayersTeam2.length >= sessionData.team2Data.players.length

    // If all players used, check if we should go to next round
    if (allTeam1Used && allTeam2Used) {
      if (playState.currentRound < sessionData.rounds) {
        // Go to next round
        setPlayState(prev => ({
          ...prev,
          currentRound: prev.currentRound + 1,
          usedPlayersTeam1: [],
          usedPlayersTeam2: [],
          selectedCategory: null,
          matchedPlayers: { team1Player: null, team2Player: null },
        }))
        setGameState('ROUND_INTRO')
      } else {
        // Game over - navigate to results
        router.push(`/game/${gameId}/result-panel`)
      }
    } else {
      // Continue with new matchup
      setGameState('MATCHUP')
    }
  }, [sessionData, playState, gameId, router])

  // Loading state
  if (gameState === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#0c1628] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-lg">جاري تحميل اللعبة...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0c1628] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">!</div>
          <h2 className="text-white text-xl font-bold mb-2">خطأ</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }

  if (!sessionData) return null

  // Render current stage
  return (
    <div className="min-h-screen bg-[#0c1628] overflow-hidden">
      {gameState === 'ROUND_INTRO' && (
        <RoundIntro 
          roundNumber={playState.currentRound} 
          totalRounds={sessionData.rounds}
          onComplete={handleRoundIntroComplete} 
        />
      )}

      {gameState === 'WHEEL' && (
        <FortuneWheel onComplete={handleWheelComplete} />
      )}

      {gameState === 'MATCHUP' && (
        <PlayerMatchup
          team1={sessionData.team1Data}
          team2={sessionData.team2Data}
          usedPlayersTeam1={playState.usedPlayersTeam1}
          usedPlayersTeam2={playState.usedPlayersTeam2}
          onComplete={handleMatchupComplete}
        />
      )}

      {gameState === 'COUNTDOWN' && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {gameState === 'PLAYING' && (
        <GameplayDashboard
          sessionData={sessionData}
          playState={playState}
          onCorrectAnswer={handleCorrectAnswer}
          onSkip={handleSkip}
        />
      )}
    </div>
  )
}
