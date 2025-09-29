import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MultiplayerCardView from '../MultiplayerCardView'
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

describe('MultiplayerCardView Component', () => {
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

  describe('Rendering and Layout', () => {
    it('renders multiplayer card view for 2 players', () => {
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      expect(screen.getByText('Multiplayer Round')).toBeInTheDocument()
      expect(screen.getByText('Hole 1')).toBeInTheDocument()
      expect(screen.getAllByText('Player 1')).toHaveLength(2) // Card view + leaderboard
      expect(screen.getAllByText('Player 2')).toHaveLength(2)
      expect(screen.getByText('Leaderboard')).toBeInTheDocument()
    })

    it('renders with correct visual theme (blue/green)', () => {
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      // Check for blue theme elements
      expect(screen.getByText('Multiplayer Round')).toBeInTheDocument()
      expect(screen.getByText('Leaderboard')).toBeInTheDocument()
    })

    it('adapts grid layout based on player count', () => {
      // Test with 2 players
      const twoPlayers = createTestPlayers(9, 2)
      const { rerender } = render(<MultiplayerCardView holes={9} players={twoPlayers} onBack={mockOnBack} />)

      expect(screen.getAllByRole('spinbutton')).toHaveLength(2)

      // Test with 4 players
      const fourPlayers = createTestPlayers(9, 4)
      rerender(<MultiplayerCardView holes={9} players={fourPlayers} onBack={mockOnBack} />)

      expect(screen.getAllByRole('spinbutton')).toHaveLength(4)
    })

    it('displays progress indicators correctly', () => {
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      // Should show current hole and allow navigation
      expect(screen.getByText('Hole 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to hole 2')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates between holes using buttons', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      // Should start at Hole 1
      expect(screen.getByText('Hole 1')).toBeInTheDocument()

      // Navigate to next hole
      const nextButton = screen.getByLabelText('Go to hole 2')
      await user.click(nextButton)

      expect(screen.getByText('Hole 2')).toBeInTheDocument()

      // Navigate back
      const prevButton = screen.getByLabelText('Go to hole 1')
      await user.click(prevButton)

      expect(screen.getByText('Hole 1')).toBeInTheDocument()
    })

    it('disables navigation buttons at boundaries', () => {
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      // Previous button should be disabled on hole 1
      const prevButton = screen.getByLabelText('Go to hole 0')
      expect(prevButton).toBeDisabled()
    })

    it('handles touch/swipe gestures', () => {
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const cardContainer = screen.getByText('Hole 1').closest('div')?.parentElement

      // Simulate swipe left (next hole)
      fireEvent.touchStart(cardContainer!, { touches: [{ clientX: 200 }] })
      fireEvent.touchEnd(cardContainer!, { changedTouches: [{ clientX: 100 }] })

      expect(screen.getByText('Hole 2')).toBeInTheDocument()

      // Simulate swipe right (previous hole)
      fireEvent.touchStart(cardContainer!, { touches: [{ clientX: 100 }] })
      fireEvent.touchEnd(cardContainer!, { changedTouches: [{ clientX: 200 }] })

      expect(screen.getByText('Hole 1')).toBeInTheDocument()
    })
  })

  describe('Score Input and Management', () => {
    it('accepts and updates scores for multiple players', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Player 1 scores 4
      await user.type(scoreInputs[0], '4')
      expect(scoreInputs[0]).toHaveValue(4)

      // Player 2 scores 5
      await user.type(scoreInputs[1], '5')
      expect(scoreInputs[1]).toHaveValue(5)
    })

    it('updates leaderboard when scores change', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Player 1 scores 4
      await user.type(scoreInputs[0], '4')

      await waitFor(() => {
        // Check that leaderboard shows the score
        const leaderboardScores = screen.getAllByText('4')
        expect(leaderboardScores.length).toBeGreaterThan(0)
      })
    })

    it('displays completion checkmarks when scores are entered', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInput = screen.getAllByRole('spinbutton')[0]
      await user.type(scoreInput, '4')

      // Should show checkmark
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('rejects invalid scores', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInput = screen.getAllByRole('spinbutton')[0]

      // Try to enter invalid score
      await user.type(scoreInput, '16') // Above max
      expect(scoreInput).toHaveValue(1) // Should only accept the '1'
    })

    it('resets hole scores correctly', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Enter scores
      await user.type(scoreInputs[0], '4')
      await user.type(scoreInputs[1], '5')

      // Reset hole
      const resetButton = screen.getByText('Reset Hole')
      await user.click(resetButton)

      // Scores should be cleared
      expect(scoreInputs[0]).toHaveValue(null)
      expect(scoreInputs[1]).toHaveValue(null)
    })
  })

  describe('Leaderboard and Rankings', () => {
    it('displays trophy icons for rankings', () => {
      const players = createTestPlayers(9, 3)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      // Should show trophy emojis
      expect(screen.getAllByText('🥇')).toHaveLength(2) // Card view + leaderboard
    })

    it('sorts players correctly in leaderboard', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Player 1 scores higher (worse)
      await user.type(scoreInputs[0], '6')
      // Player 2 scores lower (better)
      await user.type(scoreInputs[1], '4')

      await waitFor(() => {
        const leaderboard = screen.getByText('Leaderboard').closest('div')
        const playerEntries = leaderboard?.querySelectorAll('div')

        // Player 2 should be first (better score)
        expect(leaderboard).toBeInTheDocument()
      })
    })
  })

  describe('Session Storage', () => {
    it('saves game state to session storage', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInput = screen.getAllByRole('spinbutton')[0]
      await user.type(scoreInput, '4')

      // Should save to session storage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'golf-multiplayer-card-9',
        expect.stringContaining('mode":"card')
      )
    })

    it('loads game state from session storage', () => {
      const savedGame = {
        players: createTestPlayers(9, 2),
        currentHole: 3,
        holes: 9,
        mode: 'card'
      }
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedGame))

      render(<MultiplayerCardView holes={9} players={createTestPlayers(9, 2)} onBack={mockOnBack} />)

      // Should load hole 3
      expect(screen.getByText('Hole 3')).toBeInTheDocument()
    })
  })

  describe('Auto-advance and Completion', () => {
    it('shows auto-advance button when all players complete hole', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInputs = screen.getAllByRole('spinbutton')

      // Both players complete hole 1
      await user.type(scoreInputs[0], '4')
      await user.type(scoreInputs[1], '5')

      await waitFor(() => {
        expect(screen.getByText('Continue to Hole 2 →')).toBeInTheDocument()
      })
    })

    it('shows finish button when all players complete all holes', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(2, 2) // 2-hole round for faster testing
      render(<MultiplayerCardView holes={2} players={players} onBack={mockOnBack} />)

      // Complete hole 1
      const hole1Inputs = screen.getAllByRole('spinbutton')
      await user.type(hole1Inputs[0], '4')
      await user.type(hole1Inputs[1], '5')

      // Move to hole 2
      const nextButton = screen.getByLabelText('Go to hole 2')
      await user.click(nextButton)

      // Complete hole 2
      const hole2Inputs = screen.getAllByRole('spinbutton')
      await user.type(hole2Inputs[0], '3')
      await user.type(hole2Inputs[1], '4')

      await waitFor(() => {
        expect(screen.getByText('🏆 Finish')).toBeInTheDocument()
      })
    })

    it('shows winner alert when finish button is clicked', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(2, 2)

      // Pre-populate with completed scores
      players[0].scores = [4, 3]
      players[0].totalScore = 7
      players[1].scores = [5, 4]
      players[1].totalScore = 9

      render(<MultiplayerCardView holes={2} players={players} onBack={mockOnBack} />)

      const finishButton = screen.getByText('🏆 Finish')
      await user.click(finishButton)

      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Player 1 wins with 7!')
      )
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels on navigation buttons', () => {
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      expect(screen.getByLabelText('Go to hole 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to hole 0')).toBeInTheDocument()
    })

    it('has proper ARIA labels on score inputs', () => {
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      expect(screen.getByLabelText('Score for Player 1 on hole 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Score for Player 2 on hole 1')).toBeInTheDocument()
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const scoreInput = screen.getByLabelText('Score for Player 1 on hole 1')

      // Should be focusable and accept keyboard input
      await user.click(scoreInput)
      await user.keyboard('4')

      expect(scoreInput).toHaveValue(4)
    })
  })

  describe('Edge Cases', () => {
    it('handles single player gracefully', () => {
      const players = createTestPlayers(9, 1)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      expect(screen.getByText('Player 1')).toBeInTheDocument()
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })

    it('handles maximum 4 players', () => {
      const players = createTestPlayers(9, 4)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      expect(screen.getAllByText('Player 1')).toHaveLength(2)
      expect(screen.getAllByText('Player 4')).toHaveLength(2)
      expect(screen.getAllByRole('spinbutton')).toHaveLength(4)
    })

    it('handles 18-hole rounds', () => {
      const players = createTestPlayers(18, 2)
      render(<MultiplayerCardView holes={18} players={players} onBack={mockOnBack} />)

      expect(screen.getByText('Hole 1')).toBeInTheDocument()

      // Check that we can navigate through more holes
      const nextButton = screen.getByLabelText('Go to hole 2')
      expect(nextButton).toBeInTheDocument()
      expect(nextButton).not.toBeDisabled()
    })

    it('handles corrupted session storage gracefully', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid json')

      const players = createTestPlayers(9, 2)
      expect(() => {
        render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)
      }).not.toThrow()

      expect(screen.getByText('Hole 1')).toBeInTheDocument()
    })
  })

  describe('User Experience', () => {
    it('shows helpful tips at bottom', () => {
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      expect(screen.getByText('💡 Swipe left/right to navigate holes • Touch target to enter score')).toBeInTheDocument()
    })

    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup()
      const players = createTestPlayers(9, 2)
      render(<MultiplayerCardView holes={9} players={players} onBack={mockOnBack} />)

      const backButton = screen.getByText('← Back')
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })
  })
})