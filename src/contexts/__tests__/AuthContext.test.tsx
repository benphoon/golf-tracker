import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn(() => ({
      upsert: jest.fn(() => ({ error: null }))
    }))
  }
}))

import { supabase } from '../../lib/supabase'
const mockSupabase = supabase as jest.Mocked<typeof supabase>

// Test component that uses auth
function TestComponent() {
  const { user, loading, signUp, signIn, signOut } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <button onClick={() => signUp('test@example.com', 'password123')}>
        Sign Up
      </button>
      <button onClick={() => signIn('test@example.com', 'password123')}>
        Sign In
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null }
    })

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  })

  it('provides authentication context to children', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })
  })

  it('handles successful sign up', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signUp.mockResolvedValue({ error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toBeInTheDocument()
    })

    const signUpButton = screen.getByText('Sign Up')
    await user.click(signUpButton)

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          display_name: 'test'
        }
      }
    })
  })

  it('handles sign up errors', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signUp.mockResolvedValue({
      error: { message: 'Email already registered' }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toBeInTheDocument()
    })

    const signUpButton = screen.getByText('Sign Up')
    await user.click(signUpButton)

    // The error would be returned by the signUp function
    expect(mockSupabase.auth.signUp).toHaveBeenCalled()
  })

  it('handles successful sign in', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toBeInTheDocument()
    })

    const signInButton = screen.getByText('Sign In')
    await user.click(signInButton)

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('handles sign in errors', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid credentials' }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toBeInTheDocument()
    })

    const signInButton = screen.getByText('Sign In')
    await user.click(signInButton)

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled()
  })

  it('handles sign out', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signOut.mockResolvedValue({})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toBeInTheDocument()
    })

    const signOutButton = screen.getByText('Sign Out')
    await user.click(signOutButton)

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('restores session on app load', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' }
      }
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com')
    })
  })

  it('creates user profile on authentication', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' }
      }
    }

    // Mock the auth state change callback
    let authStateCallback: ((event: string, session: any) => void) | null = null
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return {
        data: { subscription: { unsubscribe: jest.fn() } }
      }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate authentication state change
    if (authStateCallback) {
      authStateCallback('SIGNED_IN', mockSession)
    }

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
    })
  })

  it('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})