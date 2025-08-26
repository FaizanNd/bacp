import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading BypassAC Hub...", 
  fullScreen = true 
}) => {
  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-purple-500 mr-2" />
        <span className="text-gray-600 dark:text-gray-300">{message}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 light:from-blue-50 light:via-indigo-50 light:to-purple-50 flex items-center justify-center p-4 animate-gradient-shift">
      <div className="text-center glass backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-white/20 light:border-gray-200 animate-scale-in">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="h-8 w-8 text-purple-400 mr-3 animate-pulse" />
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">
            BypassAC Hub
          </h1>
        </div>
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mr-3" />
          <div className="text-left">
            <p className="text-white dark:text-white light:text-gray-800 text-lg font-medium">
              {message}
            </p>
            <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 text-sm mt-1">
              Please wait while we set things up...
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  )
}