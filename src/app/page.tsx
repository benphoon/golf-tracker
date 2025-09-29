'use client'

import { useState } from 'react'
import ScoreCard from '@/components/ScoreCard'
import MultiplayerCardView from '@/components/MultiplayerCardView'
import SplashPage from '@/components/SplashPage'
import RoundSelection from '@/components/RoundSelection'
import PlayerSetup from '@/components/PlayerSetup'
import { RoundType, Player } from '@/types'

type AppState = 'splash' | 'roundSelection' | 'playerSetup' | 'scorecard'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('splash')
  const [selectedRound, setSelectedRound] = useState<RoundType | null>(null)
  const [players, setPlayers] = useState<Player[]>([])

  const handleStart = () => {
    setAppState('roundSelection')
  }

  const handleRoundSelect = (holes: RoundType) => {
    setSelectedRound(holes)
    setAppState('playerSetup')
  }

  const handlePlayersSetup = (setupPlayers: Player[]) => {
    setPlayers(setupPlayers)
    setAppState('scorecard')
  }

  const handleBackToSelection = () => {
    setAppState('roundSelection')
    setSelectedRound(null)
    setPlayers([])
  }

  const handleBackToPlayerSetup = () => {
    setAppState('playerSetup')
  }

  if (appState === 'splash') {
    return <SplashPage onStart={handleStart} />
  }

  if (appState === 'playerSetup' && selectedRound) {
    return (
      <PlayerSetup
        holes={selectedRound}
        onContinue={handlePlayersSetup}
        onBack={handleBackToSelection}
      />
    )
  }

  if (appState === 'scorecard' && selectedRound && players.length > 0) {
    // Use MultiplayerCardView for multiplayer games (2+ players)
    // Use ScoreCard for single player practice (1 player)
    if (players.length === 1) {
      return (
        <ScoreCard
          holes={selectedRound}
          players={players}
          onBack={handleBackToPlayerSetup}
        />
      )
    } else {
      return (
        <MultiplayerCardView
          holes={selectedRound}
          players={players}
          onBack={handleBackToPlayerSetup}
        />
      )
    }
  }

  return <RoundSelection onRoundSelect={handleRoundSelect} />
}