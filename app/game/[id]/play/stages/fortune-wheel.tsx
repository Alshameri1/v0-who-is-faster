'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface FortuneWheelProps {
  onComplete: (category: string) => void
}

// Default fun categories with explicit colors
const CATEGORIES = [
  { id: 1, name: 'أسئلة عامة', color: '#22d3ee' },      // cyan
  { id: 2, name: 'تحدي حركي', color: '#f43f5e' },       // red/rose
  { id: 3, name: 'سرعة بديهة', color: '#a855f7' },      // purple
  { id: 4, name: 'معلومات رياضية', color: '#22c55e' },  // green
  { id: 5, name: 'ألغاز ذكاء', color: '#f59e0b' },      // amber
  { id: 6, name: 'تمثيل صامت', color: '#3b82f6' },      // blue
  { id: 7, name: 'أكمل الجملة', color: '#ec4899' },     // pink
  { id: 8, name: 'تحدي سريع', color: '#14b8a6' },       // teal
]

// Spin animation duration in ms - CSS transition and reveal timeout use this
const SPIN_DURATION_MS = 3000

export function FortuneWheel({ onComplete }: FortuneWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
        spinTimeoutRef.current = null
      }
    }
  }, [])

  // Store the pre-selected winning category in a ref to survive re-renders
  const pendingCategoryRef = useRef<string | null>(null)

  // "RESULT-FIRST" approach: Pick category first, then calculate exact rotation
  const spinWheel = useCallback(() => {
    if (isSpinning) return

    // Clear any existing timeout
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current)
      spinTimeoutRef.current = null
    }

    setIsSpinning(true)
    setShowResult(false)
    setSelectedCategory(null)

    // STEP 1: Randomly select the winning category FIRST
    const winningIndex = Math.floor(Math.random() * CATEGORIES.length)
    const winningCategory = CATEGORIES[winningIndex]
    
    // Store in ref so it survives any re-renders
    pendingCategoryRef.current = winningCategory.name
    console.log('[v0] Wheel spin started, pre-selected category:', winningCategory.name)

    // STEP 2: Calculate exact rotation to land on that category
    const segmentAngle = 360 / CATEGORIES.length
    
    // Calculate the final angle where winning segment aligns with top pointer
    const targetAngleWithinCircle = 360 - ((winningIndex + 0.5) * segmentAngle)
    
    // Add 5-8 full rotations for dramatic effect
    const fullRotations = 5 + Math.floor(Math.random() * 4)
    const totalRotation = rotation + (fullRotations * 360) + targetAngleWithinCircle - (rotation % 360)

    setRotation(totalRotation)

    // STEP 3: Set timeout matching CSS transition duration to reveal result
    spinTimeoutRef.current = setTimeout(() => {
      console.log('[v0] Spin timeout fired, revealing result')
      
      // Use the ref value (survives re-renders) 
      const categoryToShow = pendingCategoryRef.current
      
      if (categoryToShow) {
        console.log('[v0] Setting selectedCategory to:', categoryToShow)
        setIsSpinning(false)
        setSelectedCategory(categoryToShow)
        setShowResult(true)
      }
    }, SPIN_DURATION_MS)
  }, [isSpinning, rotation])

  const handleContinue = useCallback(() => {
    if (selectedCategory) {
      onComplete(selectedCategory)
    }
  }, [selectedCategory, onComplete])

  // Calculate segment path for SVG
  const segmentAngle = 360 / CATEGORIES.length
  const createSegmentPath = (index: number) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180)
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180)
    const radius = 150
    const cx = 150
    const cy = 150

    const x1 = cx + radius * Math.cos(startAngle)
    const y1 = cy + radius * Math.sin(startAngle)
    const x2 = cx + radius * Math.cos(endAngle)
    const y2 = cy + radius * Math.sin(endAngle)

    const largeArc = segmentAngle > 180 ? 1 : 0

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  // Calculate text position
  const getTextPosition = (index: number) => {
    const angle = ((index + 0.5) * segmentAngle - 90) * (Math.PI / 180)
    const radius = 100
    const cx = 150
    const cy = 150
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      rotation: (index + 0.5) * segmentAngle,
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">عجلة الحظ</h2>
      <p className="text-white/60 mb-8">اختر الفئة بلف العجلة</p>

      {/* Wheel container */}
      <div className="relative mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div 
            className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
          />
        </div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="relative transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? `${SPIN_DURATION_MS}ms` : '0s',
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
          }}
        >
          <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-2xl">
            {/* Wheel segments */}
            {CATEGORIES.map((category, index) => (
              <g key={category.id}>
                <path
                  d={createSegmentPath(index)}
                  fill={category.color}
                  stroke="#0c1628"
                  strokeWidth="2"
                />
                {/* Category text */}
                <text
                  x={getTextPosition(index).x}
                  y={getTextPosition(index).y}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${getTextPosition(index).rotation}, ${getTextPosition(index).x}, ${getTextPosition(index).y})`}
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {category.name}
                </text>
              </g>
            ))}

            {/* Center circle */}
            <circle cx="150" cy="150" r="25" fill="#0c1628" stroke="#22d3ee" strokeWidth="3" />
            <circle cx="150" cy="150" r="15" fill="#22d3ee" />
          </svg>
        </div>

        {/* Glow effect */}
        <div 
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isSpinning ? 'opacity-100' : 'opacity-0'}`}
          style={{
            boxShadow: '0 0 60px rgba(34, 211, 238, 0.4), 0 0 100px rgba(34, 211, 238, 0.2)',
          }}
        />
      </div>

      {/* Spin button */}
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`px-10 py-4 text-xl font-bold rounded-2xl transition-all duration-300 transform ${
          isSpinning
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95'
        }`}
      >
        {isSpinning ? 'جاري اللف...' : 'لف العجلة'}
      </button>

      {/* Selected category display */}
      <div 
        className={`mt-8 text-center transition-all duration-500 ${
          showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {selectedCategory && (
          <>
            <p className="text-white/60 mb-2">الفئة المختارة:</p>
            <p className="text-2xl md:text-3xl font-bold text-cyan-400 mb-6">{selectedCategory}</p>
            
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              متابعة
            </button>
          </>
        )}
      </div>
    </div>
  )
}
