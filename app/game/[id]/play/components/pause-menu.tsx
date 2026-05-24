'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useRef } from 'react'
import { 
  Play, 
  RotateCcw, 
  QrCode, 
  Settings, 
  Home,
  X 
} from 'lucide-react'
import { toast } from 'sonner'

interface PauseMenuProps {
  isOpen: boolean
  onClose: () => void
  onRestart: () => void
  gameId: string
}

export function PauseMenu({ isOpen, onClose, onRestart, gameId }: PauseMenuProps) {
  const router = useRouter()
  // Internal state for animation control - delays unmount for exit animation
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle mount/unmount with animation delays for ultra-smooth transitions
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Use double RAF for guaranteed DOM paint before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      // Wait for exit animation to complete before unmounting (matches duration-500)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Copy result panel URL to clipboard
  const handleCopyQR = useCallback(async () => {
    const url = `${window.location.origin}/game/${gameId}/result-panel`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('تم نسخ رابط شاشة الجمهور', {
        description: 'يمكنك الآن مشاركة الرابط',
        duration: 3000,
      })
    } catch {
      toast.error('فشل في نسخ الرابط')
    }
  }, [gameId])

  // Navigate to management panel
  const handleManagementPanel = useCallback(() => {
    router.push(`/game/${gameId}/result-panel`)
  }, [router, gameId])

  // Navigate to home
  const handleLeaveGame = useCallback(() => {
    router.push('/')
  }, [router])

  // Handle restart
  const handleRestart = useCallback(() => {
    onRestart()
    onClose()
  }, [onRestart, onClose])

  if (!shouldRender) return null

  return (
    <>
      {/* Backdrop with ultra-smooth fade and blur transition */}
      <div 
        ref={backdropRef}
        className={`
          fixed inset-0 z-50 
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isAnimating 
            ? 'bg-black/70 backdrop-blur-md opacity-100' 
            : 'bg-black/0 backdrop-blur-none opacity-0'
          }
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel with ultra-smooth slide transition - RTL (slides from left) */}
      <div 
        dir="rtl"
        ref={panelRef}
        className={`
          fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] 
          bg-gradient-to-b from-[#0f1f35] to-[#0c1628] 
          border-r border-white/10 shadow-2xl
          transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isAnimating ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button - positioned for RTL */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Pause status badge */}
        <div className="mt-16 mb-8 flex justify-center">
          <div className="px-6 py-3 bg-yellow-500/20 border-2 border-yellow-500 rounded-full animate-pulse">
            <span className="text-yellow-400 font-bold text-lg flex items-center gap-2">
              <span className="text-xl">⏸️</span>
              اللعبة متوقفة مؤقتاً
            </span>
          </div>
        </div>

        {/* Menu Items with staggered animation */}
        <nav className="px-4 space-y-3">
          {/* Resume */}
          <button
            onClick={onClose}
            className={`
              w-full flex items-center gap-4 px-5 py-4 
              bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-2xl 
              transition-all duration-300 group hover:scale-[1.02]
              transform ${isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}
            `}
            style={{ transitionDelay: isAnimating ? '100ms' : '0ms' }}
          >
            <div className="p-2 bg-green-500/30 rounded-xl group-hover:bg-green-500/50 transition-colors">
              <Play className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <span className="block text-white font-bold">استئناف التحدي</span>
              <span className="block text-white/50 text-sm">متابعة اللعب</span>
            </div>
          </button>

          {/* Restart */}
          <button
            onClick={handleRestart}
            className={`
              w-full flex items-center gap-4 px-5 py-4 
              bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-2xl 
              transition-all duration-300 group hover:scale-[1.02]
              transform ${isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}
            `}
            style={{ transitionDelay: isAnimating ? '150ms' : '0ms' }}
          >
            <div className="p-2 bg-blue-500/30 rounded-xl group-hover:bg-blue-500/50 transition-colors">
              <RotateCcw className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-right">
              <span className="block text-white font-bold">بدء من جديد</span>
              <span className="block text-white/50 text-sm">إعادة تشغيل اللعبة</span>
            </div>
          </button>

          {/* QR / Audience Screen */}
          <button
            onClick={handleCopyQR}
            className={`
              w-full flex items-center gap-4 px-5 py-4 
              bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-2xl 
              transition-all duration-300 group hover:scale-[1.02]
              transform ${isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}
            `}
            style={{ transitionDelay: isAnimating ? '200ms' : '0ms' }}
          >
            <div className="p-2 bg-purple-500/30 rounded-xl group-hover:bg-purple-500/50 transition-colors">
              <QrCode className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <span className="block text-white font-bold">شاشة الجمهور (QR)</span>
              <span className="block text-white/50 text-sm">نسخ رابط العرض</span>
            </div>
          </button>

          {/* Management Panel */}
          <button
            onClick={handleManagementPanel}
            className={`
              w-full flex items-center gap-4 px-5 py-4 
              bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-2xl 
              transition-all duration-300 group hover:scale-[1.02]
              transform ${isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}
            `}
            style={{ transitionDelay: isAnimating ? '250ms' : '0ms' }}
          >
            <div className="p-2 bg-cyan-500/30 rounded-xl group-hover:bg-cyan-500/50 transition-colors">
              <Settings className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-right">
              <span className="block text-white font-bold">لوحة المنظّم</span>
              <span className="block text-white/50 text-sm">عرض النتائج</span>
            </div>
          </button>

          {/* Leave Game */}
          <button
            onClick={handleLeaveGame}
            className={`
              w-full flex items-center gap-4 px-5 py-4 
              bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-2xl 
              transition-all duration-300 group hover:scale-[1.02]
              transform ${isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}
            `}
            style={{ transitionDelay: isAnimating ? '300ms' : '0ms' }}
          >
            <div className="p-2 bg-red-500/30 rounded-xl group-hover:bg-red-500/50 transition-colors">
              <Home className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-right">
              <span className="block text-white font-bold">مغادرة اللعبة</span>
              <span className="block text-white/50 text-sm">العودة للصفحة الرئيسية</span>
            </div>
          </button>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/30 text-sm">من الأسرع؟</p>
        </div>
      </div>
    </>
  )
}
