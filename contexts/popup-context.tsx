'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// Types for popup management
export type PopupType = 'info' | 'setup' | 'post-setup' | null

// Game session data interface
export interface GameSessionData {
  gameId: string
  team1Data: {
    id: string
    name: string
    players: { id: string; name: string }[]
  }
  team2Data: {
    id: string
    name: string
    players: { id: string; name: string }[]
  }
  rounds: number
  timePerPlayer: number
  isOrganizerView: boolean
  createdAt: string
}

interface PopupContextType {
  activePopup: PopupType
  openPopup: (type: PopupType) => void
  closePopup: () => void
  gameSession: GameSessionData | null
  setGameSession: (data: GameSessionData | null) => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export function PopupProvider({ children }: { children: ReactNode }) {
  const [activePopup, setActivePopup] = useState<PopupType>(null)
  const [gameSession, setGameSession] = useState<GameSessionData | null>(null)

  const openPopup = useCallback((type: PopupType) => {
    setActivePopup(type)
  }, [])

  const closePopup = useCallback(() => {
    setActivePopup(null)
  }, [])

  return (
    <PopupContext.Provider value={{ activePopup, openPopup, closePopup, gameSession, setGameSession }}>
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
