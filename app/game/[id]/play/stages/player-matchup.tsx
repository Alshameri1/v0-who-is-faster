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

  const shuffleInterval1 = useRef<NodeJS.Timeout | null>(null)
  const shuffleInterval2 = useRef<NodeJS.Timeout | null>(null)

  // Smart player selection: Get available players from pool (not yet used in current cycle)
  const getAvailablePlayers = useCallback((
    allPlayers: { id: string; name: string }[],
    usedPlayerIds: string[]
  ): { id: string; name: string }[] => {
    const available = allPlayers.filter(p => !usedPlayerIds.includes(p.id))
    // If all players used (shouldn't happen with proper pool refill), return all players
    return available.length > 0 ? available : allPlayers
  }, [])

  const availablePlayers1 = getAvailablePlayers(team1.players, usedPlayersTeam1)
  const availablePlayers2 = getAvailablePlayers(team2.players, usedPlayersTeam2)

  // Shuffle animation effect
  useEffect(() => {
    if (!isShuffling) return

    // Start fast shuffling for team 1
    shuffleInterval1.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * team1.players.length)
      setDisplayName1(team1.players[randomIndex].name)
    }, 80)

    // Start fast shuffling for team 2
    shuffleInterval2.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * team2.players.length)
      setDisplayName2(team2.players[randomIndex].name)
    }, 80)

    // Start slowing down after 2 seconds
    const slowdownTimer = setTimeout(() => {
      // Clear fast intervals
      if (shuffleInterval1.current) clearInterval(shuffleInterval1.current)
      if (shuffleInterval2.current) clearInterval(shuffleInterval2.current)

      // Select random players from AVAILABLE pool only (anti-repeat)
      const selected1 = availablePlayers1[Math.floor(Math.random() * availablePlayers1.length)]
      const selected2 = availablePlayers2[Math.floor(Math.random() * availablePlayers2.length)]

      // Slow shuffle with decreasing speed
      let delay = 100
      const slowShuffle = (remaining: number) => {
        if (remaining <= 0) {
          setDisplayName1(selected1.name)
          setDisplayName2(selected2.name)
          setSelectedPlayer1(selected1)
          setSelectedPlayer2(selected2)
          setIsShuffling(false)
          setIsLocked(true)
          return
        }

        setTimeout(() => {
          if (remaining > 3) {
            setDisplayName1(team1.players[Math.floor(Math.random() * team1.players.length)].name)
            setDisplayName2(team2.players[Math.floor(Math.random() * team2.players.length)].name)
          } else {
            setDisplayName1(selected1.name)
            setDisplayName2(selected2.name)
          }
          slowShuffle(remaining - 1)
        }, delay)
        delay += 50
      }

      slowShuffle(10)
    }, 2000)

    return () => {
      if (shuffleInterval1.current) clearInterval(shuffleInterval1.current)
      if (shuffleInterval2.current) clearInterval(shuffleInterval2.current)
      clearTimeout(slowdownTimer)
    }
  }, [isShuffling, team1.players, team2.players, availablePlayers1, availablePlayers2])

  const handleContinue = useCallback(() => {
    if (selectedPlayer1 && selectedPlayer2) {
      onComplete(selectedPlayer1, selectedPlayer2)
    }
  }, [selectedPlayer1, selectedPlayer2, onComplete])

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
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

      {/* Continue button */}
      <div className={`mt-8 md:mt-12 transition-all duration-500 ${isLocked ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          onClick={handleContinue}
          disabled={!isLocked}
          className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 active:scale-95"
        >
          متابعة
        </button>
      </div>
    </div>
  )
}
