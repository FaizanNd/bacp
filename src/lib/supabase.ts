// Supabase configuration with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if we have valid configuration
export const hasValidConfig = !!(supabaseUrl && supabaseAnonKey)

// Create client only if we have valid configuration
export const supabase = hasValidConfig 
  ? (() => {
      try {
        const { createClient } = require('@supabase/supabase-js')
        return createClient(supabaseUrl, supabaseAnonKey)
      } catch (error) {
        console.error('Failed to create Supabase client:', error)
        return null
      }
    })()
  : null

// Mock data for guest mode
const mockScripts = [
  {
    id: 'mock-1',
    title: 'Sample Script 1',
    description: 'This is a sample script for demonstration purposes.',
    user: { username: 'DemoUser', profile_picture_url: null },
    is_verified: true,
    view_count: 150,
    created_at: '2024-01-15T10:00:00Z',
    script_content: '-- Sample script content\nprint("Hello World!")'
  },
  {
    id: 'mock-2',
    title: 'Advanced Bypass Script',
    description: 'An advanced script for bypassing various protections.',
    user: { username: 'ProCoder', profile_picture_url: null },
    is_verified: true,
    view_count: 89,
    created_at: '2024-01-14T15:30:00Z',
    script_content: '-- Advanced bypass script\nlocal bypass = {}\nreturn bypass'
  },
  {
    id: 'mock-3',
    title: 'GUI Enhancement',
    description: 'Enhances the user interface with modern elements.',
    user: { username: 'UIDesigner', profile_picture_url: null },
    is_verified: false,
    view_count: 45,
    created_at: '2024-01-13T09:15:00Z',
    script_content: '-- GUI Enhancement script\nlocal gui = game:GetService("CoreGui")'
  }
]

const mockPrograms = [
  {
    id: 'prog-1',
    title: 'BypassAC Pro',
    description: 'Professional anti-cheat bypass tool with advanced features.',
    version: '2.1.0',
    download_url: '#',
    file_size: '2.5 MB',
    download_count: 1250,
    view_count: 3400,
    is_featured: true,
    created_at: '2024-01-10T12:00:00Z',
    creator: { username: 'AV3', profile_picture_url: null }
  },
  {
    id: 'prog-2',
    title: 'Script Injector',
    description: 'Easy-to-use script injection tool for various games.',
    version: '1.8.3',
    download_url: '#',
    file_size: '1.2 MB',
    download_count: 890,
    view_count: 2100,
    is_featured: false,
    created_at: '2024-01-08T16:45:00Z',
    creator: { username: 'AV3', profile_picture_url: null }
  }
]

// Database Types
export interface User {
  user_id: string
  username: string
  email: string
  profile_picture_url?: string
  is_admin: boolean
  created_at: string
}

export interface Script {
  id: string
  user_id?: string
  title: string
  description?: string
  script_content?: string
  file_url?: string
  is_verified: boolean
  view_count: number
  created_at: string
  thumbnail_url?: string
  user?: { username: string; profile_picture_url?: string }
}

export interface Program {
  id: string
  title: string
  description?: string
  version: string
  download_url?: string
  file_size?: string
  thumbnail_url?: string
  download_count: number
  view_count: number
  is_featured: boolean
  created_by?: string
  created_at: string
  updated_at?: string
  creator?: { username: string; profile_picture_url?: string }
}

export interface Comment {
  id: string
  content: string
  user_id: string
  script_id?: string
  program_id?: string
  parent_id?: string
  created_at: string
  updated_at: string
  user?: User
}

export interface Like {
  id: string
  user_id: string
  script_id?: string
  program_id?: string
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark'
  email_notifications: boolean
  comment_notifications: boolean
  like_notifications: boolean
  created_at: string
  updated_at: string
}

// Guest mode functions (return mock data)
const guestModeResponse = <T>(data: T) => ({ data, error: null })
const guestModeError = (message: string) => ({ data: null, error: { message } })

// Auth functions
export const signUp = async (email: string, password: string, username: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Authentication is not available in guest mode. Please contact the administrator.')
  }

  try {
    // Check if username is already taken before attempting signup
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    
    if (existingUsername) {
      return guestModeError('Username already taken. Please choose a different username.')
    }

    // Check if email is already registered
    const { data: existingEmail } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle()
    
    if (existingEmail) {
      return guestModeError('Email already registered. Please use a different email or try signing in.')
    }

    // Special check for AV3 owner email
    if (username === 'AV3' && email !== 'sircats42@gmail.com') {
      return guestModeError('The username AV3 is reserved for the owner and must use the email sircats42@gmail.com')
    }

    // Sign up the user with Supabase Auth and pass username in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    })

    if (authError) {
      return { data: null, error: authError }
    }

    return { data: authData, error: null }
  } catch (error: any) {
    return guestModeError(error.message || 'An unexpected error occurred during signup.')
  }
}

