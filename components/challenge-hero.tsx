'use client'

import { Settings, BookOpen, ArrowLeft } from 'lucide-react'

/**
 * ChallengeHero Component
 * A hero section for the "من الأسرع" (Who's Faster) Arabic challenge game
 * Features RTL layout, stylized Arabic typography, and interactive buttons
 */
export function ChallengeHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0c1628]">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1628] via-[#111d33] to-[#0c1628] opacity-80" />
      
      {/* Main content container */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Stylized Arabic Title - "من الأسرع" */}
        <div className="mb-16 md:mb-20">
          <h1 className="text-center text-6xl font-black leading-tight tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
            {/* "من" in red with slight rotation for dynamic feel */}
            <span 
              className="inline-block text-[#e63946] drop-shadow-[0_4px_20px_rgba(230,57,70,0.4)]"
              style={{ 
                transform: 'rotate(-3deg) translateY(-5px)',
                textShadow: '3px 3px 0 rgba(0,0,0,0.3)'
              }}
            >
              من
            </span>
            {' '}
            {/* "الأسرع" split between red and cyan for visual impact */}
            <span className="inline-block">
              <span 
                className="text-[#e63946] drop-shadow-[0_4px_20px_rgba(230,57,70,0.4)]"
                style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
              >
                الأ
              </span>
              <span 
                className="text-[#22b8cf] drop-shadow-[0_4px_20px_rgba(34,184,207,0.4)]"
                style={{ 
                  textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                  transform: 'rotate(2deg)',
                  display: 'inline-block'
                }}
              >
                سرع
              </span>
            </span>
          </h1>
        </div>

        {/* Action Buttons Container */}
        <div className="flex w-full max-w-lg flex-col items-center gap-4 px-4">
          {/* Primary CTA - Start Challenge Button */}
          <button
            onClick={() => console.log('Start challenge clicked')}
            className="group relative w-full overflow-hidden rounded-xl bg-[#22b8cf] px-8 py-4 text-xl font-bold text-white shadow-lg shadow-[#22b8cf]/30 transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[#1fa8bd] hover:shadow-xl hover:shadow-[#22b8cf]/40 active:scale-[0.98] sm:text-2xl"
          >
            {/* Hover shine effect */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            <span className="relative flex items-center justify-center gap-3">
              إبدأ التحدّي
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 sm:h-6 sm:w-6" />
            </span>
          </button>

          {/* Secondary Buttons Row */}
          <div className="flex w-full gap-4">
            {/* Settings Button - Yellow/Gold */}
            <button
              onClick={() => console.log('Settings clicked')}
              className="group relative flex-1 overflow-hidden rounded-xl bg-[#f0a500] px-6 py-3.5 text-lg font-bold text-white shadow-lg shadow-[#f0a500]/30 transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[#d99400] hover:shadow-xl hover:shadow-[#f0a500]/40 active:scale-[0.98] sm:text-xl"
            >
              {/* Hover shine effect */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                الإعدادات
                <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              </span>
            </button>

            {/* Explain Challenge Button - Red */}
            <button
              onClick={() => console.log('Explain challenge clicked')}
              className="group relative flex-1 overflow-hidden rounded-xl bg-[#e63946] px-6 py-3.5 text-lg font-bold text-white shadow-lg shadow-[#e63946]/30 transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[#d32836] hover:shadow-xl hover:shadow-[#e63946]/40 active:scale-[0.98] sm:text-xl"
            >
              {/* Hover shine effect */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                شرح التحدّي
                <BookOpen className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </span>
            </button>
          </div>
        </div>

        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c1628] to-transparent" />
      </div>
    </section>
  )
}
