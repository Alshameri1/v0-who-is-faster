'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Check, SkipForward, Menu, Timer } from 'lucide-react'
import type { GameSessionData } from '@/contexts/popup-context'
import { PauseMenu } from '../components/pause-menu'

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
  usedPlayersTeam1: string[]
  usedPlayersTeam2: string[]
}

interface GameplayDashboardProps {
  sessionData: GameSessionData
  playState: GamePlayState
  onCorrectAnswer: () => void
  onSkip: () => void
  onRoundEnd: (winningTeam: 1 | 2) => void
  onRestart: () => void
  isTieBreaker?: boolean
}

// FEATURE 3: Category-Specific Image Mapping
// Each category has its own dedicated array of unique image URLs
const CATEGORY_IMAGES: Record<string, string[]> = {
  'أسئلة عامة': [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', // quiz/trivia
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', // study
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80', // books
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', // education
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', // classroom
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80', // library
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80', // books stack
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', // thinking
  ],
  'تحدي حركي': [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', // workout
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', // gym
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', // fitness
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80', // exercise
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', // stretching
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', // yoga
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', // dance
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80', // running
  ],
  'سرعة بديهة': [
    'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=800&q=80', // quick thinking
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80', // brainstorm
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', // fast work
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80', // clock/time
    'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=800&q=80', // watch
    'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80', // speed
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80', // fast writing
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', // quick decision
  ],
  'معلومات رياضية': [
    'https://images.unsplash.com/photo-1461896836934- voices-from-below?w=800&q=80', // soccer
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', // football
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', // basketball
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80', // tennis
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80', // swimming
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', // hockey
    'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80', // golf
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', // cycling
  ],
  'ألغاز ذكاء': [
    'https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=800&q=80', // puzzle
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80', // maze
    'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&q=80', // rubiks
    'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&q=80', // brain
    'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80', // chess
    'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=800&q=80', // sudoku
    'https://images.unsplash.com/photo-1547104442-9f0af4f37a87?w=800&q=80', // mystery
    'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800&q=80', // jigsaw
  ],
  'تمثيل صامت': [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80', // theater
    'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800&q=80', // mime
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80', // acting
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80', // performance
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', // stage
    'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=80', // drama
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80', // expression
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80', // music/silent
  ],
  'أكمل الجملة': [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80', // writing
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=80', // notebook
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80', // notes
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80', // typing
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', // laptop
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80', // coffee & work
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // microphone
    'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80', // pen & paper
  ],
  'تحدي سريع': [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', // party/fun
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', // celebration
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80', // game night
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80', // friends
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', // group fun
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80', // family game
    'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&q=80', // competition
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', // challenge
  ],
}

// Default fallback images if category not found
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=800&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
]

