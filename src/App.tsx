import React, { useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthForm } from './components/AuthForm'
import { Dashboard } from './components/Dashboard'
import { LoadingSpinner } from './components/LoadingSpinner'
import { useAuth } from './hooks/useAuth'
import { signIn, signUp, resetPassword } from './lib/supabase'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const { user, loading } = useAuth()
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  // Check for missing environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="glass backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Configuration Error
            </h1>
            <p className="text-gray-300 mb-6">
              Missing Supabase configuration. Please add your environment variables:
            </p>
            <div className="text-left bg-black/20 p-4 rounded-lg text-sm text-gray-300 font-mono">
              <div>VITE_SUPABASE_URL={supabaseUrl ? '✓' : '❌'}</div>
              <div>VITE_SUPABASE_ANON_KEY={supabaseAnonKey ? '✓' : '❌'}</div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Check your hosting platform's environment variables settings.
            </p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  const handleAuth = async (formData: any) => {
    setAuthLoading(true)
    setAuthError('')
    setAuthSuccess('')

    try {
      if (formData.mode === 'login') {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
      } else if (formData.mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password, formData.username)
        if (error) throw error
        setAuthSuccess(`Email sent to ${formData.email}! Please check your inbox to confirm your account.`)
      } else if (formData.mode === 'reset') {
        const { error } = await resetPassword(formData.email)
        if (error) throw error
        setAuthSuccess(`Password reset email sent to ${formData.email}!`)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setAuthError(error.message || 'An error occurred during authentication')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    window.location.reload()
  }

  if (loading) {
    return (
      <ThemeProvider>
        <LoadingSpinner message="Initializing BypassAC Hub..." />
      </ThemeProvider>
    )
  }

  if (!user) {
    return (
      <ThemeProvider>
        <ErrorBoundary>
          <AuthForm
            mode="login"
            onSubmit={handleAuth}
            loading={authLoading}
            error={authError}
            success={authSuccess}
          />
        </ErrorBoundary>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Dashboard user={user} onLogout={handleLogout} />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App