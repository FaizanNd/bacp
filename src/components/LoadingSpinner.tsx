import React from 'react'
import { Loader2 } from 'lucide-react'

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
        <p className="text-white text-lg">Loading BypassAC Hub...</p>
      </div>
    </div>
  )
}