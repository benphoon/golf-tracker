'use client'

import { RoundType } from '@/types'

interface RoundSelectionProps {
  onRoundSelect: (holes: RoundType) => void
}

export default function RoundSelection({ onRoundSelect }: RoundSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            ⛳ ShotMate
          </h1>
          <p className="text-lg text-white/90 drop-shadow-md">
            Your perfect golf scoring companion
          </p>
        </div>

        {/* Round Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white drop-shadow-md">
            Choose Your Round
          </h2>

          <div className="space-y-4">
            <button
              onClick={() => onRoundSelect(9)}
              className="w-full py-6 px-8 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xl font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-amber-200 hover:border-amber-300"
            >
              <div className="space-y-2">
                <div className="text-2xl">🌅</div>
                <div>9 Holes</div>
                <div className="text-sm opacity-90">Quick round</div>
              </div>
            </button>

            <button
              onClick={() => onRoundSelect(18)}
              className="w-full py-6 px-8 bg-stone-50 hover:bg-stone-100 text-stone-900 text-xl font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-stone-200 hover:border-stone-300"
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
        <div className="pt-8 text-sm text-white/80">
          <p>Mobile-optimized for on-course use</p>
        </div>
      </div>
    </div>
  )
}