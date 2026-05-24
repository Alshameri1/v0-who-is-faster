'use client'

import { useEffect, useState } from 'react'

interface RoundWinnerOverlayProps {
  winnerName: string
  winnerTeam: 1 | 2
  onComplete: () => void
}

export function RoundWinnerOverlay({ winnerName, winnerTeam, onComplete }: RoundWinnerOverlayProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter')

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setPhase('show'), 100)
    
    // Exit animation after 2.5 seconds
    const exitTimer = setTimeout(() => setPhase('exit'), 2500)
    
    // Complete after 3 seconds
    const completeTimer = setTimeout(() => onComplete(), 3000)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  const isTeam1 = winnerTeam === 1
  const teamColor = isTeam1 ? 'cyan' : 'red'
  const glowColor = isTeam1 ? 'rgba(34,211,238,0.5)' : 'rgba(248,113,113,0.5)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1628] overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full animate-pulse ${
              isTeam1 ? 'bg-cyan-400/30' : 'bg-red-400/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Radial glow background */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          phase === 'show' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* Main content */}
      <div
        className={`relative text-center transform transition-all duration-700 ease-out ${
          phase === 'enter'
            ? 'opacity-0 scale-50'
            : phase === 'show'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-110'
        }`}
      >
        {/* Trophy icon */}
        <div 
          className={`text-8xl md:text-9xl mb-6 ${
            phase === 'show' ? 'animate-bounce' : ''
          }`}
        >
          🏆
        </div>

        {/* Winner text */}
        <h2 
          className="text-3xl md:text-5xl font-black text-white mb-4"
          style={{ textShadow: `0 0 30px ${glowColor}` }}
        >
          فاز
        </h2>
        
        <p 
          className={`text-4xl md:text-6xl font-black mb-6 ${
            isTeam1 ? 'text-cyan-400' : 'text-red-400'
          }`}
          style={{ textShadow: `0 0 40px ${glowColor}` }}
        >
          {winnerName}
        </p>

        <p className="text-xl md:text-2xl text-white/70">
          بهذه الجولة!
        </p>

        {/* Decorative lines */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div 
            className={`h-1 transition-all duration-700 rounded-full ${
              isTeam1 ? 'bg-gradient-to-r from-transparent to-cyan-400' : 'bg-gradient-to-r from-transparent to-red-400'
            } ${phase === 'show' ? 'w-24' : 'w-0'}`}
          />
          <div className={`w-3 h-3 rounded-full ${isTeam1 ? 'bg-cyan-400' : 'bg-red-400'} animate-pulse`} />
          <div 
            className={`h-1 transition-all duration-700 rounded-full ${
              isTeam1 ? 'bg-gradient-to-l from-transparent to-cyan-400' : 'bg-gradient-to-l from-transparent to-red-400'
            } ${phase === 'show' ? 'w-24' : 'w-0'}`}
          />
        </div>
      </div>
    </div>
  )
}
