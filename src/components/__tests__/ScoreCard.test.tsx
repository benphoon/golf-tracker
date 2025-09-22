import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScoreCard from '../ScoreCard'
import { RoundType } from '@/types'

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

describe('ScoreCard Component', () => {
  const mockOnBack = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionStorage.clear()
  })

  describe('Rendering', () => {
    it('renders 9-hole scorecard correctly', () => {
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      expect(screen.getByText('9 Hole Round')).toBeInTheDocument()
      expect(screen.getByText('Total Score')).toBeInTheDocument()
      expect(screen.getByText('vs Par (36)')).toBeInTheDocument()
      expect(screen.getByText('0/9 holes')).toBeInTheDocument()

      // Should render 9 hole inputs
      for (let i = 1; i <= 9; i++) {
        expect(screen.getByText(`Hole ${i}`)).toBeInTheDocument()
      }
    })

    it('renders 18-hole scorecard correctly', () => {
      render(<ScoreCard holes={18} onBack={mockOnBack} />)

      expect(screen.getByText('18 Hole Round')).toBeInTheDocument()
      expect(screen.getByText('vs Par (72)')).toBeInTheDocument()
      expect(screen.getByText('0/18 holes')).toBeInTheDocument()

      // Should render 18 hole inputs
      for (let i = 1; i <= 18; i++) {
        expect(screen.getByText(`Hole ${i}`)).toBeInTheDocument()
      }
    })

    it('renders back button', () => {
      render(<ScoreCard holes={9} onBack={mockOnBack} />)
      expect(screen.getByText('← Back')).toBeInTheDocument()
    })

    it('renders reset button', () => {
      render(<ScoreCard holes={9} onBack={mockOnBack} />)
      expect(screen.getByText('Reset Scores')).toBeInTheDocument()
    })
  })

  describe('Score Input', () => {
    it('accepts valid scores (1-15)', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const firstHoleInput = screen.getAllByRole('spinbutton')[0]

      await user.type(firstHoleInput, '4')
      expect(firstHoleInput).toHaveValue(4)
    })

    it('rejects invalid scores', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const firstHoleInput = screen.getAllByRole('spinbutton')[0]

      // Try to input 0 (should be rejected)
      await user.type(firstHoleInput, '0')
      expect(firstHoleInput).toHaveValue(null)

      // Try to input 16 (should be rejected)
      await user.clear(firstHoleInput)
      await user.type(firstHoleInput, '16')
      expect(firstHoleInput).toHaveValue(1) // Only the '1' should be accepted
    })

    it('handles empty input correctly', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const firstHoleInput = screen.getAllByRole('spinbutton')[0]

      await user.type(firstHoleInput, '4')
      expect(firstHoleInput).toHaveValue(4)

      await user.clear(firstHoleInput)
      expect(firstHoleInput).toHaveValue(null)
    })
  })

  describe('Score Calculation', () => {
    it('calculates total score correctly', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Add scores to first 3 holes
      await user.type(inputs[0], '4')
      await user.type(inputs[1], '5')
      await user.type(inputs[2], '3')

      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument() // Total score
      })
    })

    it('shows correct par comparison for under par', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Score 3 on each hole (27 total, 9 under par)
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '3')
      }

      await waitFor(() => {
        expect(screen.getByText('-9')).toBeInTheDocument()
      })
    })

    it('shows correct par comparison for over par', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Score 5 on each hole (45 total, 9 over par)
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '5')
      }

      await waitFor(() => {
        expect(screen.getByText('+9')).toBeInTheDocument()
      })
    })

    it('shows E for even par', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Score 4 on each hole (36 total, even par)
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '4')
      }

      await waitFor(() => {
        expect(screen.getByText('E')).toBeInTheDocument()
      })
    })
  })

  describe('Progress Tracking', () => {
    it('updates progress correctly', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Initially 0/9 holes
      expect(screen.getByText('0/9 holes')).toBeInTheDocument()

      // Add score to first hole
      await user.type(inputs[0], '4')

      await waitFor(() => {
        expect(screen.getByText('1/9 holes')).toBeInTheDocument()
      })

      // Add score to second hole
      await user.type(inputs[1], '5')

      await waitFor(() => {
        expect(screen.getByText('2/9 holes')).toBeInTheDocument()
      })
    })

    it('shows finish button when all holes completed', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Complete all holes
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '4')
      }

      await waitFor(() => {
        expect(screen.getByText('Finish Round')).toBeInTheDocument()
      })
    })

    it('does not show finish button when holes incomplete', () => {
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      expect(screen.queryByText('Finish Round')).not.toBeInTheDocument()
    })
  })

  describe('Session Storage', () => {
    it('saves scores to session storage', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const firstHoleInput = screen.getAllByRole('spinbutton')[0]
      await user.type(firstHoleInput, '4')

      await waitFor(() => {
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'golf-scores-9',
          expect.stringContaining('4')
        )
      })
    })

    it('loads scores from session storage on mount', () => {
      const savedScores = [4, 5, 3, null, null, null, null, null, null]
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedScores))

      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('golf-scores-9')

      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs[0]).toHaveValue(4)
      expect(inputs[1]).toHaveValue(5)
      expect(inputs[2]).toHaveValue(3)
      expect(inputs[3]).toHaveValue(null)
    })

    it('handles corrupted session storage gracefully', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid json')

      // Should not throw an error
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs[0]).toHaveValue(null)
    })

    it('ignores session storage with wrong hole count', () => {
      const savedScores = [4, 5, 3] // Wrong length for 9-hole round
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedScores))

      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs[0]).toHaveValue(null)
    })
  })

  describe('User Interactions', () => {
    it('calls onBack when back button clicked', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const backButton = screen.getByText('← Back')
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('resets scores when reset button clicked', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Add some scores
      await user.type(inputs[0], '4')
      await user.type(inputs[1], '5')

      // Reset scores
      const resetButton = screen.getByText('Reset Scores')
      await user.click(resetButton)

      await waitFor(() => {
        expect(inputs[0]).toHaveValue(null)
        expect(inputs[1]).toHaveValue(null)
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('golf-scores-9')
      })
    })

    it('shows completion alert when finish button clicked', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Complete all holes with par scores
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '4')
      }

      await waitFor(() => {
        const finishButton = screen.getByText('Finish Round')
        return user.click(finishButton)
      })

      expect(global.alert).toHaveBeenCalledWith(
        'Round complete! Final score: 36 (Even par)'
      )
    })

    it('shows correct completion message for under par', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Complete all holes under par
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '3')
      }

      await waitFor(() => {
        const finishButton = screen.getByText('Finish Round')
        return user.click(finishButton)
      })

      expect(global.alert).toHaveBeenCalledWith(
        'Round complete! Final score: 27 (-9 under par)'
      )
    })

    it('shows correct completion message for over par', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Complete all holes over par
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '5')
      }

      await waitFor(() => {
        const finishButton = screen.getByText('Finish Round')
        return user.click(finishButton)
      })

      expect(global.alert).toHaveBeenCalledWith(
        'Round complete! Final score: 45 (+9 over par)'
      )
    })
  })

  describe('CSS Classes and Styling', () => {
    it('applies correct grid layout for 9 holes', () => {
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const grid = screen.getByText('Enter Your Scores').nextElementSibling
      expect(grid).toHaveClass('grid-cols-3')
    })

    it('applies correct grid layout for 18 holes', () => {
      render(<ScoreCard holes={18} onBack={mockOnBack} />)

      const grid = screen.getByText('Enter Your Scores').nextElementSibling
      expect(grid).toHaveClass('grid-cols-2')
    })

    it('applies correct styling for under par score', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Score under par
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '3')
      }

      await waitFor(() => {
        const parDisplay = screen.getByText('-9')
        expect(parDisplay).toHaveClass('text-green-600', 'bg-green-100')
      })
    })

    it('applies correct styling for over par score', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Score over par
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '5')
      }

      await waitFor(() => {
        const parDisplay = screen.getByText('+9')
        expect(parDisplay).toHaveClass('text-red-600', 'bg-red-100')
      })
    })

    it('applies correct styling for even par score', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Score even par
      for (let i = 0; i < 9; i++) {
        await user.type(inputs[i], '4')
      }

      await waitFor(() => {
        const parDisplay = screen.getByText('E')
        expect(parDisplay).toHaveClass('text-blue-600', 'bg-blue-100')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid input changes', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const firstHoleInput = screen.getAllByRole('spinbutton')[0]

      // Rapidly change values
      await user.type(firstHoleInput, '1')
      await user.clear(firstHoleInput)
      await user.type(firstHoleInput, '5')
      await user.clear(firstHoleInput)
      await user.type(firstHoleInput, '3')

      expect(firstHoleInput).toHaveValue(3)
    })

    it('maintains state consistency when switching between different hole inputs', async () => {
      const user = userEvent.setup()
      render(<ScoreCard holes={9} onBack={mockOnBack} />)

      const inputs = screen.getAllByRole('spinbutton')

      // Add scores to multiple holes
      await user.type(inputs[0], '4')
      await user.type(inputs[4], '6')
      await user.type(inputs[8], '3')

      // Verify all scores are maintained
      expect(inputs[0]).toHaveValue(4)
      expect(inputs[4]).toHaveValue(6)
      expect(inputs[8]).toHaveValue(3)

      await waitFor(() => {
        expect(screen.getByText('13')).toBeInTheDocument() // Total: 4+6+3
        expect(screen.getByText('3/9 holes')).toBeInTheDocument()
      })
    })
  })
})