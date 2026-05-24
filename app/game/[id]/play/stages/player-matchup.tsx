'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Team {
  id: string
  name: string
  players: { id: string; name: string }[]
}

interface PlayerMatchupProps {
  team1: Team
  team2: Team
  usedPlayersTeam1: string[]
  usedPlayersTeam2: string[]
  onComplete: (
    team1Player: { id: string; name: string },
    team2Player: { id: string; name: string }
  ) => void
}

// Unified 5-second shuffle duration
const SHUFFLE_DURATION_MS = 5000
const SHUFFLE_INTERVAL_MS = 50

export function PlayerMatchup({
  team1,
  team2,
  usedPlayersTeam1,
  usedPlayersTeam2,
  onComplete,
}: PlayerMatchupProps) {
  const [isShuffling, setIsShuffling] = useState(true)
  const [displayName1, setDisplayName1] = useState('')
  const [displayName2, setDisplayName2] = useState('')
  const [selectedPlayer1, setSelectedPlayer1] = useState<{ id: string; name: string } | null>(null)
  const [selectedPlayer2, setSelectedPlayer2] = useState<{ id: string; name: string } | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  // Refs for interval/timeout cleanup - CRITICAL for preventing leaks
  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Ref to track if effect has already run (prevents double-execution in StrictMode)
  const hasStartedRef = useRef(false)
  
  // Refs to store final selected players (survives re-renders)
  const finalPlayer1Ref = useRef<{ id: string; name: string } | null>(null)
  const finalPlayer2Ref = useRef<{ id: string; name: string } | null>(null)

  // Smart player selection: Get available players from pool (not yet used in current cycle)
  const getAvailablePlayers = useCallback((
    allPlayers: { id: string; name: string }[],
    usedPlayerIds: string[]
  ): { id: string; name: string }[] => {
    const available = allPlayers.filter(p => !usedPlayerIds.includes(p.id))
    return available.length > 0 ? available : allPlayers
  }, [])

  // Compute available players once on mount using refs to avoid dependency issues
  const availablePlayers1 = getAvailablePlayers(team1.players, usedPlayersTeam1)
  const availablePlayers2 = getAvailablePlayers(team2.players, usedPlayersTeam2)

  // THE ATOMIC 5-SECOND PARALLEL CONTROL LOOP - runs ONCE on mount
  useEffect(() => {
    // Guard: Only run once
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    // PRE-SELECT the final players FIRST (from available pool - anti-repeat)
    const pool1 = team1.players.filter(p => !usedPlayersTeam1.includes(p.id))
    const pool2 = team2.players.filter(p => !usedPlayersTeam2.includes(p.id))
    const finalPool1 = pool1.length > 0 ? pool1 : team1.players
    const finalPool2 = pool2.length > 0 ? pool2 : team2.players
    
    finalPlayer1Ref.current = finalPool1[Math.floor(Math.random() * finalPool1.length)]
    finalPlayer2Ref.current = finalPool2[Math.floor(Math.random() * finalPool2.length)]

    // Start rapid 50ms cycling interval for visual shuffle effect
    shuffleIntervalRef.current = setInterval(() => {
      const randomIndex1 = Math.floor(Math.random() * team1.players.length)
      const randomIndex2 = Math.floor(Math.random() * team2.players.length)
      setDisplayName1(team1.players[randomIndex1].name)
      setDisplayName2(team2.players[randomIndex2].name)
    }, SHUFFLE_INTERVAL_MS)

    // THE HARD STOP LOCK - exactly 5000ms timeout
    lockTimeoutRef.current = setTimeout(() => {
      // 1. Force stop shuffling
      setIsShuffling(false)
      
      // 2. IMMEDIATELY clear the interval
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current)
        shuffleIntervalRef.current = null
      }

      // 3. Lock onto pre-selected final players from refs
      const final1 = finalPlayer1Ref.current
      const final2 = finalPlayer2Ref.current
      
      if (final1 && final2) {
        setDisplayName1(final1.name)
        setDisplayName2(final2.name)
        setSelectedPlayer1(final1)
        setSelectedPlayer2(final2)
      }
      
      // 4. Unlock the continue button
      setIsLocked(true)
    }, SHUFFLE_DURATION_MS)

    // STRICT RETURN CLEANUP - prevents memory leaks
    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current)
        shuffleIntervalRef.current = null
      }
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current)
        lockTimeoutRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - runs ONCE on mount only

  const handleContinue = useCallback(() => {
    if (selectedPlayer1 && selectedPlayer2) {
      onComplete(selectedPlayer1, selectedPlayer2)
    }
  }, [selectedPlayer1, selectedPlayer2, onComplete])

  return (
    <div dir="rtl" className="h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Header */}
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">المواجهة</h2>
      <p className="text-white/60 mb-8 md:mb-12">من سيواجه من؟</p>

      {/* Available players indicator */}
      <div className="flex items-center justify-center gap-6 mb-6 text-xs md:text-sm">
        <span className="text-cyan-400/70">
          متبقي: {availablePlayers1.length} من {team1.players.length}
        </span>
        <span className="text-white/30">|</span>
        <span className="text-red-400/70">
          متبقي: {availablePlayers2.length} من {team2.players.length}
        </span>
      </div>

      {/* Matchup cards container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-4xl">
        {/* Team 1 Card */}
        <div 
          className={`relative flex-1 w-full max-w-xs transition-all duration-500 ${
            isLocked ? 'transform scale-105' : ''
          }`}
        >
          <div 
            className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-2 border-cyan-400/50 rounded-3xl p-6 text-center backdrop-blur-sm"
            style={{
              boxShadow: isLocked ? '0 0 40px rgba(34, 211, 238, 0.3)' : 'none',
            }}
          >
            {/* Team badge */}
            <div className="absolute -top-3 right-4 px-4 py-1 bg-cyan-500 rounded-full text-white text-sm font-bold">
              {team1.name}
            </div>

            {/* Player name display */}
            <div className="mt-4 mb-2">
              <div 
                className={`text-4xl md:text-5xl font-black text-cyan-400 transition-all duration-150 ${
                  isShuffling ? 'blur-[1px]' : ''
                }`}
                style={{
                  textShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
                }}
              >
                {displayName1 || '---'}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isShuffling ? 'bg-cyan-400 animate-bounce' : 'bg-cyan-400/30'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* VS Badge */}
        <div className="relative">
          <div 
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl md:text-2xl font-black text-white shadow-xl transition-all duration-500 ${
              isLocked ? 'scale-110' : 'animate-pulse'
            }`}
            style={{
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)',
            }}
          >
            VS
          </div>
          
          {/* Animated ring */}
          {isShuffling && (
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-ping" />
          )}
        </div>

        {/* Team 2 Card */}
        <div 
          className={`relative flex-1 w-full max-w-xs transition-all duration-500 ${
            isLocked ? 'transform scale-105' : ''
          }`}
        >
          <div 
            className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-400/50 rounded-3xl p-6 text-center backdrop-blur-sm"
            style={{
              boxShadow: isLocked ? '0 0 40px rgba(248, 113, 113, 0.3)' : 'none',
            }}
          >
            {/* Team badge */}
            <div className="absolute -top-3 right-4 px-4 py-1 bg-red-500 rounded-full text-white text-sm font-bold">
              {team2.name}
            </div>

            {/* Player name display */}
            <div className="mt-4 mb-2">
              <div 
                className={`text-4xl md:text-5xl font-black text-red-400 transition-all duration-150 ${
                  isShuffling ? 'blur-[1px]' : ''
                }`}
                style={{
                  textShadow: '0 0 20px rgba(248, 113, 113, 0.5)',
                }}
              >
                {displayName2 || '---'}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isShuffling ? 'bg-red-400 animate-bounce' : 'bg-red-400/30'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Continue button - disabled during shuffle, enabled only after lock */}
      <div className={`mt-8 md:mt-12 transition-all duration-500 ${isLocked ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          onClick={handleContinue}
          disabled={!isLocked}
          className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          متابعة
        </button>
      </div>
    </div>
  )
}