export const signIn = async (email: string, password: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Authentication is not available in guest mode.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  if (!hasValidConfig || !supabase) {
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Password reset is not available in guest mode.')
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { data, error }
}

// Script functions
export const getScripts = async () => {
  if (!hasValidConfig || !supabase) {
    return guestModeResponse(mockScripts)
  }

  try {
    const { data, error } = await supabase
      .from('scripts')
      .select(`
        *,
        user:users!scripts_user_id_fkey(username, profile_picture_url)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  } catch (error) {
    console.error('Error fetching scripts:', error)
    return guestModeResponse(mockScripts)
  }
}

export const getScript = async (scriptId: string) => {
  if (!hasValidConfig || !supabase) {
    const script = mockScripts.find(s => s.id === scriptId)
    return script ? guestModeResponse(script) : guestModeError('Script not found')
  }

  try {
    const { data, error } = await supabase
      .from('scripts')
      .select(`
        *,
        user:users!scripts_user_id_fkey(username, profile_picture_url)
      `)
      .eq('id', scriptId)
      .single()
    return { data, error }
  } catch (error) {
    const script = mockScripts.find(s => s.id === scriptId)
    return script ? guestModeResponse(script) : guestModeError('Script not found')
  }
}

export const uploadScript = async (scriptData: Partial<Script>) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Script upload requires authentication. Please sign up or sign in.')
  }

  const { data, error } = await supabase
    .from('scripts')
    .insert([{ ...scriptData, is_verified: false, view_count: 0 }])
    .select(`
      *,
      user:users!scripts_user_id_fkey(username, profile_picture_url)
    `)
  return { data, error }
}

export const updateScript = async (scriptId: string, updates: Partial<Script>) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Script updates require authentication.')
  }

  const { data, error } = await supabase
    .from('scripts')
    .update(updates)
    .eq('id', scriptId)
    .select(`
      *,
      user:users!scripts_user_id_fkey(username, profile_picture_url)
    `)
  return { data, error }
}

export const verifyScript = async (scriptId: string, isVerified: boolean) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Script verification requires admin privileges.')
  }

  const { data, error } = await supabase
    .from('scripts')
    .update({ is_verified: isVerified })
    .eq('id', scriptId)
    .select(`
      *,
      user:users!scripts_user_id_fkey(username, profile_picture_url)
    `)
  return { data, error }
}

export const incrementScriptViews = async (scriptId: string) => {
  if (!hasValidConfig || !supabase) {
    return { data: null, error: null } // Silent fail in guest mode
  }

  try {
    const { data, error } = await supabase.rpc('increment_script_views', {
      script_id: scriptId
    })
    return { data, error }
  } catch (error) {
    return { data: null, error: null } // Silent fail
  }
}

// Program functions
export const getPrograms = async () => {
  if (!hasValidConfig || !supabase) {
    return guestModeResponse(mockPrograms)
  }

  try {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        creator:users!programs_created_by_fkey(username, profile_picture_url)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  } catch (error) {
    console.error('Error fetching programs:', error)
    return guestModeResponse(mockPrograms)
  }
}

export const createProgram = async (programData: Partial<Program>) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Program creation requires owner privileges.')
  }

  const { data, error } = await supabase
    .from('programs')
    .insert([{ ...programData, download_count: 0, view_count: 0 }])
    .select(`
      *,
      creator:users!programs_created_by_fkey(username, profile_picture_url)
    `)
  return { data, error }
}

export const updateProgram = async (programId: string, updates: Partial<Program>) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Program updates require owner privileges.')
  }

  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', programId)
    .select(`
      *,
      creator:users!programs_created_by_fkey(username, profile_picture_url)
    `)
  return { data, error }
}

export const incrementProgramViews = async (programId: string) => {
  if (!hasValidConfig || !supabase) {
    return { data: null, error: null } // Silent fail in guest mode
  }

  try {
    const { data, error } = await supabase.rpc('increment_program_views', {
      program_id: programId
    })
    return { data, error }
  } catch (error) {
    return { data: null, error: null } // Silent fail
  }
}

export const incrementProgramDownloads = async (programId: string) => {
  if (!hasValidConfig || !supabase) {
    return { data: null, error: null } // Silent fail in guest mode
  }

  try {
    const { data, error } = await supabase.rpc('increment_program_downloads', {
      program_id: programId
    })
    return { data, error }
  } catch (error) {
    return { data: null, error: null } // Silent fail
  }
}

// Comment functions (guest mode returns empty arrays)
export const getComments = async (scriptId?: string, programId?: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeResponse([])
  }

  try {
    let query = supabase
      .from('comments')
      .select(`
        *,
        user:users!comments_user_id_fkey(username, profile_picture_url)
      `)
      .order('created_at', { ascending: true })

    if (scriptId) {
      query = query.eq('script_id', scriptId)
    } else if (programId) {
      query = query.eq('program_id', programId)
    }

    const { data, error } = await query
    return { data, error }
  } catch (error) {
    return guestModeResponse([])
  }
}

export const createComment = async (commentData: Partial<Comment>) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Comments require authentication. Please sign up or sign in.')
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([commentData])
    .select(`
      *,
      user:users!comments_user_id_fkey(username, profile_picture_url)
    `)
  return { data, error }
}

export const updateComment = async (commentId: string, content: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Comment editing requires authentication.')
  }

  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select(`
      *,
      user:users!comments_user_id_fkey(username, profile_picture_url)
    `)
  return { data, error }
}

export const deleteComment = async (commentId: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Comment deletion requires authentication.')
  }

  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
  return { data, error }
}

// Like functions (guest mode returns no likes)
export const toggleLike = async (userId: string, scriptId?: string, programId?: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Likes require authentication. Please sign up or sign in.')
  }

  try {
    let query = supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)

    if (scriptId) {
      query = query.eq('script_id', scriptId)
    } else if (programId) {
      query = query.eq('program_id', programId)
    }

    const { data: existingLike } = await query.maybeSingle()

    if (existingLike) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)
      return { data: { liked: false }, error }
    } else {
      const { data, error } = await supabase
        .from('likes')
        .insert([{ user_id: userId, script_id: scriptId, program_id: programId }])
        .select()
      return { data: { liked: true }, error }
    }
  } catch (error) {
    return guestModeError('Error toggling like.')
  }
}

export const getLikeCount = async (scriptId?: string, programId?: string) => {
  if (!hasValidConfig || !supabase) {
    return { count: 0, error: null }
  }

  try {
    let query = supabase
      .from('likes')
      .select('id', { count: 'exact' })

    if (scriptId) {
      query = query.eq('script_id', scriptId)
    } else if (programId) {
      query = query.eq('program_id', programId)
    }

    const { count, error } = await query
    return { count, error }
  } catch (error) {
    return { count: 0, error: null }
  }
}

export const getUserLike = async (userId: string, scriptId?: string, programId?: string) => {
  if (!hasValidConfig || !supabase) {
    return { data: false, error: null }
  }

  try {
    let query = supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)

    if (scriptId) {
      query = query.eq('script_id', scriptId)
    } else if (programId) {
      query = query.eq('program_id', programId)
    }

    const { data, error } = await query.maybeSingle()
    return { data: !!data, error }
  } catch (error) {
    return { data: false, error: null }
  }
}

// User functions
export const getProfile = async (userId: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Profile access requires authentication.')
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<User>) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Profile updates require authentication.')
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select()
  return { data, error }
}

// User settings functions
export const getUserSettings = async (userId: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeResponse({ theme: 'dark' })
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Settings updates require authentication.')
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ 
      user_id: userId, 
      ...settings,
      updated_at: new Date().toISOString()
    })
    .select()
  return { data, error }
}

// File upload functions
export const uploadFile = async (file: File, bucket: string, path: string) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('File uploads require authentication.')
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true
    })
  return { data, error }
}

export const getFileUrl = (bucket: string, path: string) => {
  if (!hasValidConfig || !supabase) {
    return { data: { publicUrl: '' } }
  }

  return supabase.storage
    .from(bucket)
    .getPublicUrl(path)
}

export const uploadProfilePicture = async (userId: string, file: File) => {
  if (!hasValidConfig || !supabase) {
    return guestModeError('Profile picture uploads require authentication.')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`
  
  const { data, error } = await uploadFile(file, 'avatars', fileName)
  
  if (error) return { data: null, error }
  
  const { data: urlData } = getFileUrl('avatars', fileName)
  
  const { data: userData, error: updateError } = await updateProfile(userId, {
    profile_picture_url: urlData.publicUrl
  })
  
  return { data: userData, error: updateError }
}