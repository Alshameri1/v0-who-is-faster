'use client'

import { useState, useCallback, useMemo } from 'react'
import { usePopup, type GameSessionData } from '@/contexts/popup-context'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, Plus, Trash2, Users, Check, X } from 'lucide-react'

// Types for team management
interface Player {
  id: string
  name: string
  error?: string
}

interface Team {
  id: string
  name: string
  isEditing: boolean
  players: Player[]
  color: 'blue' | 'red'
}

// Initial team state factory
const createInitialTeams = (): Team[] => [
  {
    id: 'team-1',
    name: 'الفريق الأول',
    isEditing: false,
    players: [],
    color: 'blue',
  },
  {
    id: 'team-2',
    name: 'الفريق الثاني',
    isEditing: false,
    players: [],
    color: 'red',
  },
]

// Generate unique ID
const generateId = () => `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/**
 * SetupModal Component
 * Interactive team configuration modal for the challenge game
 * Features: Team naming, player management, duplicate validation, round/timer config
 */
export function SetupModal() {
  const { activePopup, closePopup, openPopup, setGameSession } = usePopup()
  const isOpen = activePopup === 'setup'

  // State management
  const [teams, setTeams] = useState<Team[]>(createInitialTeams)
  const [rounds, setRounds] = useState('3')
  const [timePerPlayer, setTimePerPlayer] = useState('30')
  const [editingTeamName, setEditingTeamName] = useState('')

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closePopup()
      // Reset state after animation
      setTimeout(() => {
        setTeams(createInitialTeams())
        setRounds('3')
        setTimePerPlayer('30')
      }, 300)
    }
  }

  // Team name editing handlers
  const startEditingTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      setEditingTeamName(team.name)
      setTeams(prev => prev.map(t => ({ ...t, isEditing: t.id === teamId })))
    }
  }

  const saveTeamName = (teamId: string) => {
    if (editingTeamName.trim()) {
      setTeams(prev => prev.map(t => 
        t.id === teamId 
          ? { ...t, name: editingTeamName.trim(), isEditing: false }
          : t
      ))
    }
    setEditingTeamName('')
  }

  const cancelEditingTeamName = (teamId: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, isEditing: false } : t
    ))
    setEditingTeamName('')
  }

  // Player management handlers
  const addPlayer = (teamId: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId 
        ? { ...t, players: [...t.players, { id: generateId(), name: '' }] }
        : t
    ))
  }

  const updatePlayerName = (teamId: string, playerId: string, name: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId 
        ? { 
            ...t, 
            players: t.players.map(p => 
              p.id === playerId ? { ...p, name, error: undefined } : p
            )
          }
        : t
    ))
  }

  const removePlayer = (teamId: string, playerId: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId 
        ? { ...t, players: t.players.filter(p => p.id !== playerId) }
        : t
    ))
  }

  // Get all player names for duplicate checking
  const allPlayerNames = useMemo(() => {
    return teams.flatMap(t => t.players.map(p => p.name.trim().toLowerCase())).filter(Boolean)
  }, [teams])

  // Validation and submission
  const handleContinue = useCallback(() => {
    // Collect all player names with their locations
    const nameOccurrences = new Map<string, { teamId: string; playerId: string }[]>()
    
    teams.forEach(team => {
      team.players.forEach(player => {
        const normalizedName = player.name.trim().toLowerCase()
        if (normalizedName) {
          if (!nameOccurrences.has(normalizedName)) {
            nameOccurrences.set(normalizedName, [])
          }
          nameOccurrences.get(normalizedName)!.push({ 
            teamId: team.id, 
            playerId: player.id 
          })
        }
      })
    })

    // Find duplicates
    const duplicates = new Map<string, { teamId: string; playerId: string }[]>()
    nameOccurrences.forEach((occurrences, name) => {
      if (occurrences.length > 1) {
        duplicates.set(name, occurrences)
      }
    })

    // Check for empty names
    const hasEmptyNames = teams.some(t => 
      t.players.some(p => !p.name.trim())
    )

    // If there are duplicates, mark errors and show toast
    if (duplicates.size > 0) {
      setTeams(prev => prev.map(team => ({
        ...team,
        players: team.players.map(player => {
          const normalizedName = player.name.trim().toLowerCase()
          const isDuplicate = duplicates.has(normalizedName)
          return {
            ...player,
            error: isDuplicate ? 'اسم مكرر' : undefined
          }
        })
      })))

      toast.error('تحذير: أسماء مكررة!', {
        description: 'يرجى التأكد من عدم تكرار أسماء المتسابقين',
        duration: 5000,
      })
      return
    }

    // Check for empty names after duplicate check
    if (hasEmptyNames) {
      setTeams(prev => prev.map(team => ({
        ...team,
        players: team.players.map(player => ({
          ...player,
          error: !player.name.trim() ? 'الاسم مطلوب' : undefined
        }))
      })))

      toast.error('خطأ: حقول فارغة!', {
        description: 'يرجى ملء جميع أسماء المتسابقين',
        duration: 4000,
      })
      return
    }

    // Check if teams have at least one player
    const teamsWithoutPlayers = teams.filter(t => t.players.length === 0)
    if (teamsWithoutPlayers.length > 0) {
      toast.error('خطأ: فرق فارغة!', {
        description: 'يرجى إضافة متسابق واحد على الأقل لكل فريق',
        duration: 4000,
      })
      return
    }

    // Generate unique game ID using crypto.randomUUID() with fallback
    let gameId: string
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      gameId = window.crypto.randomUUID()
    } else {
      // Fallback for older browsers
      gameId = 'game-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9)
    }

    // Prepare game session data
    const gameSessionData: GameSessionData = {
      gameId,
      team1Data: {
        id: teams[0].id,
        name: teams[0].name,
        players: teams[0].players.map(p => ({ id: p.id, name: p.name.trim() })),
      },
      team2Data: {
        id: teams[1].id,
        name: teams[1].name,
        players: teams[1].players.map(p => ({ id: p.id, name: p.name.trim() })),
      },
      rounds: parseInt(rounds),
      timePerPlayer: parseInt(timePerPlayer),
      isOrganizerView: true,
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage (with SSR safety check)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('game_session_data', JSON.stringify(gameSessionData))
      } catch (error) {
        console.error('Failed to save game session:', error)
        toast.error('خطأ في حفظ البيانات', {
          description: 'تعذر حفظ بيانات اللعبة',
          duration: 4000,
        })
        return
      }
    }

    // Update context with game session
    setGameSession(gameSessionData)

    // Success toast
    toast.success('تم إعداد اللعبة بنجاح!', {
      description: `${teams[0].players.length + teams[1].players.length} متسابقين - ${rounds} جولات`,
      duration: 3000,
    })

    // Close setup modal and open post-setup modal
    closePopup()
    setTimeout(() => {
      openPopup('post-setup')
    }, 150)
  }, [teams, rounds, timePerPlayer, closePopup, openPopup, setGameSession])

  // Color classes for teams
  const teamColors = {
    blue: {
      bg: 'bg-[#22b8cf]/10',
      border: 'border-[#22b8cf]/40',
      header: 'bg-[#22b8cf]/20',
      accent: 'text-[#22b8cf]',
      button: 'bg-[#22b8cf] hover:bg-[#1fa8bd]',
      inputFocus: 'focus-visible:border-[#22b8cf] focus-visible:ring-[#22b8cf]/30',
    },
    red: {
      bg: 'bg-[#e63946]/10',
      border: 'border-[#e63946]/40',
      header: 'bg-[#e63946]/20',
      accent: 'text-[#e63946]',
      button: 'bg-[#e63946] hover:bg-[#d32836]',
      inputFocus: 'focus-visible:border-[#e63946] focus-visible:ring-[#e63946]/30',
    },
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-h-[90vh] overflow-y-auto border-[#1e3a5f] bg-[#0f1f35] text-white sm:max-w-3xl"
        showCloseButton={true}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#22b8cf]/20">
            <Users className="h-7 w-7 text-[#22b8cf]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            إعداد التحدّي
          </DialogTitle>
        </DialogHeader>

        {/* Team Wrappers */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const colors = teamColors[team.color]
            
            return (
              <div
                key={team.id}
                className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300`}
              >
                {/* Team Header */}
                <div className={`${colors.header} px-4 py-3`}>
                  {team.isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingTeamName}
                        onChange={(e) => setEditingTeamName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTeamName(team.id)
                          if (e.key === 'Escape') cancelEditingTeamName(team.id)
                        }}
                        className={`h-8 border-white/20 bg-white/10 text-white placeholder:text-white/50 ${colors.inputFocus}`}
                        autoFocus
                      />
                      <button
                        onClick={() => saveTeamName(team.id)}
                        className="rounded-md bg-green-500/20 p-1.5 text-green-400 transition-colors hover:bg-green-500/30"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => cancelEditingTeamName(team.id)}
                        className="rounded-md bg-red-500/20 p-1.5 text-red-400 transition-colors hover:bg-red-500/30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-bold ${colors.accent}`}>
                        {team.name}
                      </h3>
                      <button
                        onClick={() => startEditingTeamName(team.id)}
                        className={`rounded-md p-1.5 transition-colors hover:bg-white/10 ${colors.accent}`}
                        title="تعديل الاسم"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Players List */}
                <div className="space-y-3 p-4">
                  {team.players.map((player, index) => (
                    <div key={player.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center text-sm text-gray-400">
                          {index + 1}
                        </span>
                        <Input
                          value={player.name}
                          onChange={(e) => updatePlayerName(team.id, player.id, e.target.value)}
                          placeholder="اسم المتسابق"
                          className={`flex-1 border-white/20 bg-white/5 text-white placeholder:text-gray-500 ${colors.inputFocus} ${
                            player.error ? 'border-red-500 ring-2 ring-red-500/30' : ''
                          }`}
                        />
                        <button
                          onClick={() => removePlayer(team.id, player.id)}
                          className="rounded-md bg-red-500/20 p-2 text-red-400 transition-all hover:bg-red-500/30 hover:scale-105 active:scale-95"
                          title="حذف المتسابق"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {player.error && (
                        <p className="mr-8 text-sm text-red-400">
                          {player.error}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Add Player Button */}
                  <button
                    onClick={() => addPlayer(team.id)}
                    className={`w-full rounded-lg border-2 border-dashed ${colors.border} py-3 font-semibold ${colors.accent} transition-all duration-200 hover:${colors.bg} hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <Plus className="ml-2 inline-block h-5 w-5" />
                    إضافة متسابق
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Configuration Options */}
        <div className="mt-6 grid gap-4 rounded-xl border border-[#1e3a5f] bg-[#0c1628] p-4 sm:grid-cols-2">
          {/* Rounds Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              عدد الجولات
            </label>
            <Select value={rounds} onValueChange={setRounds}>
              <SelectTrigger className="w-full border-[#1e3a5f] bg-[#0f1f35] text-white">
                <SelectValue placeholder="اختر عدد الجولات" />
              </SelectTrigger>
              <SelectContent className="border-[#1e3a5f] bg-[#0f1f35] text-white">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem 
                    key={num} 
                    value={num.toString()}
                    className="focus:bg-[#22b8cf]/20 focus:text-white"
                  >
                    {num} {num === 1 ? 'جولة' : 'جولات'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timer Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              الوقت لكل متسابق (ثانية)
            </label>
            <Select value={timePerPlayer} onValueChange={setTimePerPlayer}>
              <SelectTrigger className="w-full border-[#1e3a5f] bg-[#0f1f35] text-white">
                <SelectValue placeholder="اختر الوقت" />
              </SelectTrigger>
              <SelectContent className="border-[#1e3a5f] bg-[#0f1f35] text-white">
                {[10, 15, 20, 30, 45, 60, 90, 120].map((seconds) => (
                  <SelectItem 
                    key={seconds} 
                    value={seconds.toString()}
                    className="focus:bg-[#22b8cf]/20 focus:text-white"
                  >
                    {seconds} ثانية
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-6">
          <button
            onClick={handleContinue}
            className="group relative w-full overflow-hidden rounded-xl bg-[#22b8cf] px-8 py-4 text-xl font-bold text-white shadow-lg shadow-[#22b8cf]/30 transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[#1fa8bd] hover:shadow-xl hover:shadow-[#22b8cf]/40 active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            <span className="relative">متابعة</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
