'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { GameSessionData } from '@/contexts/popup-context'
import { RoundIntro } from './stages/round-intro'
import { FortuneWheel } from './stages/fortune-wheel'
import { PlayerMatchup } from './stages/player-matchup'
import { Countdown } from './stages/countdown'
import { GameplayDashboard } from './stages/gameplay-dashboard'

// Game state types
type GameState = 'LOADING' | 'ROUND_INTRO' | 'WHEEL' | 'MATCHUP' | 'COUNTDOWN' | 'PLAYING' | 'ROUND_RESULT'

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
  // Player pools for anti-repeat system
  playerPoolTeam1: string[]
  playerPoolTeam2: string[]
  // Track used players within current cycle
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
  const [roundWinner, setRoundWinner] = useState<1 | 2 | null>(null)
  
  // Game play state with player pools
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
    playerPoolTeam1: [],
    playerPoolTeam2: [],
    usedPlayersTeam1: [],
    usedPlayersTeam2: [],
  })

  // Initialize player pools when session data loads
  useEffect(() => {
    if (sessionData) {
      setPlayState(prev => ({
        ...prev,
        playerPoolTeam1: sessionData.team1Data.players.map(p => p.id),
        playerPoolTeam2: sessionData.team2Data.players.map(p => p.id),
      }))
    }
  }, [sessionData])

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

  // Helper: Refill player pool for a team if empty
  const refillPlayerPoolIfNeeded = useCallback((
    currentPool: string[],
    usedPlayers: string[],
    allPlayers: { id: string; name: string }[]
  ): { pool: string[]; used: string[] } => {
    // Get available players (in pool but not yet used)
    const available = currentPool.filter(id => !usedPlayers.includes(id))
    
    if (available.length === 0) {
      // All players have been used - refill the pool
      return {
        pool: allPlayers.map(p => p.id),
        used: [], // Reset used list
      }
    }
    
    return { pool: currentPool, used: usedPlayers }
  }, [])

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

  // Handle correct answer - toggle turn only, no timer reset
  const handleCorrectAnswer = useCallback(() => {
    setPlayState(prev => ({
      ...prev,
      currentTeamTurn: prev.currentTeamTurn === 1 ? 2 : 1,
    }))
    // Do NOT change the game state - stay in PLAYING
    // Timer continues from its current position
  }, [])

  // Handle skip - toggle turn (timer penalty handled in dashboard)
  const handleSkip = useCallback(() => {
    setPlayState(prev => ({
      ...prev,
      currentTeamTurn: prev.currentTeamTurn === 1 ? 2 : 1,
    }))
    // Stay in PLAYING state
  }, [])

  // Handle round end - called when timer hits 0
  const handleRoundEnd = useCallback((winningTeam: 1 | 2) => {
    // Award point to winning team
    setPlayState(prev => ({
      ...prev,
      team1Score: winningTeam === 1 ? prev.team1Score + 1 : prev.team1Score,
      team2Score: winningTeam === 2 ? prev.team2Score + 1 : prev.team2Score,
    }))
    
    setRoundWinner(winningTeam)
    setGameState('ROUND_RESULT')
  }, [])

  // Proceed to next round or end game
  const proceedAfterRoundResult = useCallback(() => {
    if (!sessionData) return

    if (playState.currentRound < sessionData.rounds) {
      // Refill player pools for next round if needed
      const team1Refill = refillPlayerPoolIfNeeded(
        playState.playerPoolTeam1,
        playState.usedPlayersTeam1,
        sessionData.team1Data.players
      )
      const team2Refill = refillPlayerPoolIfNeeded(
        playState.playerPoolTeam2,
        playState.usedPlayersTeam2,
        sessionData.team2Data.players
      )

      // Go to next round
      setPlayState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        currentTeamTurn: 1,
        selectedCategory: null,
        matchedPlayers: { team1Player: null, team2Player: null },
        playerPoolTeam1: team1Refill.pool,
        playerPoolTeam2: team2Refill.pool,
        usedPlayersTeam1: team1Refill.used,
        usedPlayersTeam2: team2Refill.used,
      }))
      setRoundWinner(null)
      setGameState('ROUND_INTRO')
    } else {
      // Game over - save final scores and navigate to results
      if (typeof window !== 'undefined') {
        const finalData = {
          ...sessionData,
          finalScores: {
            team1: playState.team1Score + (roundWinner === 1 ? 1 : 0),
            team2: playState.team2Score + (roundWinner === 2 ? 1 : 0),
          },
          completedAt: new Date().toISOString(),
        }
        localStorage.setItem('game_session_data', JSON.stringify(finalData))
      }
      router.push(`/game/${gameId}/result-panel`)
    }
  }, [sessionData, playState, roundWinner, refillPlayerPoolIfNeeded, gameId, router])

  // Loading state
  if (gameState === 'LOADING') {
    return (
      <div className="h-screen bg-[#0c1628] flex items-center justify-center overflow-hidden">
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
      <div className="h-screen bg-[#0c1628] flex items-center justify-center p-4 overflow-hidden">
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

  // Round result overlay
  if (gameState === 'ROUND_RESULT' && roundWinner) {
    const winnerName = roundWinner === 1 ? sessionData.team1Data.name : sessionData.team2Data.name
    const winnerColor = roundWinner === 1 ? 'cyan' : 'red'
    
    return (
      <div className="h-screen bg-[#0c1628] flex items-center justify-center overflow-hidden">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div 
            className={`text-6xl md:text-8xl font-black mb-4 ${
              roundWinner === 1 ? 'text-cyan-400' : 'text-red-400'
            }`}
            style={{ textShadow: `0 0 40px ${winnerColor === 'cyan' ? 'rgba(34,211,238,0.5)' : 'rgba(248,113,113,0.5)'}` }}
          >
            🏆
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            انتهت الجولة!
          </h2>
          <p className={`text-2xl md:text-3xl font-bold ${
            roundWinner === 1 ? 'text-cyan-400' : 'text-red-400'
          }`}>
            فاز {winnerName}
          </p>
          
          {/* Score display */}
          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-cyan-400 text-sm mb-1">{sessionData.team1Data.name}</p>
              <p className="text-4xl font-black text-white">{playState.team1Score}</p>
            </div>
            <div className="text-white/30 text-2xl">-</div>
            <div className="text-center">
              <p className="text-red-400 text-sm mb-1">{sessionData.team2Data.name}</p>
              <p className="text-4xl font-black text-white">{playState.team2Score}</p>
            </div>
          </div>

          <button
            onClick={proceedAfterRoundResult}
            className="mt-8 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30"
          >
            {playState.currentRound < sessionData.rounds ? 'الجولة التالية' : 'عرض النتائج'}
          </button>
        </div>
      </div>
    )
  }

  // Render current stage
  return (
    <div className="h-screen bg-[#0c1628] overflow-hidden">
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
          onRoundEnd={handleRoundEnd}
        />
      )}
    </div>
  )
}
