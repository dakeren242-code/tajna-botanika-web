import React from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { LogIn } from 'lucide-react'

export function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Přihlášení
            </h2>
            <p className="text-gray-400">
              Nebo{' '}
              <Link
                to="/signup"
                className="font-medium text-emerald-400 hover:text-emerald-300"
              >
                vytvořte si nový účet
              </Link>
            </p>
          </div>

          <LoginForm onSuccess={() => navigate('/')} />

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}