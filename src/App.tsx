import React, { useState } from 'react'
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
        <LoadingSpinner />
      </ThemeProvider>
    )
  }

  if (!user) {
    return (
      <ThemeProvider>
        <AuthForm
          mode="login"
          onSubmit={handleAuth}
          loading={authLoading}
          error={authError}
          success={authSuccess}
        />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Dashboard user={user} onLogout={handleLogout} />
    </ThemeProvider>
  )
}

export default App