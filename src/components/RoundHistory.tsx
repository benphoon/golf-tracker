'use client'

import { useState, useEffect } from 'react'
import { SavedRound } from '@/types'
import { getUserRounds } from '@/lib/rounds'
import { formatRelativeToPar } from '@/utils/golf'

interface RoundHistoryProps {
  onBack: () => void
}

export default function RoundHistory({ onBack }: RoundHistoryProps) {
  const [rounds, setRounds] = useState<SavedRound[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedRound, setExpandedRound] = useState<string | null>(null)

  useEffect(() => {
    loadRounds()
  }, [])

  const loadRounds = async () => {
    try {
      setLoading(true)
      setError('')

      const result = await getUserRounds()

      if (result.error) {
        setError(result.error)
      } else {
        setRounds(result.rounds || [])
      }
    } catch (error) {
      setError('Failed to load round history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const toggleRoundExpansion = (roundId: string) => {
    setExpandedRound(expandedRound === roundId ? null : roundId)
  }

  if (loading) {
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
                ← Back
              </button>
              <h1 className="text-xl font-bold text-blue-900">Round History</h1>
              <div className="w-12" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="px-4 py-8">
          <div className="max-w-md mx-auto space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading History</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadRounds}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
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
              ← Back
            </button>
            <h1 className="text-xl font-bold text-blue-900">Round History</h1>
            <div className="w-12" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Summary Stats */}
          {rounds.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Golf Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{rounds.length}</div>
                  <div className="text-sm text-gray-600">Rounds Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      rounds.reduce((sum, round) => {
                        const totalScore = round.players.reduce((playerSum, player) => playerSum + player.totalScore, 0)
                        return sum + totalScore / round.players.length
                      }, 0) / rounds.length
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
              </div>
            </div>
          )}

          {/* Rounds List */}
          {rounds.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-6xl mb-4">⛳</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Rounds Yet</h2>
              <p className="text-gray-600 mb-4">Start tracking your golf progress by playing your first round!</p>
              <button
                onClick={onBack}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Play Your First Round
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rounds.map((round) => {
                const isExpanded = expandedRound === round.id
                const totalScore = round.players.reduce((sum, player) => sum + player.totalScore, 0)
                const avgScore = Math.round(totalScore / round.players.length)
                const par = round.coursePar || (round.holes === 9 ? 36 : 72)

                return (
                  <div key={round.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Round Header */}
                    <button
                      onClick={() => toggleRoundExpansion(round.id)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-blue-600 font-medium">
                              {formatDate(round.playedAt)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {round.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{round.players.length} player{round.players.length > 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{round.holes} holes</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{avgScore}</div>
                          <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                            avgScore < par ? 'text-green-700 bg-green-100' :
                            avgScore === par ? 'text-blue-700 bg-blue-100' :
                            'text-red-700 bg-red-100'
                          }`}>
                            {formatRelativeToPar(avgScore, par)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center mt-2">
                        <span className="text-blue-600 text-sm">
                          {isExpanded ? '− Hide Details' : '+ View Details'}
                        </span>
                      </div>
                    </button>

                    {/* Round Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <h4 className="font-semibold text-gray-800 mb-3">Player Scores</h4>
                        <div className="space-y-3">
                          {round.players
                            .sort((a, b) => a.totalScore - b.totalScore)
                            .map((player, index) => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                                </span>
                                <span className="font-medium text-gray-800">{player.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">{player.totalScore}</div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  player.totalScore < par ? 'text-green-700 bg-green-100' :
                                  player.totalScore === par ? 'text-blue-700 bg-blue-100' :
                                  'text-red-700 bg-red-100'
                                }`}>
                                  {formatRelativeToPar(player.totalScore, par)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Hole-by-hole scores */}
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-700 mb-2">Hole-by-Hole Scores</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left p-1 font-medium text-gray-600">Player</th>
                                  {Array.from({ length: round.holes }, (_, i) => (
                                    <th key={i} className="text-center p-1 w-6 font-medium text-gray-600">
                                      {i + 1}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {round.players.map(player => (
                                  <tr key={player.id} className="border-b border-gray-100 last:border-b-0">
                                    <td className="p-1 font-medium text-gray-800 truncate max-w-[60px]">
                                      {player.name}
                                    </td>
                                    {player.scores.map((score, holeIndex) => (
                                      <td key={holeIndex} className="text-center p-1">
                                        <span className="inline-block w-5 h-5 leading-5 text-xs bg-gray-100 rounded">
                                          {score}
                                        </span>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}