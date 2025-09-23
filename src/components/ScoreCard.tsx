'use client'

import { useState, useEffect } from 'react'
import { RoundType } from '@/types'
import {
  calculatePar,
  formatRelativeToPar,
  isValidScore,
  calculateTotalScore,
  generateCompletionMessage
} from '@/utils/golf'

interface ScoreCardProps {
  holes: RoundType
  onBack: () => void
}

export default function ScoreCard({ holes, onBack }: ScoreCardProps) {
  const [scores, setScores] = useState<(number | null)[]>(Array(holes).fill(null))
  const [totalScore, setTotalScore] = useState(0)

  // Session storage key based on round type
  const storageKey = `golf-scores-${holes}`

  // Load scores from session storage on mount
  useEffect(() => {
    const savedScores = sessionStorage.getItem(storageKey)
    if (savedScores) {
      try {
        const parsedScores = JSON.parse(savedScores)
        if (Array.isArray(parsedScores) && parsedScores.length === holes) {
          setScores(parsedScores)
        }
      } catch (error) {
        console.error('Error loading saved scores:', error)
      }
    }
  }, [holes, storageKey])

  // Calculate total score whenever scores change
  useEffect(() => {
    const total = calculateTotalScore(scores)
    setTotalScore(total)

    // Save to session storage
    sessionStorage.setItem(storageKey, JSON.stringify(scores))
  }, [scores, storageKey])

  const updateScore = (holeIndex: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10)
    if (numValue === null || (!isNaN(numValue) && isValidScore(numValue))) {
      const newScores = [...scores]
      newScores[holeIndex] = numValue
      setScores(newScores)
    }
  }

  const resetScores = () => {
    setScores(Array(holes).fill(null))
    sessionStorage.removeItem(storageKey)
  }

  const completedHoles = scores.filter(score => score !== null).length
  const par = calculatePar(holes)

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
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
        <div className="w-12" /> {/* Spacer for centering */}
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 text-center shadow-md">
          <div className="text-sm text-gray-600">Total Score</div>
          <div className="total-display">
            {totalScore}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-md">
          <div className="text-sm text-gray-600">vs Par ({par})</div>
          <div className={`text-2xl font-bold py-3 px-4 rounded-lg ${
            totalScore === 0 ? 'text-gray-400' :
            totalScore < par ? 'text-green-600 bg-green-100' :
            totalScore === par ? 'text-blue-600 bg-blue-100' :
            'text-red-600 bg-red-100'
          }`}>
            {formatRelativeToPar(totalScore, par)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-golf-green-600">
            {completedHoles}/{holes} holes
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-golf-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedHoles / holes) * 100}%` }}
          />
        </div>
      </div>

      {/* Score Grid */}
      <div className="scorecard-grid">
        <div className="text-center font-bold text-golf-green-700 mb-4">
          Enter Your Scores
        </div>

        <div className={`grid gap-3 ${holes === 9 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {Array.from({ length: holes }, (_, index) => (
            <div key={index} className="text-center">
              <div className="hole-number">
                Hole {index + 1}
              </div>
              <input
                type="number"
                min="1"
                max="15"
                value={scores[index] || ''}
                onChange={(e) => updateScore(index, e.target.value)}
                className="hole-input"
                placeholder="--"
                inputMode="numeric"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={resetScores}
          className="flex-1 py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Reset Scores
        </button>

        {completedHoles === holes && (
          <button
            onClick={() => {
              alert(generateCompletionMessage(totalScore, par))
            }}
            className="flex-1 py-3 px-6 bg-golf-green-500 hover:bg-golf-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Finish Round
          </button>
        )}
      </div>
      </div>
    </div>
  )
}