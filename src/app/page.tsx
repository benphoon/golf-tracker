'use client'

import { useState } from 'react'
import ScoreCard from '@/components/ScoreCard'
import SplashPage from '@/components/SplashPage'
import RoundSelection from '@/components/RoundSelection'
import { RoundType } from '@/types'

type AppState = 'splash' | 'roundSelection' | 'scorecard'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('splash')
  const [selectedRound, setSelectedRound] = useState<RoundType | null>(null)

  const handleStart = () => {
    setAppState('roundSelection')
  }

  const handleRoundSelect = (holes: RoundType) => {
    setSelectedRound(holes)
    setAppState('scorecard')
  }

  const handleBackToSelection = () => {
    setAppState('roundSelection')
    setSelectedRound(null)
  }

  if (appState === 'splash') {
    return <SplashPage onStart={handleStart} />
  }

  if (appState === 'scorecard' && selectedRound) {
    return <ScoreCard holes={selectedRound} onBack={handleBackToSelection} />
  }

  return <RoundSelection onRoundSelect={handleRoundSelect} />
}