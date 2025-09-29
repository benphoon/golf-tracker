'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'

interface AuthButtonProps {
  className?: string
  variant?: 'button' | 'menu'
  onViewHistory?: () => void
}

export default function AuthButton({ className = '', variant = 'button', onViewHistory }: AuthButtonProps) {
  const { user, signOut, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="w-20 h-8 bg-gray-200 rounded-md"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className={`${className} bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg transition-colors`}
        >
          Sign In
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  if (variant === 'menu') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`${className} flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium`}
        >
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <span>{user.displayName || user.email.split('@')[0]}</span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
              {user.email}
            </div>
            <button
              onClick={() => {
                setShowUserMenu(false)
                onViewHistory?.()
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Round History
            </button>
            <button
              onClick={() => {
                setShowUserMenu(false)
                signOut()
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Click outside to close menu */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className={`${className} bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2`}
      >
        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
          {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
        </div>
        {user.displayName || user.email.split('@')[0]}
      </button>

      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
            {user.email}
          </div>
          <button
            onClick={() => {
              setShowUserMenu(false)
              onViewHistory?.()
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Round History
          </button>
          <button
            onClick={() => {
              setShowUserMenu(false)
              signOut()
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}

      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}