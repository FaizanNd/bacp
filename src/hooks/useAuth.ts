import { useState, useEffect } from 'react'
import { supabase, User, hasValidConfig } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    // Check if we have valid Supabase configuration
    if (!hasValidConfig || !supabase) {
      console.log('Running in guest mode - no Supabase configuration')
      setIsGuestMode(true)
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    if (!hasValidConfig || !supabase) {
      setLoading(false)
      return
    }

    try {
      console.log('Fetching user profile for:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('Profile fetch result:', { data, error })

      if (error) {
        console.error('Error fetching user profile:', error)
        // Don't try to create the user here - the database trigger should handle it
        // Just wait and retry a few times
        if (error.code === 'PGRST116') {
          console.log('User not found, retrying in 2 seconds...')
          setTimeout(() => fetchUserProfile(userId), 2000)
          return
        }
        setLoading(false)
      } else {
        console.log('User profile found:', data)
        setUser(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      setLoading(false)
    }
  }

  return { user, session, loading, isGuestMode }
}