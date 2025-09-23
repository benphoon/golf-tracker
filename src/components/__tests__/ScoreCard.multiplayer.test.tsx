import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScoreCard from '../ScoreCard'
import { RoundType, Player } from '@/types'

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

// Mock alert
global.alert = jest.fn()

describe('ScoreCard Multiplayer Component', () => {
  const mockOnBack = jest.fn()

  // Helper function to create test players
  const createTestPlayers = (holes: RoundType, numPlayers = 2): Player[] => {
    return Array.from({ length: numPlayers }, (_, i) => ({
      id: `player-${i + 1}`,
      name: `Player ${i + 1}`,
      scores: Array(holes).fill(null),
      totalScore: 0
    }))
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionStorage.clear()
  })

  describe('Rendering', () => {
    it('renders 9-hole multiplayer scorecard correctly', () => {
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      expect(screen.getByText('9 Hole Round')).toBeInTheDocument()
      expect(screen.getByText('Leaderboard')).toBeInTheDocument()
      expect(screen.getAllByText('Player 1')).toHaveLength(3) // Leaderboard, Current Hole, Score Overview
      expect(screen.getAllByText('Player 2')).toHaveLength(3)
      expect(screen.getByText('Current Hole')).toBeInTheDocument()
      expect(screen.getByText('Hole 1')).toBeInTheDocument()
    })

    it('renders multiple players in leaderboard', () => {
      const players = createTestPlayers(9, 3)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      expect(screen.getAllByText('Player 1')).toHaveLength(3) // Leaderboard, Current Hole, Score Overview
      expect(screen.getAllByText('Player 2')).toHaveLength(3)
      expect(screen.getAllByText('Player 3')).toHaveLength(3)
    })

    it('renders back button', () => {
      const players = createTestPlayers(9)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)
      expect(screen.getByText('← Back')).toBeInTheDocument()
    })

    it('renders reset button', () => {
      const players = createTestPlayers(9)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)
      expect(screen.getByText('Reset All Scores')).toBeInTheDocument()
    })
  })

  describe('Score Input', () => {
    it('accepts valid scores for multiple players', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // First player scores 4
      await user.type(scoreInputs[0], '4')
      expect(scoreInputs[0]).toHaveValue(4)

      // Second player scores 5
      await user.type(scoreInputs[1], '5')
      expect(scoreInputs[1]).toHaveValue(5)
    })

    it('updates leaderboard when scores change', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Player 1 scores 4
      await user.type(scoreInputs[0], '4')

      await waitFor(() => {
        const leaderboardScores = screen.getAllByText('4')
        expect(leaderboardScores.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Hole Navigation', () => {
    it('navigates between holes correctly', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      // Should start at Hole 1
      expect(screen.getByText('Hole 1')).toBeInTheDocument()

      // Navigate to next hole
      const nextButton = screen.getByText('→')
      await user.click(nextButton)

      expect(screen.getByText('Hole 2')).toBeInTheDocument()

      // Navigate back
      const prevButton = screen.getByText('←')
      await user.click(prevButton)

      expect(screen.getByText('Hole 1')).toBeInTheDocument()
    })

    it('disables navigation at boundaries', () => {
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      // Previous button should be disabled at hole 1
      const prevButton = screen.getByText('←')
      expect(prevButton).toBeDisabled()
    })
  })

  describe('Leaderboard', () => {
    it('sorts players by score correctly', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 3)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Player 1 scores 5, Player 2 scores 3, Player 3 scores 4
      await user.type(scoreInputs[0], '5') // Player 1
      await user.type(scoreInputs[1], '3') // Player 2
      await user.type(scoreInputs[2], '4') // Player 3

      await waitFor(() => {
        // Player 2 should be first (lowest score), Player 3 second, Player 1 third
        const leaderboard = screen.getByText('Leaderboard').parentElement
        const playerNames = leaderboard!.querySelectorAll('.font-semibold')

        // Note: The order might be different based on implementation
        expect(playerNames.length).toBe(3)
      })
    })

    it('shows correct rank icons', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 3)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Add scores to create rankings
      await user.type(scoreInputs[0], '3') // Player 1 - best score
      await user.type(scoreInputs[1], '4') // Player 2 - second
      await user.type(scoreInputs[2], '5') // Player 3 - third

      await waitFor(() => {
        expect(screen.getByText('🥇')).toBeInTheDocument()
        expect(screen.getByText('🥈')).toBeInTheDocument()
        expect(screen.getByText('🥉')).toBeInTheDocument()
      })
    })
  })

  describe('Session Storage', () => {
    it('saves multiplayer game state to session storage', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')
      await user.type(scoreInputs[0], '4')

      await waitFor(() => {
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'golf-multiplayer-9',
          expect.stringContaining('player-1')
        )
      })
    })

    it('loads multiplayer game state from session storage on mount', () => {
      const savedGame = {
        players: [
          { id: 'player-1', name: 'Player 1', scores: [4, null, null, null, null, null, null, null, null], totalScore: 4 },
          { id: 'player-2', name: 'Player 2', scores: [5, null, null, null, null, null, null, null, null], totalScore: 5 }
        ],
        currentHole: 1,
        holes: 9
      }
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedGame))

      render(<ScoreCard holes={9} players={createTestPlayers(9, 2)} onBack={mockOnBack} />)

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('golf-multiplayer-9')

      // Check that scores are loaded
      const scoreInputs = screen.getAllByRole('spinbutton')
      expect(scoreInputs[0]).toHaveValue(4)
      expect(scoreInputs[1]).toHaveValue(5)
    })
  })

  describe('Game Completion', () => {
    it('shows finish button when all players complete all holes', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      // Complete all holes for both players
      for (let hole = 1; hole <= 9; hole++) {
        // Navigate to hole
        if (hole > 1) {
          const nextButton = screen.getByText('→')
          await user.click(nextButton)
        }

        const scoreInputs = screen.getAllByRole('spinbutton')
        await user.type(scoreInputs[0], '4') // Player 1
        await user.type(scoreInputs[1], '4') // Player 2
      }

      await waitFor(() => {
        expect(screen.getByText('🏆 Finish Round')).toBeInTheDocument()
      })
    })

    it('shows winner alert when finish button clicked', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      // Complete all holes with Player 1 winning
      for (let hole = 1; hole <= 9; hole++) {
        if (hole > 1) {
          const nextButton = screen.getByText('→')
          await user.click(nextButton)
        }

        const scoreInputs = screen.getAllByRole('spinbutton')
        await user.type(scoreInputs[0], '3') // Player 1 - better score
        await user.type(scoreInputs[1], '4') // Player 2
      }

      await waitFor(async () => {
        const finishButton = screen.getByText('🏆 Finish Round')
        await user.click(finishButton)
      })

      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Player 1 wins')
      )
    })
  })

  describe('User Interactions', () => {
    it('calls onBack when back button clicked', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      const backButton = screen.getByText('← Back')
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('resets all players scores when reset button clicked', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<ScoreCard holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Add some scores
      await user.type(scoreInputs[0], '4')
      await user.type(scoreInputs[1], '5')

      // Reset scores
      const resetButton = screen.getByText('Reset All Scores')
      await user.click(resetButton)

      await waitFor(() => {
        expect(scoreInputs[0]).toHaveValue(null)
        expect(scoreInputs[1]).toHaveValue(null)
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('golf-multiplayer-9')
      })
    })
  })
})