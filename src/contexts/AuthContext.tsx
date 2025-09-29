'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { AuthContextType, User } from '@/types'
import type { AuthError, Session } from '@supabase/supabase-js'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, immediately set loading to false
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          displayName: session.user.user_metadata?.display_name
        })
      }
      setLoading(false)
    }).catch((error) => {
      console.warn('Supabase auth error (expected in development):', error.message)
      setLoading(false)
    })

    // Listen for auth changes with error handling (only if Supabase is configured)
    if (!isSupabaseConfigured) {
      return // No cleanup needed if no subscription was created
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event, 'has session:', !!session)
      try {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            displayName: session.user.user_metadata?.display_name
          }
          setUser(userData)

          // Create or update user profile
          await createUserProfile(userData)
        } else {
          setUser(null)
        }
        setLoading(false)
      } catch (error) {
        console.warn('Auth state change error (expected in development):', error)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (userData: User) => {
    console.log('Creating user profile for:', userData.email)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userData.id,
          email: userData.email,
          display_name: userData.displayName || null,
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error creating user profile:', error)
      } else {
        console.log('User profile created successfully:', data)
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
    }
  }

  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication is not configured' }
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: email.split('@')[0] // Default display name from email
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication is not configured' }
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      return
    }

    try {
      setLoading(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}