import React, { useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthForm } from './components/AuthForm'
import { Dashboard } from './components/Dashboard'
import { LoadingSpinner } from './components/LoadingSpinner'
import { useAuth } from './hooks/useAuth'
import { signIn, signUp, resetPassword } from './lib/supabase'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const { user, loading, isGuestMode } = useAuth()
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)

  // Check for missing environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Show guest prompt periodically
  useEffect(() => {
    if (isGuestMode && !showGuestPrompt) {
      const timer = setTimeout(() => {
        setShowGuestPrompt(true)
      }, 30000) // Show after 30 seconds

      return () => clearTimeout(timer)
    }
  }, [isGuestMode, showGuestPrompt])

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

  const handleGuestContinue = () => {
    setShowGuestPrompt(false)
    // Show again after 2 minutes
    setTimeout(() => setShowGuestPrompt(true), 120000)
  }

  if (loading) {
    return (
      <ThemeProvider>
        <LoadingSpinner message={isGuestMode ? "Loading BypassAC Hub (Guest Mode)..." : "Initializing BypassAC Hub..."} />
      </ThemeProvider>
    )
  }

  // Show auth form only if not in guest mode or if user explicitly wants to sign in
  if (!user && !isGuestMode) {
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
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          isGuestMode={isGuestMode}
          showGuestPrompt={showGuestPrompt}
          onGuestContinue={handleGuestContinue}
          onGuestSignUp={() => setShowGuestPrompt(false)}
        />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App