'use client'

import { useState, useEffect } from 'react'
import { RoundType, Player } from '@/types'
import {
  calculatePar,
  formatRelativeToPar,
  isValidScore,
  calculateTotalScore,
  generateCompletionMessage
} from '@/utils/golf'

interface ScoreCardProps {
  holes: RoundType
  players: Player[]
  onBack: () => void
}

export default function ScoreCard({ holes, players: initialPlayers, onBack }: ScoreCardProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [currentHole, setCurrentHole] = useState(1)

  // Session storage key based on round type
  const storageKey = `golf-multiplayer-${holes}`

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
        console.error('Error loading saved game:', error)
      }
    }
  }, [holes, storageKey])

  // Save game state whenever players change
  useEffect(() => {
    const gameState = {
      players,
      currentHole,
      holes
    }
    sessionStorage.setItem(storageKey, JSON.stringify(gameState))
  }, [players, currentHole, holes, storageKey])

  const updateScore = (playerId: string, holeIndex: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10)
    if (numValue === null || (!isNaN(numValue) && isValidScore(numValue))) {
      setPlayers(prevPlayers =>
        prevPlayers.map(player => {
          if (player.id === playerId) {
            const newScores = [...player.scores]
            newScores[holeIndex] = numValue
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

  const resetScores = () => {
    setPlayers(prevPlayers =>
      prevPlayers.map(player => ({
        ...player,
        scores: Array(holes).fill(null),
        totalScore: 0
      }))
    )
    setCurrentHole(1)
    sessionStorage.removeItem(storageKey)
  }

  // Calculate leaderboard
  const sortedPlayers = [...players].sort((a, b) => {
    // Players with no scores go to bottom
    if (a.totalScore === 0 && b.totalScore === 0) return 0
    if (a.totalScore === 0) return 1
    if (b.totalScore === 0) return -1
    return a.totalScore - b.totalScore
  })

  const par = calculatePar(holes)
  const allPlayersFinished = players.every(player =>
    player.scores.filter(score => score !== null).length === holes
  )

  const getPlayerRankIcon = (playerIndex: number) => {
    if (sortedPlayers[playerIndex].totalScore === 0) return '👤'
    switch (playerIndex) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return '👤'
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-white hover:text-white/80 font-medium drop-shadow-md"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            {holes} Hole Round
          </h1>
          <div className="w-12" />
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Leaderboard</h2>
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getPlayerRankIcon(index)}</span>
                  <span className="font-semibold text-gray-800">{player.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">{player.totalScore}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    player.totalScore === 0 ? 'text-gray-400 bg-gray-200' :
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

        {/* Hole Navigation */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Hole</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
                disabled={currentHole === 1}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 rounded-lg"
              >
                ←
              </button>
              <span className="text-xl font-bold text-gray-800 min-w-[60px] text-center">
                Hole {currentHole}
              </span>
              <button
                onClick={() => setCurrentHole(Math.min(holes, currentHole + 1))}
                disabled={currentHole === holes}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 rounded-lg"
              >
                →
              </button>
            </div>
          </div>

          {/* Score Entry for Current Hole */}
          <div className="space-y-3">
            {players.map(player => (
              <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 font-medium text-gray-800">{player.name}</div>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={player.scores[currentHole - 1] || ''}
                  onChange={(e) => updateScore(player.id, currentHole - 1, e.target.value)}
                  className="w-20 py-2 px-3 text-lg font-medium text-center bg-white border-2 border-gray-300 rounded-lg focus:border-amber-400 focus:outline-none"
                  placeholder="--"
                  inputMode="numeric"
                />
              </div>
            ))}
          </div>
        </div>

        {/* All Holes Overview */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold text-gray-800">Player</th>
                  {Array.from({ length: holes }, (_, i) => (
                    <th key={i} className="text-center p-2 w-10 font-semibold text-gray-600">
                      {i + 1}
                    </th>
                  ))}
                  <th className="text-center p-2 font-semibold text-gray-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id} className="border-b last:border-b-0">
                    <td className="p-2 font-medium text-gray-800">{player.name}</td>
                    {player.scores.map((score, holeIndex) => (
                      <td key={holeIndex} className="text-center p-2">
                        <span className={`inline-block w-8 h-8 leading-8 rounded text-sm ${
                          score === null ? 'text-gray-400' : 'text-gray-800 bg-gray-100'
                        }`}>
                          {score || '–'}
                        </span>
                      </td>
                    ))}
                    <td className="text-center p-2">
                      <span className="font-bold text-lg text-gray-900">{player.totalScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={resetScores}
            className="flex-1 py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Reset All Scores
          </button>

          {allPlayersFinished && (
            <button
              onClick={() => {
                const winner = sortedPlayers[0]
                const message = `🏆 ${winner.name} wins with ${winner.totalScore}! (${formatRelativeToPar(winner.totalScore, par)})`
                alert(message)
              }}
              className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              🏆 Finish Round
            </button>
          )}
        </div>
      </div>
    </div>
  )
}