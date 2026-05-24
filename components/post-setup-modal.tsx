'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePopup } from '@/contexts/popup-context'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ExternalLink, 
  Copy, 
  Play, 
  BarChart3, 
  CheckCircle2,
  PartyPopper
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

/**
 * PostSetupModal Component
 * Navigation hub displayed after successful game setup
 * Features: QR Code, multiple action buttons for different game modes
 */
export function PostSetupModal() {
  const { activePopup, closePopup, gameSession } = usePopup()
  const isOpen = activePopup === 'post-setup'
  
  const [resultPanelUrl, setResultPanelUrl] = useState('')
  const [showLocalResults, setShowLocalResults] = useState(false)

  // Generate URL only on client side to avoid SSR hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined' && gameSession?.gameId) {
      const url = `${window.location.origin}/game/${gameSession.gameId}/result-panel`
      setResultPanelUrl(url)
    }
  }, [gameSession?.gameId])

  // Handle modal close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closePopup()
      setShowLocalResults(false)
    }
  }

  // Action: Open link in new tab
  const handleOpenInNewTab = useCallback(() => {
    if (typeof window !== 'undefined' && resultPanelUrl) {
      window.open(resultPanelUrl, '_blank', 'noopener,noreferrer')
      toast.success('تم فتح لوحة التحكم', {
        description: 'تم فتح لوحة النتائج في نافذة جديدة',
        duration: 3000,
      })
    }
  }, [resultPanelUrl])

  // Action: Copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    if (typeof window === 'undefined' || !resultPanelUrl) return

    try {
      await navigator.clipboard.writeText(resultPanelUrl)
      toast.success('تم نسخ الرابط بنجاح!', {
        description: 'يمكنك الآن مشاركته مع الآخرين',
        duration: 3000,
      })
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = resultPanelUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      toast.success('تم نسخ الرابط بنجاح!', {
        description: 'يمكنك الآن مشاركته مع الآخرين',
        duration: 3000,
      })
    }
  }, [resultPanelUrl])

  // Action: Continue playing locally
  const handlePlayLocally = useCallback(() => {
    closePopup()
    toast.success('جاهز للعب!', {
      description: 'ابدأ التحدي الآن على هذه الشاشة',
      duration: 3000,
    })
  }, [closePopup])

  // Action: Toggle local results view
  const handleToggleLocalResults = useCallback(() => {
    setShowLocalResults(prev => !prev)
    if (!showLocalResults) {
      toast.info('وضع النتائج المباشرة', {
        description: 'سيتم عرض النتائج مباشرة أثناء اللعب',
        duration: 3000,
      })
    }
  }, [showLocalResults])

  if (!gameSession) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-h-[90vh] overflow-y-auto border-[#1e3a5f] bg-[#0f1f35] text-white sm:max-w-lg"
        showCloseButton={true}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <PartyPopper className="h-8 w-8 text-green-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            تم حفظ اللعبة!
          </DialogTitle>
          <p className="mt-2 text-gray-400">
            يمكنك الآن ربط لوحة المنظم أو شاشة النتائج
          </p>
        </DialogHeader>

        {/* Game Summary */}
        <div className="mt-4 rounded-xl border border-[#1e3a5f] bg-[#0c1628] p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-gray-300">{gameSession.team1Data.name}</span>
              <span className="text-[#22b8cf]">({gameSession.team1Data.players.length} متسابقين)</span>
            </div>
            <span className="text-gray-500">VS</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">{gameSession.team2Data.name}</span>
              <span className="text-[#e63946]">({gameSession.team2Data.players.length} متسابقين)</span>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-6 text-xs text-gray-400">
            <span>{gameSession.rounds} جولات</span>
            <span className="text-gray-600">|</span>
            <span>{gameSession.timePerPlayer} ثانية لكل متسابق</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mt-6 flex flex-col items-center">
          <p className="mb-3 text-sm text-gray-400">امسح للوصول إلى لوحة النتائج</p>
          <div className="rounded-xl border-2 border-[#22b8cf]/30 bg-white p-4">
            {resultPanelUrl ? (
              <QRCodeSVG
                value={resultPanelUrl}
                size={160}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#0f1f35"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#22b8cf] border-t-transparent" />
              </div>
            )}
          </div>
          <p className="mt-3 max-w-xs truncate text-center text-xs text-gray-500" dir="ltr">
            {resultPanelUrl || 'جارٍ إنشاء الرابط...'}
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {/* Open in New Tab */}
          <button
            onClick={handleOpenInNewTab}
            disabled={!resultPanelUrl}
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#22b8cf] px-4 py-3 font-semibold text-white shadow-lg shadow-[#22b8cf]/20 transition-all duration-200 hover:scale-[1.02] hover:bg-[#1fa8bd] hover:shadow-xl hover:shadow-[#22b8cf]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ExternalLink className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span>الانتقال إلى لوحة التحكم</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            disabled={!resultPanelUrl}
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 py-3 font-semibold text-white shadow-lg shadow-[#f59e0b]/20 transition-all duration-200 hover:scale-[1.02] hover:bg-[#d97706] hover:shadow-xl hover:shadow-[#f59e0b]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span>نسخ الرابط</span>
          </button>

          {/* Play Locally */}
          <button
            onClick={handlePlayLocally}
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#e63946] px-4 py-3 font-semibold text-white shadow-lg shadow-[#e63946]/20 transition-all duration-200 hover:scale-[1.02] hover:bg-[#d32836] hover:shadow-xl hover:shadow-[#e63946]/30 active:scale-[0.98]"
          >
            <Play className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            <span>تابع اللعب هنا</span>
          </button>

          {/* Toggle Local Results */}
          <button
            onClick={handleToggleLocalResults}
            className={`group flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              showLocalResults
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600'
                : 'border-2 border-[#1e3a5f] bg-[#0c1628] text-gray-300 hover:border-[#22b8cf]/50 hover:text-white'
            }`}
          >
            <BarChart3 className={`h-5 w-5 transition-transform ${showLocalResults ? 'text-white' : ''} group-hover:scale-110`} />
            <span>{showLocalResults ? 'إخفاء النتيجة المباشرة' : 'إظهار النتيجة في صفحة اللعب'}</span>
          </button>
        </div>

        {/* Game ID Footer */}
        <div className="mt-6 border-t border-[#1e3a5f] pt-4 text-center">
          <p className="text-xs text-gray-500">
            معرف اللعبة: <span className="font-mono text-[#22b8cf]" dir="ltr">{gameSession.gameId}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