export function GameplayDashboard({
  sessionData,
  playState,
  onCorrectAnswer,
  onSkip,
  onRoundEnd,
  onRestart,
  isTieBreaker = false,
}: GameplayDashboardProps) {
  // Dual independent timers - milliseconds for precision
  const [team1TimeMs, setTeam1TimeMs] = useState(sessionData.timePerPlayer * 1000)
  const [team2TimeMs, setTeam2TimeMs] = useState(sessionData.timePerPlayer * 1000)
  const [isPaused, setIsPaused] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // FEATURE 5: Anti-repeat image pool - track available images for current category
  const [availableImagePool, setAvailableImagePool] = useState<string[]>([])
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')
  
  // Ref for precise interval timing
  const lastTickRef = useRef<number>(Date.now())
  const animationFrameRef = useRef<number | null>(null)
  const roundEndedRef = useRef(false)

  // Get images for current category
  const categoryImages = useMemo(() => {
    const category = playState.selectedCategory
    if (category && CATEGORY_IMAGES[category]) {
      return CATEGORY_IMAGES[category]
    }
    return DEFAULT_IMAGES
  }, [playState.selectedCategory])

  // Initialize image pool when category changes
  useEffect(() => {
    // Start with full pool for the selected category
    const freshPool = [...categoryImages]
    setAvailableImagePool(freshPool)
    
    // Set initial image
    if (freshPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * freshPool.length)
      const selectedImage = freshPool[randomIndex]
      setCurrentImageUrl(selectedImage)
      // Remove from pool
      setAvailableImagePool(prev => prev.filter(img => img !== selectedImage))
    }
  }, [categoryImages])

  // Function to get next image from pool (anti-repeat)
  const getNextImage = useCallback(() => {
    setAvailableImagePool(currentPool => {
      let pool = currentPool
      
      // FEATURE 5: If pool is empty, refill with all category images
      if (pool.length === 0) {
        pool = [...categoryImages]
      }
      
      // Select random image from available pool
      const randomIndex = Math.floor(Math.random() * pool.length)
      const selectedImage = pool[randomIndex]
      
      // Update current image
      setCurrentImageUrl(selectedImage)
      
      // Return pool with selected image removed (splice equivalent)
      return pool.filter(img => img !== selectedImage)
    })
  }, [categoryImages])

  // Pause when menu opens
  useEffect(() => {
    if (isMenuOpen) {
      setIsPaused(true)
    }
  }, [isMenuOpen])

  // Handle menu close - resume timer
  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false)
    setIsPaused(false)
  }, [])

  // Handle round end when timer hits 0
  useEffect(() => {
    if (team1TimeMs <= 0 && !roundEndedRef.current) {
      roundEndedRef.current = true
      onRoundEnd(2) // Team 1's timer hit 0 - Team 2 wins
    }
    if (team2TimeMs <= 0 && !roundEndedRef.current) {
      roundEndedRef.current = true
      onRoundEnd(1) // Team 2's timer hit 0 - Team 1 wins
    }
  }, [team1TimeMs, team2TimeMs, onRoundEnd])

  // Precision countdown using requestAnimationFrame
  useEffect(() => {
    if (isPaused || roundEndedRef.current) return

    const tick = () => {
      if (roundEndedRef.current) return
      
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      // Only decrement the active team's timer
      if (playState.currentTeamTurn === 1) {
        setTeam1TimeMs(prev => {
          const newTime = prev - delta
          return Math.max(0, newTime)
        })
      } else {
        setTeam2TimeMs(prev => {
          const newTime = prev - delta
          return Math.max(0, newTime)
        })
      }

      animationFrameRef.current = requestAnimationFrame(tick)
    }

    lastTickRef.current = Date.now()
    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPaused, playState.currentTeamTurn])

  // Handle correct answer - change image (from pool), toggle turn, NO timer reset
  const handleCorrect = useCallback(() => {
    getNextImage()
    onCorrectAnswer()
  }, [getNextImage, onCorrectAnswer])

  // Handle skip - subtract 5 seconds penalty from ACTIVE team's timer, change image, toggle turn
  const handleSkip = useCallback(() => {
    if (playState.currentTeamTurn === 1) {
      setTeam1TimeMs(prev => Math.max(0, prev - 5000))
    } else {
      setTeam2TimeMs(prev => Math.max(0, prev - 5000))
    }
    getNextImage()
    onSkip()
  }, [getNextImage, onSkip, playState.currentTeamTurn])

  // Format time display (show seconds with one decimal)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, ms / 1000)
    const seconds = Math.floor(totalSeconds)
    const tenths = Math.floor((totalSeconds - seconds) * 10)
    return `${seconds}.${tenths}`
  }

  // Time warning states for each team
  const team1Seconds = team1TimeMs / 1000
  const team2Seconds = team2TimeMs / 1000
  const team1Warning = team1Seconds <= 10
  const team1Critical = team1Seconds <= 5
  const team2Warning = team2Seconds <= 10
  const team2Critical = team2Seconds <= 5

  // Get current matched players
  const { team1Player, team2Player } = playState.matchedPlayers

  return (
    <div dir="rtl" className="h-screen flex flex-col overflow-hidden bg-[#0c1628]">
      {/* Hamburger Menu Button - RTL positioned */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
        aria-label="قائمة الإيقاف"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Pause Menu Sidebar */}
      <PauseMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onRestart={onRestart}
        gameId={sessionData.gameId}
      />

      {/* Header with Center Active Turn Tag */}
      <header className="flex-shrink-0 px-4 py-3 md:px-6 md:py-4 mt-12">
        {/* Tie-breaker indicator - above turn tag */}
        {isTieBreaker && (
          <div className="flex justify-center mb-2">
            <div className="px-4 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full animate-pulse">
              <span className="text-yellow-400 font-bold text-sm">الجولة الحاسمة الفاصلة</span>
            </div>
          </div>
        )}

        {/* CENTER ACTIVE TURN TAG - Bold, Highly Stylish */}
        <div className="flex justify-center mb-4">
          <div 
            className={`
              relative px-6 py-3 rounded-2xl font-bold text-lg md:text-xl
              transition-all duration-500 ease-out
              ${playState.currentTeamTurn === 1 
                ? 'bg-gradient-to-r from-cyan-500/30 to-cyan-400/20 border-2 border-cyan-400 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.5),0_0_60px_rgba(34,211,238,0.2)]' 
                : 'bg-gradient-to-r from-red-500/30 to-red-400/20 border-2 border-red-400 text-red-100 shadow-[0_0_30px_rgba(248,113,113,0.5),0_0_60px_rgba(248,113,113,0.2)]'
              }
            `}
          >
            {/* Animated glow ring */}
            <div 
              className={`
                absolute inset-0 rounded-2xl opacity-50 animate-pulse
                ${playState.currentTeamTurn === 1 
                  ? 'bg-cyan-400/10' 
                  : 'bg-red-400/10'
                }
              `}
            />
            <span className="relative z-10 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full animate-pulse ${
                playState.currentTeamTurn === 1 ? 'bg-cyan-400' : 'bg-red-400'
              }`} />
              دور: {playState.currentTeamTurn === 1 ? sessionData.team1Data.name : sessionData.team2Data.name}
            </span>
          </div>
        </div>

        {/* SEPARATED DUAL TIMERS - Massive, Ultra-Clear Standalone Cards */}
        <div className="flex items-stretch justify-between gap-3 md:gap-6 w-full max-w-4xl mx-auto">
          {/* Team 1 Timer Card - Blue/Cyan Theme */}
          <div 
            className={`
              flex-1 flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-2xl md:rounded-3xl
              transition-all duration-300 ease-out
              ${playState.currentTeamTurn === 1 
                ? 'bg-gradient-to-br from-cyan-500/30 via-cyan-500/20 to-cyan-600/30 border-2 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.4)]' 
                : 'bg-cyan-500/10 border border-cyan-400/30 opacity-50'
              }
            `}
          >
            {/* Team Name */}
            <span className={`text-sm md:text-base font-bold ${
              playState.currentTeamTurn === 1 ? 'text-cyan-200' : 'text-cyan-400/60'
            }`}>
              {sessionData.team1Data.name}
            </span>

            {/* MASSIVE TIMER DISPLAY */}
            <div 
              className={`
                flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl
                ${team1Critical 
                  ? 'bg-red-500/40 animate-pulse' 
                  : team1Warning
                    ? 'bg-yellow-500/30'
                    : 'bg-black/30'
                }
              `}
            >
              <Timer className={`w-5 h-5 md:w-7 md:h-7 ${
                team1Critical ? 'text-red-400' : team1Warning ? 'text-yellow-400' : 'text-cyan-300'
              }`} />
              <span 
                className={`
                  text-3xl md:text-5xl font-black font-mono tabular-nums tracking-tight
                  ${team1Critical ? 'text-red-400' : team1Warning ? 'text-yellow-400' : 'text-white'}
                `}
              >
                {formatTime(team1TimeMs)}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2">
              <span className={`text-2xl md:text-3xl font-black ${
                playState.currentTeamTurn === 1 ? 'text-white' : 'text-white/60'
              }`}>
                {playState.team1Score}
              </span>
              <span className={`text-xs ${playState.currentTeamTurn === 1 ? 'text-cyan-300/80' : 'text-cyan-400/40'}`}>نقاط</span>
            </div>

            {/* Active Player */}
            {playState.currentTeamTurn === 1 && team1Player && (
              <span className="text-xs md:text-sm text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full">
                {team1Player.name}
              </span>
            )}
          </div>

          {/* VS Indicator - Center */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-white/30 text-xs font-bold mb-1">VS</span>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                playState.currentTeamTurn === 1 ? 'bg-cyan-400 animate-pulse scale-125' : 'bg-cyan-400/30'
              }`} />
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                playState.currentTeamTurn === 2 ? 'bg-red-400 animate-pulse scale-125' : 'bg-red-400/30'
              }`} />
            </div>
          </div>

          {/* Team 2 Timer Card - Red Theme */}
          <div 
            className={`
              flex-1 flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-2xl md:rounded-3xl
              transition-all duration-300 ease-out
              ${playState.currentTeamTurn === 2 
                ? 'bg-gradient-to-br from-red-500/30 via-red-500/20 to-red-600/30 border-2 border-red-400 shadow-[0_0_40px_rgba(248,113,113,0.4)]' 
                : 'bg-red-500/10 border border-red-400/30 opacity-50'
              }
            `}
          >
            {/* Team Name */}
            <span className={`text-sm md:text-base font-bold ${
              playState.currentTeamTurn === 2 ? 'text-red-200' : 'text-red-400/60'
            }`}>
              {sessionData.team2Data.name}
            </span>

            {/* MASSIVE TIMER DISPLAY */}
            <div 
              className={`
                flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl
                ${team2Critical 
                  ? 'bg-red-500/40 animate-pulse' 
                  : team2Warning
                    ? 'bg-yellow-500/30'
                    : 'bg-black/30'
                }
              `}
            >
              <Timer className={`w-5 h-5 md:w-7 md:h-7 ${
                team2Critical ? 'text-red-400' : team2Warning ? 'text-yellow-400' : 'text-red-300'
              }`} />
              <span 
                className={`
                  text-3xl md:text-5xl font-black font-mono tabular-nums tracking-tight
                  ${team2Critical ? 'text-red-400' : team2Warning ? 'text-yellow-400' : 'text-white'}
                `}
              >
                {formatTime(team2TimeMs)}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2">
              <span className={`text-2xl md:text-3xl font-black ${
                playState.currentTeamTurn === 2 ? 'text-white' : 'text-white/60'
              }`}>
                {playState.team2Score}
              </span>
              <span className={`text-xs ${playState.currentTeamTurn === 2 ? 'text-red-300/80' : 'text-red-400/40'}`}>نقاط</span>
            </div>

            {/* Active Player */}
            {playState.currentTeamTurn === 2 && team2Player && (
              <span className="text-xs md:text-sm text-red-300 bg-red-500/20 px-3 py-1 rounded-full">
                {team2Player.name}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Image takes maximum space */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 md:px-6 md:py-3 min-h-0">
        {/* Category badge */}
        {playState.selectedCategory && (
          <div className="flex-shrink-0 mb-2 md:mb-3">
            <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-300 text-xs md:text-sm font-medium">
              {playState.selectedCategory}
            </span>
          </div>
        )}

        {/* Image container - Takes maximum available space */}
        <div className="flex-1 w-full max-w-4xl flex items-center justify-center min-h-0">
          <div 
            className="relative w-full h-full max-h-full rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-white/5 to-white/10"
            style={{ aspectRatio: '16/9', maxWidth: '100%', maxHeight: '100%' }}
          >
            {/* Actual image - Uses category-specific image from pool */}
            <img
              src={currentImageUrl}
              alt="تحدي"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              crossOrigin="anonymous"
            />

            {/* Paused overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-2xl text-yellow-400 font-bold animate-pulse">اللعبة متوقفة مؤقتاً</span>
              </div>
            )}

            {/* Decorative corner accents */}
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-lg pointer-events-none" />
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-lg pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-lg pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-lg pointer-events-none" />

            {/* Round indicator overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white/80 text-xs font-medium">
                {isTieBreaker ? 'جولة فاصلة' : `الجولة ${playState.currentRound} / ${sessionData.rounds}`}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Action buttons with exact width ratio */}
      <footer className="flex-shrink-0 px-4 py-3 md:px-6 md:py-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* Button wrapper - matches image width */}
          <div className="flex items-stretch gap-2 md:gap-3 w-full">
            {/* Skip button - 20% width */}
            <button
              onClick={handleSkip}
              disabled={isPaused}
              className="w-[20%] flex items-center justify-center gap-1 md:gap-2 py-3 md:py-4 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-500/50 text-white text-sm md:text-lg font-bold rounded-xl md:rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">تجاوز</span>
              <span className="text-[10px] md:text-xs opacity-60 hidden md:inline">(-5ث)</span>
            </button>

            {/* Correct answer button - 80% width */}
            <button
              onClick={handleCorrect}
              disabled={isPaused}
              className="w-[80%] flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-gradient-to-b from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base md:text-xl font-bold rounded-xl md:rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30"
            >
              <Check className="w-5 h-5 md:w-6 md:h-6" />
              <span>إجابة صحيحة</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
