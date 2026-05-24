'use client'

import { useState, useEffect } from 'react'

interface CountdownProps {
  onComplete: () => void
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showGo, setShowGo] = useState(false)

  useEffect(() => {
    // Trigger animation for each number
    setIsAnimating(true)
    const animReset = setTimeout(() => setIsAnimating(false), 300)

    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(prev => prev - 1)
      }, 1000)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(animReset)
      }
    } else {
      // Show "إبدأ!" and complete
      setShowGo(true)
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 800)
      
      return () => {
        clearTimeout(completeTimer)
        clearTimeout(animReset)
      }
    }
  }, [count, onComplete])

  // Convert to Arabic numerals
  const arabicNumerals = ['٠', '١', '٢', '٣']

  // Get color based on count
  const getColor = () => {
    switch (count) {
      case 3: return 'from-cyan-400 to-cyan-500'
      case 2: return 'from-yellow-400 to-orange-500'
      case 1: return 'from-red-400 to-red-500'
      default: return 'from-green-400 to-emerald-500'
    }
  }

  const getGlowColor = () => {
    switch (count) {
      case 3: return 'rgba(34, 211, 238, 0.5)'
      case 2: return 'rgba(251, 191, 36, 0.5)'
      case 1: return 'rgba(248, 113, 113, 0.5)'
      default: return 'rgba(74, 222, 128, 0.5)'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      {/* Radial pulse background */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      >
        <div 
          className={`w-96 h-96 rounded-full bg-gradient-to-r ${getColor()} opacity-20 animate-ping`}
        />
      </div>

      {/* Main content */}
      <div className="relative text-center">
        {!showGo ? (
          // Number countdown
          <div
            className={`transform transition-all duration-300 ${
              isAnimating ? 'scale-125 opacity-100' : 'scale-100 opacity-80'
            }`}
          >
            <span
              className={`text-[12rem] md:text-[18rem] font-black text-transparent bg-clip-text bg-gradient-to-b ${getColor()} leading-none`}
              style={{
                textShadow: `0 0 80px ${getGlowColor()}, 0 0 150px ${getGlowColor()}`,
                filter: `drop-shadow(0 0 40px ${getGlowColor()})`,
              }}
            >
              {arabicNumerals[count]}
            </span>
          </div>
        ) : (
          // "إبدأ!" text
          <div
            className="animate-bounce"
          >
            <span
              className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 via-green-400 to-emerald-500"
              style={{
                textShadow: '0 0 80px rgba(74, 222, 128, 0.5)',
                filter: 'drop-shadow(0 0 40px rgba(74, 222, 128, 0.5))',
              }}
            >
              إبدأ!
            </span>
          </div>
        )}

        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className={`absolute w-64 h-64 rounded-full border-4 transition-all duration-500 ${
              isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-30'
            }`}
            style={{ borderColor: getGlowColor() }}
          />
          <div 
            className={`absolute w-48 h-48 rounded-full border-2 transition-all duration-700 ${
              isAnimating ? 'scale-200 opacity-0' : 'scale-100 opacity-20'
            }`}
            style={{ borderColor: getGlowColor() }}
          />
        </div>
      </div>
    </div>
  )
}
