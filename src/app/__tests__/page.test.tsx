import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'

// Mock the ScoreCard component
jest.mock('../../components/ScoreCard', () => {
  return function MockScoreCard({ holes, players, onBack }: { holes: number; players: any[]; onBack: () => void }) {
    return (
      <div data-testid="scorecard">
        <div>ScoreCard for {holes} holes</div>
        <div>Players: {players?.length || 0}</div>
        <button onClick={onBack} data-testid="back-button">Back</button>
      </div>
    )
  }
})

// Mock the MultiplayerCardView component
jest.mock('../../components/MultiplayerCardView', () => {
  return function MockMultiplayerCardView({ holes, players, onBack }: { holes: number; players: any[]; onBack: () => void }) {
    return (
      <div data-testid="multiplayer-card-view">
        <div>MultiplayerCardView for {holes} holes</div>
        <div>Players: {players?.length || 0}</div>
        <button onClick={onBack} data-testid="back-button">Back</button>
      </div>
    )
  }
})

describe('Home Page', () => {
  describe('Initial Render (Splash Page)', () => {
    it('renders the splash page with branding', () => {
      render(<Home />)

      expect(screen.getByText('ShotMate')).toBeInTheDocument()
      expect(screen.getByText('Your perfect golf companion')).toBeInTheDocument()
      expect(screen.getByText('Start Tracking')).toBeInTheDocument()
    })

    it('renders feature highlights', () => {
      render(<Home />)

      expect(screen.getByText('Score Tracking')).toBeInTheDocument()
      expect(screen.getByText('Mobile Ready')).toBeInTheDocument()
      expect(screen.getByText('Quick Entry')).toBeInTheDocument()
      expect(screen.getByText('Track Progress')).toBeInTheDocument()
    })

    it('renders coming soon message', () => {
      render(<Home />)

      expect(screen.getByText('Coming soon: Sign in to save your rounds')).toBeInTheDocument()
    })
  })

  describe('Navigation Flow', () => {
    it('navigates to round selection when start button is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      expect(screen.getByText('Choose Your Round')).toBeInTheDocument()
      expect(screen.getByText('⛳ ShotMate')).toBeInTheDocument()
    })

    it('shows round selection buttons after clicking start', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      expect(screen.getByText('9 Holes')).toBeInTheDocument()
      expect(screen.getByText('18 Holes')).toBeInTheDocument()
      expect(screen.getByText('Quick round')).toBeInTheDocument()
      expect(screen.getByText('Full round')).toBeInTheDocument()
    })

    it('navigates to player setup when 9-hole button is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // First click start to get to round selection
      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      // Then click 9-hole button
      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      await user.click(nineHoleButton)

      await waitFor(() => {
        expect(screen.getByText('Player Setup')).toBeInTheDocument()
        expect(screen.getByText('9 Hole Round')).toBeInTheDocument()
      })
    })

    it('navigates to player setup when 18-hole button is clicked', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // First click start to get to round selection
      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      // Then click 18-hole button
      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })
      await user.click(eighteenHoleButton)

      await waitFor(() => {
        expect(screen.getByText('Player Setup')).toBeInTheDocument()
        expect(screen.getByText('18 Hole Round')).toBeInTheDocument()
      })
    })

    it('navigates through full flow: round selection → player setup → scorecard', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Navigate to round selection
      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      // Select 9 holes
      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      await user.click(nineHoleButton)

      // Should now be on player setup
      await waitFor(() => {
        expect(screen.getByText('Player Setup')).toBeInTheDocument()
        expect(screen.getByText('Continue to Scoring')).toBeInTheDocument()
      })

      // Continue to scorecard
      const continueButton = screen.getByText('Continue to Scoring')
      await user.click(continueButton)

      await waitFor(() => {
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
        expect(screen.getByText('ScoreCard for 9 holes')).toBeInTheDocument()
      })
    })

    it('routes single player to traditional scorecard', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Navigate to round selection → player setup → scorecard
      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      await user.click(nineHoleButton)

      // Player setup with 1 player (default)
      const continueButton = screen.getByText('Continue to Scoring')
      await user.click(continueButton)

      await waitFor(() => {
        // Should use traditional ScoreCard for single player
        expect(screen.getByTestId('scorecard')).toBeInTheDocument()
        expect(screen.getByText('ScoreCard for 9 holes')).toBeInTheDocument()
        expect(screen.getByText('Players: 1')).toBeInTheDocument()
      })
    })

    it('routes multiplayer to card-based view', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Navigate to round selection → player setup → multiplayer card view
      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      await user.click(nineHoleButton)

      // Add a second player
      const addPlayerButton = screen.getByText(/Add Player/)
      await user.click(addPlayerButton)

      const continueButton = screen.getByText('Continue to Scoring')
      await user.click(continueButton)

      await waitFor(() => {
        // Should use MultiplayerCardView for 2+ players
        expect(screen.getByTestId('multiplayer-card-view')).toBeInTheDocument()
        expect(screen.getByText('MultiplayerCardView for 9 holes')).toBeInTheDocument()
        expect(screen.getByText('Players: 2')).toBeInTheDocument()
      })
    })
  })

  describe('Button Interactions', () => {
    it('start button responds to clicks', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const startButton = screen.getByText('Start Tracking')
      expect(startButton).toBeEnabled()

      await user.click(startButton)

      expect(screen.getByText('Choose Your Round')).toBeInTheDocument()
    })

    it('round selection buttons work after navigation', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Navigate to round selection
      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })

      expect(nineHoleButton).toBeEnabled()
      expect(eighteenHoleButton).toBeEnabled()
    })
  })

  describe('CSS Classes and Styling', () => {
    it('applies correct styling to splash page elements', () => {
      render(<Home />)

      const title = screen.getByText('ShotMate')
      expect(title).toHaveClass('text-5xl', 'font-bold', 'text-white')

      const subtitle = screen.getByText('Your perfect golf companion')
      expect(subtitle).toHaveClass('text-xl', 'text-white/90')
    })

    it('applies correct styling to round selection after navigation', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Navigate to round selection
      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      const nineHoleButton = screen.getByRole('button', { name: /9 holes/i })
      const eighteenHoleButton = screen.getByRole('button', { name: /18 holes/i })

      expect(nineHoleButton).toHaveClass('bg-amber-50', 'hover:bg-amber-100', 'text-amber-900')
      expect(eighteenHoleButton).toHaveClass('bg-stone-50', 'hover:bg-stone-100', 'text-stone-900')
    })
  })

  describe('Accessibility', () => {
    it('has proper button roles and names on splash page', () => {
      render(<Home />)

      expect(screen.getByRole('button', { name: /start tracking/i })).toBeInTheDocument()
    })

    it('has proper button roles after navigation', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      expect(screen.getByRole('button', { name: /9 holes/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /18 holes/i })).toBeInTheDocument()
    })

    it('has proper heading hierarchy on splash page', () => {
      render(<Home />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('ShotMate')
    })

    it('has proper heading hierarchy after navigation', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('⛳ ShotMate')

      const subHeading = screen.getByRole('heading', { level: 2 })
      expect(subHeading).toHaveTextContent('Choose Your Round')
    })
  })

  describe('Content Structure', () => {
    it('displays emojis correctly on splash page', () => {
      render(<Home />)

      expect(screen.getByText('⛳')).toBeInTheDocument() // Logo placeholder
      expect(screen.getByText('🏌️‍♂️')).toBeInTheDocument() // Start button emoji
    })

    it('displays emojis correctly after navigation', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      expect(screen.getByText(/⛳ ShotMate/)).toBeInTheDocument() // Main title with emoji
      expect(screen.getByText('🌅')).toBeInTheDocument() // 9-hole emoji
      expect(screen.getByText('🌞')).toBeInTheDocument() // 18-hole emoji
    })

    it('shows footer text after navigation', async () => {
      const user = userEvent.setup()
      render(<Home />)

      const startButton = screen.getByText('Start Tracking')
      await user.click(startButton)

      expect(screen.getByText('Mobile-optimized for on-course use')).toBeInTheDocument()
    })
  })
})