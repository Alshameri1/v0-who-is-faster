'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Trophy, RotateCcw, Home } from 'lucide-react'
import type { GameSessionData } from '@/contexts/popup-context'

interface GameOverScreenProps {
  sessionData: GameSessionData
  team1Score: number
  team2Score: number
  onPlayAgain: () => void
}

export function GameOverScreen({ sessionData, team1Score, team2Score, onPlayAgain }: GameOverScreenProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  const winner = team1Score > team2Score ? 1 : 2
  const winnerName = winner === 1 ? sessionData.team1Data.name : sessionData.team2Data.name
  const winnerColor = winner === 1 ? 'cyan' : 'red'
  const glowColor = winner === 1 ? 'rgba(34,211,238,0.5)' : 'rgba(248,113,113,0.5)'

  // Trigger confetti celebration
  const fireConfetti = useCallback(() => {
    const duration = 5000
    const animationEnd = Date.now() + duration
    const colors = winner === 1 ? ['#22d3ee', '#06b6d4', '#0891b2'] : ['#f87171', '#ef4444', '#dc2626']

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Shoot from left
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors,
        ticks: 60,
        gravity: 1.2,
        scalar: 1.2,
        drift: 0,
      })

      // Shoot from right
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors,
        ticks: 60,
        gravity: 1.2,
        scalar: 1.2,
        drift: 0,
      })
    }, 250)

    return () => clearInterval(interval)
  }, [winner])

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true)
      fireConfetti()
    }, 100)

    return () => clearTimeout(timer)
  }, [fireConfetti])

  const handleGoHome = useCallback(() => {
    router.push('/')
  }, [router])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1628] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          }}
        />
        
        {/* Floating particles */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-pulse ${
              winner === 1 ? 'bg-cyan-400/40' : 'bg-red-400/40'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        className={`relative text-center px-6 transform transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        {/* Celebration badge */}
        <div className="mb-6">
          <span className="inline-block px-6 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-400 font-bold text-lg animate-pulse">
            انتهت المباراة
          </span>
        </div>

        {/* Trophy */}
        <div className="relative mb-8">
          <Trophy 
            className={`w-32 h-32 md:w-40 md:h-40 mx-auto ${
              winner === 1 ? 'text-cyan-400' : 'text-red-400'
            }`}
            style={{
              filter: `drop-shadow(0 0 30px ${glowColor})`,
            }}
          />
          {/* Animated rings */}
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div 
              className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-4 ${
                winner === 1 ? 'border-cyan-400/30' : 'border-red-400/30'
              } animate-ping`}
            />
          </div>
        </div>

        {/* Winner announcement */}
        <h1 className="text-2xl md:text-3xl text-white/80 mb-2">
          مبروك الفوز لـ
        </h1>
        <p 
          className={`text-5xl md:text-7xl font-black mb-8 ${
            winner === 1 ? 'text-cyan-400' : 'text-red-400'
          }`}
          style={{ textShadow: `0 0 50px ${glowColor}` }}
        >
          {winnerName}
        </p>

        {/* Final scores */}
        <div className="flex items-center justify-center gap-8 mb-10">
          <div className={`text-center px-6 py-4 rounded-2xl ${
            winner === 1 ? 'bg-cyan-500/20 border-2 border-cyan-400' : 'bg-cyan-500/10 border border-cyan-400/30'
          }`}>
            <p className="text-cyan-400 text-sm mb-1">{sessionData.team1Data.name}</p>
            <p className="text-5xl font-black text-white">{team1Score}</p>
          </div>
          
          <div className="text-white/30 text-3xl font-bold">-</div>
          
          <div className={`text-center px-6 py-4 rounded-2xl ${
            winner === 2 ? 'bg-red-500/20 border-2 border-red-400' : 'bg-red-500/10 border border-red-400/30'
          }`}>
            <p className="text-red-400 text-sm mb-1">{sessionData.team2Data.name}</p>
            <p className="text-5xl font-black text-white">{team2Score}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onPlayAgain}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
              winner === 1 
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-cyan-500/30'
                : 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-red-500/30'
            }`}
          >
            <RotateCcw className="w-6 h-6" />
            إعادة اللعب
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <Home className="w-6 h-6" />
            الصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  )
}
