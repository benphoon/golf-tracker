'use client'

import { useState } from 'react'
import { RoundType, Player } from '@/types'

interface PlayerSetupProps {
  holes: RoundType
  onContinue: (players: Player[]) => void
  onBack: () => void
}

export default function PlayerSetup({ holes, onContinue, onBack }: PlayerSetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1'])

  const addPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`])
    }
  }

  const removePlayer = (index: number) => {
    if (playerNames.length > 1) {
      const newNames = playerNames.filter((_, i) => i !== index)
      setPlayerNames(newNames)
    }
  }

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames]
    newNames[index] = name
    setPlayerNames(newNames)
  }

  const handleContinue = () => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name: name.trim() || `Player ${index + 1}`,
      scores: Array(holes).fill(null),
      totalScore: 0
    }))
    onContinue(players)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-white hover:text-white/80 font-medium drop-shadow-md"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            Player Setup
          </h1>
          <div className="w-12" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white drop-shadow-md">
            {holes} Hole Round
          </h2>
          <p className="text-white/90 drop-shadow-md">
            Add 2-4 players for your round
          </p>
        </div>

        {/* Player List */}
        <div className="space-y-4">
          {playerNames.map((name, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                className="flex-1 py-4 px-4 text-lg font-medium text-gray-900 bg-white rounded-xl shadow-md border-2 border-gray-200 focus:border-amber-400 focus:outline-none focus:ring-0"
                placeholder={`Player ${index + 1}`}
                maxLength={20}
              />
              {playerNames.length > 1 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center text-lg font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {/* Add Player Button */}
          {playerNames.length < 4 && (
            <button
              onClick={addPlayer}
              className="w-full py-4 px-6 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-xl shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-amber-300 hover:border-amber-400"
            >
              + Add Player ({playerNames.length}/4)
            </button>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-6 px-8 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Continue to Scoring
        </button>

        {/* Footer */}
        <div className="pt-4 text-sm text-white/80">
          <p>You can edit player names during the round</p>
        </div>
      </div>
    </div>
  )
}