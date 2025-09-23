import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'

// Mock the ScoreCard component
jest.mock('../../components/ScoreCard', () => {
  return function MockScoreCard({ holes, onBack }: { holes: number; onBack: () => void }) {
    return (
      <div data-testid="scorecard">
        <div>ScoreCard for {holes} holes</div>
        <button onClick={onBack} data-testid="back-button">Back</button>
      </div>
    )
  }
})

describe('Home Page', () => {
  describe('Initial Render', () => {
    it('renders the main title and description', () => {
      render(<Home />)

      expect(screen.getByText('⛳ ShotMate')).toBeInTheDocument()
      expect(screen.getByText('Your perfect golf scoring companion')).toBeInTheDocument()
    })

    it('renders round selection section', () => {
      render(<Home />)

      expect(screen.getByText('Choose Your Round')).toBeInTheDocument()
    })

    it('renders 9-hole button with correct content', () => {
      render(<Home />)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      expect(nineHoleButton).toBeInTheDocument()
      expect(screen.getByText('🌅')).toBeInTheDocument()
      expect(screen.getByText('9 Holes')).toBeInTheDocument()
      expect(screen.getByText('Quick round')).toBeInTheDocument()
    })

    it('renders 18-hole button with correct content', () => {
      render(<Home />)

      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })
      expect(eighteenHoleButton).toBeInTheDocument()
      expect(screen.getByText('🌞')).toBeInTheDocument()
      expect(screen.getByText('18 Holes')).toBeInTheDocument()
      expect(screen.getByText('Full round')).toBeInTheDocument()
    })

    it('renders footer text', () => {
      render(<Home />)

      expect(screen.getByText('Mobile-optimized for on-course use')).toBeInTheDocument()
    })
  })

  describe('Round Selection', () => {
    it('shows ScoreCard when 9-hole button is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      await user.click(nineHoleButton)

      await waitFor(() => {
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
        expect(screen.getByText('ScoreCard for 9 holes')).toBeInTheDocument()
      })

      // Main menu should be hidden
      expect(screen.queryByText('Choose Your Round')).not.toBeInTheDocument()
    })

    it('shows ScoreCard when 18-hole button is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })
      await user.click(eighteenHoleButton)

      await waitFor(() => {
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
        expect(screen.getByText('ScoreCard for 18 holes')).toBeInTheDocument()
      })

      // Main menu should be hidden
      expect(screen.queryByText('Choose Your Round')).not.toBeInTheDocument()
    })
  })

  describe('Navigation Back to Main Menu', () => {
    it('returns to main menu when back is called from 9-hole scorecard', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Navigate to 9-hole scorecard
      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      await user.click(nineHoleButton)

      await waitFor(() => {
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
      })

      // Click back button
      const backButton = screen.getByTestId('back-button')
      await user.click(backButton)

      await waitFor(() => {
        expect(screen.queryByTestId('scorecard')).not.toBeInTheDocument()
        expect(screen.getByText('Choose Your Round')).toBeInTheDocument()
      })
    })

    it('returns to main menu when back is called from 18-hole scorecard', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Navigate to 18-hole scorecard
      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })
      await user.click(eighteenHoleButton)

      await waitFor(() => {
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
      })

      // Click back button
      const backButton = screen.getByTestId('back-button')
      await user.click(backButton)

      await waitFor(() => {
        expect(screen.queryByTestId('scorecard')).not.toBeInTheDocument()
        expect(screen.getByText('Choose Your Round')).toBeInTheDocument()
      })
    })
  })

  describe('State Management', () => {
    it('maintains separate state for different round selections', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Select 9 holes
      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      await user.click(nineHoleButton)

      await waitFor(() => {
        expect(screen.getByText('ScoreCard for 9 holes')).toBeInTheDocument()
      })

      // Go back to main menu
      const backButton = screen.getByTestId('back-button')
      await user.click(backButton)

      await waitFor(() => {
        expect(screen.getByText('Choose Your Round')).toBeInTheDocument()
      })

      // Select 18 holes
      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })
      await user.click(eighteenHoleButton)

      await waitFor(() => {
        expect(screen.getByText('ScoreCard for 18 holes')).toBeInTheDocument()
      })
    })

    it('starts with no round selected', () => {
      render(<Home />)

      // Should show main menu, not scorecard
      expect(screen.getByText('Choose Your Round')).toBeInTheDocument()
      expect(screen.queryByTestId('scorecard')).not.toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('9-hole button responds to click events', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })

      // Button should be clickable
      expect(nineHoleButton).toBeEnabled()

      await user.click(nineHoleButton)

      await waitFor(() => {
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
      })
    })

    it('18-hole button responds to click events', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })

      // Button should be clickable
      expect(eighteenHoleButton).toBeEnabled()

      await user.click(eighteenHoleButton)

      await waitFor(() => {
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
      })
    })

    it('handles rapid button clicks gracefully', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })

      // Click multiple times rapidly
      await user.click(nineHoleButton)
      await user.click(nineHoleButton)
      await user.click(nineHoleButton)

      await waitFor(() => {
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
        expect(screen.getByText('ScoreCard for 9 holes')).toBeInTheDocument()
      })
    })
  })

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes to main elements', () => {
      render(<Home />)

      const title = screen.getByText('⛳ ShotMate')
      expect(title).toHaveClass('text-4xl', 'font-bold', 'text-white', 'drop-shadow-lg')

      const subtitle = screen.getByText('Your perfect golf scoring companion')
      expect(subtitle).toHaveClass('text-lg', 'text-white/90', 'drop-shadow-md')
    })

    it('applies different styling to 9-hole and 18-hole buttons', () => {
      render(<Home />)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })

      expect(nineHoleButton).toHaveClass('bg-amber-50', 'hover:bg-amber-100', 'text-amber-900')
      expect(eighteenHoleButton).toHaveClass('bg-stone-50', 'hover:bg-stone-100', 'text-stone-900')
    })
  })

  describe('Accessibility', () => {
    it('has proper button roles and names', () => {
      render(<Home />)

      expect(screen.getByRole('button', { name: /9 holes/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /18 holes/i })).toBeInTheDocument()
    })

    it('provides descriptive text for round options', () => {
      render(<Home />)

      expect(screen.getByText('Quick round')).toBeInTheDocument()
      expect(screen.getByText('Full round')).toBeInTheDocument()
    })

    it('has proper heading hierarchy', () => {
      render(<Home />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('⛳ ShotMate')

      const subHeading = screen.getByRole('heading', { level: 2 })
      expect(subHeading).toHaveTextContent('Choose Your Round')
    })
  })

  describe('Content Structure', () => {
    it('displays emojis correctly', () => {
      render(<Home />)

      expect(screen.getByText(/⛳ ShotMate/)).toBeInTheDocument() // Main title with emoji
      expect(screen.getByText('🌅')).toBeInTheDocument() // 9-hole emoji
      expect(screen.getByText('🌞')).toBeInTheDocument() // 18-hole emoji
    })

    it('has proper spacing and layout elements', () => {
      render(<Home />)

      const mainContainer = screen.getByText('Choose Your Round').closest('div')
      expect(mainContainer?.parentElement).toHaveClass('space-y-8')
    })
  })
})