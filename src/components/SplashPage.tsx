'use client'

interface SplashPageProps {
  onStart: () => void
}

export default function SplashPage({ onStart }: SplashPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-8">

        {/* Logo Placeholder */}
        <div className="mx-auto w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border-2 border-white/30">
          <div className="text-6xl">⛳</div>
        </div>

        {/* Main Branding */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl tracking-tight">
            ShotMate
          </h1>
          <p className="text-xl text-white/90 drop-shadow-lg font-medium">
            Your perfect golf companion
          </p>
          <p className="text-sm text-white/70 drop-shadow-md leading-relaxed">
            Track your scores, improve your game, and enjoy every round on the course
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <button
            onClick={onStart}
            className="w-full py-4 px-8 bg-white text-green-800 text-xl font-bold rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl border-2 border-white/20"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Start Tracking</span>
              <span className="text-2xl">🏌️‍♂️</span>
            </div>
          </button>

          {/* Future login button placeholder */}
          <div className="text-center">
            <p className="text-white/60 text-sm">
              Coming soon: Sign in to save your rounds
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 pt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-white text-sm font-medium">Score Tracking</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-white text-sm font-medium">Mobile Ready</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-white text-sm font-medium">Quick Entry</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-white text-sm font-medium">Track Progress</div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="pt-4">
          <p className="text-white/50 text-xs">
            Optimized for golfers, by golfers
          </p>
        </div>
      </div>
    </div>
  )
}