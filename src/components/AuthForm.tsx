import React, { useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock, Loader2, ArrowLeft, Sparkles } from 'lucide-react'

interface AuthFormProps {
  mode: 'login' | 'signup' | 'reset'
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
  error?: string
  success?: string
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading, error, success }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [currentMode, setCurrentMode] = useState(mode)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ ...formData, mode: currentMode })
  }

  const getTitle = () => {
    switch (currentMode) {
      case 'signup': return 'Join BypassAC Hub'
      case 'reset': return 'Reset Password'
      default: return 'Welcome Back'
    }
  }

  const getSubtitle = () => {
    switch (currentMode) {
      case 'signup': return 'Create your account'
      case 'reset': return 'Enter your email to reset password'
      default: return 'Sign in to your account'
    }
  }

  const getButtonText = () => {
    if (loading) return <Loader2 className="h-5 w-5 animate-loading-spin mx-auto" />
    switch (currentMode) {
      case 'signup': return 'Sign Up'
      case 'reset': return 'Send Reset Email'
      default: return 'Sign In'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 light:from-blue-50 light:via-indigo-50 light:to-purple-50 flex items-center justify-center p-4 transition-all duration-500 animate-gradient-shift">
      <div className="w-full max-w-md">
        <div className="glass backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-scale-in">
          <div className="text-center mb-8">
            {currentMode === 'reset' && (
              <button
                onClick={() => setCurrentMode('login')}
                className="flex items-center text-gray-300 dark:text-gray-300 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-800 mb-4 transition-all duration-300 animate-slide-in"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </button>
            )}
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-purple-400 mr-2" />
              <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-800 animate-fade-in">
                {getTitle()}
              </h1>
            </div>
            <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 animate-fade-in-delay">
              {getSubtitle()}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg animate-shake error-shake">
              <p className="text-red-300 dark:text-red-300 light:text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg animate-bounce-in success-bounce">
              <p className="text-green-300 dark:text-green-300 light:text-green-600 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentMode === 'signup' && (
              <div className="animate-slide-in stagger-1">
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover-glow"
                    placeholder="Enter your username"
                    required
                    minLength={3}
                    maxLength={20}
                  />
                </div>
              </div>
            )}

            <div className="animate-slide-in stagger-2">
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover-glow"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {currentMode !== 'reset' && (
              <div className="animate-slide-in stagger-3">
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover-glow"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-600 transition-all duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 button-magic text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 animate-slide-in stagger-4 hover-glow"
            >
              {getButtonText()}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {currentMode === 'login' && (
              <button
                onClick={() => setCurrentMode('reset')}
                className="text-purple-400 hover:text-purple-300 dark:text-purple-400 dark:hover:text-purple-300 light:text-purple-600 light:hover:text-purple-700 font-medium transition-all duration-300 animate-fade-in stagger-5"
              >
                Forgot your password?
              </button>
            )}
            
            {currentMode !== 'reset' && (
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 animate-fade-in stagger-6">
                {currentMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => setCurrentMode(currentMode === 'login' ? 'signup' : 'login')}
                  className="ml-1 text-purple-400 hover:text-purple-300 dark:text-purple-400 dark:hover:text-purple-300 light:text-purple-600 light:hover:text-purple-700 font-medium transition-all duration-300"
                >
                  {currentMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}