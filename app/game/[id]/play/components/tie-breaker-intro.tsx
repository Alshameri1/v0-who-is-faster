'use client'

import { useEffect, useState } from 'react'
import { Swords } from 'lucide-react'

interface TieBreakerIntroProps {
  onComplete: () => void
}

export function TieBreakerIntro({ onComplete }: TieBreakerIntroProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter')

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setPhase('show'), 100)
    
    // Exit animation after 3 seconds
    const exitTimer = setTimeout(() => setPhase('exit'), 3000)
    
    // Complete after 3.5 seconds
    const completeTimer = setTimeout(() => onComplete(), 3500)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1628] overflow-hidden">
      {/* Dramatic background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pulsing glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(234,179,8,0.3) 0%, transparent 70%)',
          }}
        />
        
        {/* Animated particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${1 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 bg-yellow-500"
              style={{
                width: '200%',
                left: '-50%',
                top: `${i * 12}%`,
                transform: 'rotate(-45deg)',
              }}
            />
          ))}
        </div>
      </div>

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
        {/* Warning badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-red-500/20 border border-red-500 rounded-full text-red-400 font-bold text-sm animate-pulse">
            تعادل!
          </span>
        </div>

        {/* Crossed swords icon */}
        <div className="relative mb-8">
          <Swords 
            className="w-24 h-24 md:w-32 md:h-32 mx-auto text-yellow-400"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(234,179,8,0.5))',
            }}
          />
          {/* Animated glow ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-400/30 animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-orange-500 mb-4"
          style={{
            textShadow: '0 0 40px rgba(234,179,8,0.5)',
          }}
        >
          الجولة الحاسمة
        </h1>
        
        <p className="text-2xl md:text-3xl font-bold text-yellow-400/80 mb-2">
          الفاصلة
        </p>

        <p className="text-lg text-white/60 mt-6">
          من سيفوز بالمباراة؟
        </p>

        {/* Decorative lines */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div 
            className={`h-1 bg-gradient-to-r from-transparent to-yellow-400 rounded-full transition-all duration-700 ${
              phase === 'show' ? 'w-24' : 'w-0'
            }`}
          />
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          <div 
            className={`h-1 bg-gradient-to-l from-transparent to-yellow-400 rounded-full transition-all duration-700 ${
              phase === 'show' ? 'w-24' : 'w-0'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
