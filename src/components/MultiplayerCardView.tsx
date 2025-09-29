'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, Trophy, Medal, Award, User, Lightbulb } from 'lucide-react'
import { RoundType, Player } from '@/types'
import {
  calculatePar,
  formatRelativeToPar,
  isValidScore,
  calculateTotalScore,
} from '@/utils/golf'

interface MultiplayerCardViewProps {
  holes: RoundType
  players: Player[]
  onBack: () => void
}

export default function MultiplayerCardView({ holes, players: initialPlayers, onBack }: MultiplayerCardViewProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [currentHole, setCurrentHole] = useState(1)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  // Session storage key for multiplayer card view
  const storageKey = `golf-multiplayer-card-${holes}`

  // Load game state from session storage on mount
  useEffect(() => {
    const savedGame = sessionStorage.getItem(storageKey)
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame)
        if (parsedGame.players && Array.isArray(parsedGame.players)) {
          setPlayers(parsedGame.players)
          setCurrentHole(parsedGame.currentHole || 1)
        }
      } catch (error) {
        console.error('Error loading saved multiplayer game:', error)
      }
    }
  }, [holes, storageKey])

  // Save game state whenever players or hole changes
  useEffect(() => {
    const gameState = {
      players,
      currentHole,
      holes,
      mode: 'card'
    }
    sessionStorage.setItem(storageKey, JSON.stringify(gameState))
  }, [players, currentHole, holes, storageKey])

  const updateScore = (playerId: string, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10)
    if (numValue === null || (!isNaN(numValue) && isValidScore(numValue))) {
      setPlayers(prevPlayers =>
        prevPlayers.map(player => {
          if (player.id === playerId) {
            const newScores = [...player.scores]
            newScores[currentHole - 1] = numValue
            return {
              ...player,
              scores: newScores,
              totalScore: calculateTotalScore(newScores)
            }
          }
          return player
        })
      )
    }
  }

  const nextHole = useCallback(() => {
    if (currentHole < holes) {
      setCurrentHole(prev => prev + 1)
    }
  }, [currentHole, holes])

  const previousHole = useCallback(() => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1)
    }
  }, [currentHole])

  // Touch/swipe handling for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return

    const touchEndX = e.changedTouches[0].clientX
    const swipeDistance = touchStartX - touchEndX
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next hole
        nextHole()
      } else {
        // Swipe right - previous hole
        previousHole()
      }
    }
    setTouchStartX(null)
  }

  const resetHoleScores = () => {
    setPlayers(prevPlayers =>
      prevPlayers.map(player => {
        const newScores = [...player.scores]
        newScores[currentHole - 1] = null
        return {
          ...player,
          scores: newScores,
          totalScore: calculateTotalScore(newScores)
        }
      })
    )
  }

  const allPlayersCompletedHole = players.every(player => player.scores[currentHole - 1] !== null)
  const allPlayersFinished = players.every(player =>
    player.scores.filter(score => score !== null).length === holes
  )

  const par = calculatePar(holes)
  const currentHolePar = holes === 9 ? (currentHole <= 3 ? 4 : currentHole <= 6 ? 3 : 4) :
                                       (currentHole <= 6 ? 4 : currentHole <= 12 ? 3 : currentHole <= 16 ? 4 : 5)

  // Determine grid layout based on player count
  const getPlayerGridClass = () => {
    switch (players.length) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 gap-4'
      case 3:
        return 'grid-cols-2 gap-4'
      case 4:
        return 'grid-cols-2 gap-4'
      default:
        return 'grid-cols-2 gap-4'
    }
  }

  // Get current leaderboard position for each player
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.totalScore === 0 && b.totalScore === 0) return 0
    if (a.totalScore === 0) return 1
    if (b.totalScore === 0) return -1
    return a.totalScore - b.totalScore
  })

  const getPlayerPosition = (playerId: string) => {
    return sortedPlayers.findIndex(p => p.id === playerId) + 1
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" strokeWidth={2} />
      case 2: return <Medal className="w-5 h-5 text-gray-400" strokeWidth={2} />
      case 3: return <Award className="w-5 h-5 text-amber-600" strokeWidth={2} />
      default: return <User className="w-5 h-5 text-gray-500" strokeWidth={2} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
              Back
            </button>
            <h1 className="text-xl font-bold text-blue-900">
              Multiplayer Round
            </h1>
            <div className="w-12" />
          </div>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Hole Card */}
          <div
            className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Hole Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={previousHole}
                  disabled={currentHole === 1}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold transition-all"
                  aria-label={`Go to hole ${currentHole - 1}`}
                >
                  ←
                </button>

                <div className="text-center">
                  <div className="text-3xl font-bold">Hole {currentHole}</div>
                  <div className="text-blue-100">Par {currentHolePar}</div>
                </div>

                <button
                  onClick={nextHole}
                  disabled={currentHole === holes}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold transition-all"
                  aria-label={`Go to hole ${currentHole + 1}`}
                >
                  →
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center">
                <div className="flex gap-1">
                  {Array.from({ length: holes }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i + 1 === currentHole
                          ? 'bg-amber-400 w-6'
                          : i + 1 < currentHole
                          ? 'bg-white'
                          : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Player Scores Grid */}
            <div className="p-6">
              <div className={`grid ${getPlayerGridClass()}`}>
                {players.map((player) => {
                  const position = getPlayerPosition(player.id)
                  const currentScore = player.scores[currentHole - 1]

                  return (
                    <div
                      key={player.id}
                      className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100 transition-all hover:border-blue-200"
                    >
                      {/* Player Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPositionIcon(position)}
                          <span className="font-semibold text-blue-900 truncate">
                            {player.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-blue-600">Total</div>
                          <div className="font-bold text-blue-900">{player.totalScore}</div>
                        </div>
                      </div>

                      {/* Score Input */}
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="15"
                          value={currentScore || ''}
                          onChange={(e) => updateScore(player.id, e.target.value)}
                          className="w-full h-16 text-2xl font-bold text-center bg-white border-2 border-blue-200 rounded-xl focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                          placeholder="--"
                          inputMode="numeric"
                          aria-label={`Score for ${player.name} on hole ${currentHole}`}
                        />
                        {currentScore && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Hole Actions */}
              <div className="mt-6 space-y-3">
                {allPlayersCompletedHole && currentHole < holes && (
                  <button
                    onClick={nextHole}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95"
                  >
                    Continue to Hole {currentHole + 1} →
                  </button>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={resetHoleScores}
                    className="flex-1 py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-xl transition-all"
                  >
                    Reset Hole
                  </button>

                  {allPlayersFinished && (
                    <button
                      onClick={() => {
                        const winner = sortedPlayers[0]
                        const message = `🏆 ${winner.name} wins with ${winner.totalScore}! (${formatRelativeToPar(winner.totalScore, par)})`
                        alert(message)
                      }}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" strokeWidth={2} />
                        Finish
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Leaderboard */}
          <div className="mt-6 bg-white rounded-xl shadow-md border border-blue-100 p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 text-center">Leaderboard</h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getPositionIcon(index + 1)}
                    <span className="font-medium text-blue-900">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-900">{player.totalScore}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      player.totalScore === 0 ? 'text-gray-500 bg-gray-200' :
                      player.totalScore < par ? 'text-green-700 bg-green-100' :
                      player.totalScore === par ? 'text-blue-700 bg-blue-100' :
                      'text-red-700 bg-red-100'
                    }`}>
                      {player.totalScore === 0 ? '--' : formatRelativeToPar(player.totalScore, par)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 text-center text-sm text-blue-600">
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4" strokeWidth={2} />
              Swipe left/right to navigate holes • Touch target to enter score
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}