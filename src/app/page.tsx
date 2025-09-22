'use client'

import { useState } from 'react'
import ScoreCard from '@/components/ScoreCard'
import { RoundType } from '@/types'

export default function Home() {
  const [selectedRound, setSelectedRound] = useState<RoundType | null>(null)

  const handleRoundSelect = (holes: RoundType) => {
    setSelectedRound(holes)
  }

  const handleBackToSelection = () => {
    setSelectedRound(null)
  }

  if (selectedRound) {
    return <ScoreCard holes={selectedRound} onBack={handleBackToSelection} />
  }

  return (
    <div className="text-center space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-golf-green-700">
          ⛳ Golf Tracker
        </h1>
        <p className="text-lg text-gray-600">
          Track your golf scores with ease
        </p>
      </div>

      {/* Round Selection */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Choose Your Round
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => handleRoundSelect(9)}
            className="w-full py-6 px-8 bg-golf-green-500 hover:bg-golf-green-600 text-white text-xl font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <div className="space-y-2">
              <div className="text-2xl">🌅</div>
              <div>9 Holes</div>
              <div className="text-sm opacity-90">Quick round</div>
            </div>
          </button>

          <button
            onClick={() => handleRoundSelect(18)}
            className="w-full py-6 px-8 bg-golf-green-600 hover:bg-golf-green-700 text-white text-xl font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <div className="space-y-2">
              <div className="text-2xl">🌞</div>
              <div>18 Holes</div>
              <div className="text-sm opacity-90">Full round</div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 text-sm text-gray-500">
        <p>Mobile-optimized for on-course use</p>
      </div>
    </div>
  )
}