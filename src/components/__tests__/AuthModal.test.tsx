import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from '../AuthModal'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the auth context
const mockAuth = {
  user: null,
  loading: false,
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn()
}

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => mockAuth
}))

describe('AuthModal Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.signUp.mockResolvedValue({})
    mockAuth.signIn.mockResolvedValue({})
  })

  it('does not render when closed', () => {
    render(<AuthModal isOpen={false} onClose={mockOnClose} />)
    expect(screen.queryByText('Sign in to save your rounds')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Sign in to save your rounds')).toBeInTheDocument()
    expect(screen.getByText('Track your progress over time')).toBeInTheDocument()
  })

  it('renders custom title and subtitle', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        title="Custom Title"
        subtitle="Custom Subtitle"
      />
    )
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument()
  })

  it('toggles between sign in and sign up modes', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Should start in sign in mode
    expect(screen.getByText('Sign In')).toHaveClass('bg-white', 'text-blue-600')
    expect(screen.getByRole('button', { name: /sign in/i })).toHaveTextContent('Sign In')

    // Switch to sign up mode
    const signUpTab = screen.getByText('Sign Up')
    await user.click(signUpTab)

    expect(screen.getByText('Sign Up')).toHaveClass('bg-white', 'text-blue-600')
    expect(screen.getByRole('button', { name: /create account/i })).toHaveTextContent('Create Account')
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('handles sign in form submission', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Fill in form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('handles sign up form submission', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Switch to sign up mode
    await user.click(screen.getByText('Sign Up'))

    // Fill in form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(mockAuth.signUp).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('shows validation errors', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
  })

  it('validates password confirmation in sign up mode', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Switch to sign up mode
    await user.click(screen.getByText('Sign Up'))

    // Fill in form with mismatched passwords
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'different')

    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Fill in form with short password
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), '123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
  })

  it('shows auth errors', async () => {
    const user = userEvent.setup()
    mockAuth.signIn.mockResolvedValue({ error: 'Invalid credentials' })

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Fill in form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('closes modal on successful authentication', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Fill in form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    await user.click(screen.getByLabelText('Close modal'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal when continue as guest is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    await user.click(screen.getByText('Continue as Guest'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()

    // Make signIn hang to test loading state
    let resolveSignIn: () => void
    const signInPromise = new Promise<void>((resolve) => {
      resolveSignIn = resolve
    })
    mockAuth.signIn.mockReturnValue(signInPromise)

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Fill in form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Should show loading state
    expect(screen.getByText('Signing In...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()

    // Resolve the promise
    resolveSignIn!()
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('starts in signup mode when specified', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} mode="signup" />)

    expect(screen.getByText('Sign Up')).toHaveClass('bg-white', 'text-blue-600')
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Form inputs should have proper labels
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')

    // Close button should have aria-label
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument()

    // Form should be properly structured
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
    const submitButton = signInButtons.find(button => button.getAttribute('type') === 'submit')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})