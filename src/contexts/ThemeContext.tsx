import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserSettings, updateUserSettings } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  loading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        try {
          const { data } = await getUserSettings(user.user_id)
          if (data) {
            setTheme(data.theme)
          }
        } catch (error) {
          console.error('Error loading theme:', error)
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
        if (savedTheme) {
          setTheme(savedTheme)
        }
      }
      setLoading(false)
    }

    loadTheme()
  }, [user])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)

    if (user) {
      try {
        await updateUserSettings(user.user_id, { theme: newTheme })
      } catch (error) {
        console.error('Error saving theme:', error)
      }
    } else {
      localStorage.setItem('theme', newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}