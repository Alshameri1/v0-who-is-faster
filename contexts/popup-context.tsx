'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// Types for popup management
export type PopupType = 'info' | 'setup' | null

interface PopupContextType {
  activePopup: PopupType
  openPopup: (type: PopupType) => void
  closePopup: () => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export function PopupProvider({ children }: { children: ReactNode }) {
  const [activePopup, setActivePopup] = useState<PopupType>(null)

  const openPopup = useCallback((type: PopupType) => {
    setActivePopup(type)
  }, [])

  const closePopup = useCallback(() => {
    setActivePopup(null)
  }, [])

  return (
    <PopupContext.Provider value={{ activePopup, openPopup, closePopup }}>
      {children}
    </PopupContext.Provider>
  )
}

export function usePopup() {
  const context = useContext(PopupContext)
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider')
  }
  return context
}
