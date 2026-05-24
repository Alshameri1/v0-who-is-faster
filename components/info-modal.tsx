'use client'

import { usePopup } from '@/contexts/popup-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookOpen } from 'lucide-react'

/**
 * InfoModal Component
 * Displays challenge explanation information
 * Shows placeholder content with promise of future content
 */
export function InfoModal() {
  const { activePopup, closePopup } = usePopup()
  const isOpen = activePopup === 'info'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePopup()}>
      <DialogContent 
        className="border-[#1e3a5f] bg-[#0f1f35] text-white sm:max-w-md"
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e63946]/20">
            <BookOpen className="h-8 w-8 text-[#e63946]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            شرح التحدّي
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6 rounded-lg border border-[#1e3a5f] bg-[#0c1628] p-6 text-center">
          <p className="text-lg text-gray-300">
            سوف يتم إضافة المحتوى لاحقاً
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={closePopup}
            className="rounded-lg bg-[#e63946] px-8 py-3 font-bold text-white transition-all duration-200 hover:bg-[#d32836] hover:scale-105 active:scale-95"
          >
            حسناً
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
