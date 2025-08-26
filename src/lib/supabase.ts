import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  user_id: string
  title: string
  description?: string
  script_content?: string
  file_url?: string
  is_verified: boolean
  view_count: number
  created_at: string
  thumbnail_url?: string
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
  created_by: string
  created_at: string
  updated_at: string
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

// Auth functions
export const signUp = async (email: string, password: string, username: string) => {
  try {
    console.log('Starting signup process for:', { email, username })
    
    // Check if username is already taken before attempting signup
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    
    if (existingUsername) {
      return { 
        data: null, 
        error: { message: 'Username already taken. Please choose a different username.' } 
      }
    }

    // Check if email is already registered
    const { data: existingEmail } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle()
    
    if (existingEmail) {
      return { 
        data: null, 
        error: { message: 'Email already registered. Please use a different email or try signing in.' } 
      }
    }

    // Special check for AV3 owner email
    if (username === 'AV3' && email !== 'sircats42@gmail.com') {
      return {
        data: null,
        error: { message: 'The username AV3 is reserved for the owner and must use the email sircats42@gmail.com' }
      }
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

    console.log('Auth signup result:', { authData, authError })

    if (authError) {
      console.error('Auth signup error:', authError)
      return { data: null, error: authError }
    }

    return { data: authData, error: null }
  } catch (error: any) {
    console.error('Signup error:', error)
    return { 
      data: null, 
      error: { 
        message: error.message || 'An unexpected error occurred during signup. Please try again.' 
      } 
    }
  }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { data, error }
}

export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: password
  })
  return { data, error }
}

// Script functions
export const uploadScript = async (scriptData: Partial<Script>) => {
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

export const getScripts = async () => {
  const { data, error } = await supabase
    .from('scripts')
    .select(`
      *,
      user:users!scripts_user_id_fkey(username, profile_picture_url)
    `)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getScript = async (scriptId: string) => {
  const { data, error } = await supabase
    .from('scripts')
    .select(`
      *,
      user:users!scripts_user_id_fkey(username, profile_picture_url)
    `)
    .eq('id', scriptId)
    .single()
  return { data, error }
}

export const verifyScript = async (scriptId: string, isVerified: boolean) => {
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
  const { data, error } = await supabase.rpc('increment_script_views', {
    script_id: scriptId
  })
  return { data, error }
}

// Program functions
export const createProgram = async (programData: Partial<Program>) => {
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

export const getPrograms = async () => {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      creator:users!programs_created_by_fkey(username, profile_picture_url)
    `)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const incrementProgramViews = async (programId: string) => {
  const { data, error } = await supabase.rpc('increment_program_views', {
    program_id: programId
  })
  return { data, error }
}

export const incrementProgramDownloads = async (programId: string) => {
  const { data, error } = await supabase.rpc('increment_program_downloads', {
    program_id: programId
  })
  return { data, error }
}

// Comment functions
export const createComment = async (commentData: Partial<Comment>) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([commentData])
    .select(`
      *,
      user:users!comments_user_id_fkey(username, profile_picture_url)
    `)
  return { data, error }
}

export const getComments = async (scriptId?: string, programId?: string) => {
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
}

export const updateComment = async (commentId: string, content: string) => {
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
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
  return { data, error }
}

// Like functions
export const toggleLike = async (userId: string, scriptId?: string, programId?: string) => {
  // Check if like exists
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
    // Remove like
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)
    return { data: { liked: false }, error }
  } else {
    // Add like
    const { data, error } = await supabase
      .from('likes')
      .insert([{ user_id: userId, script_id: scriptId, program_id: programId }])
      .select()
    return { data: { liked: true }, error }
  }
}

export const getLikeCount = async (scriptId?: string, programId?: string) => {
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
}

export const getUserLike = async (userId: string, scriptId?: string, programId?: string) => {
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
}

// User functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select()
  return { data, error }
}

// User settings functions
export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
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
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true
    })
  return { data, error }
}

export const getFileUrl = (bucket: string, path: string) => {
  return supabase.storage
    .from(bucket)
    .getPublicUrl(path)
}

export const uploadProfilePicture = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`
  
  const { data, error } = await uploadFile(file, 'avatars', fileName)
  
  if (error) return { data: null, error }
  
  const { data: urlData } = getFileUrl('avatars', fileName)
  
  // Update user profile with new picture URL
  const { data: userData, error: updateError } = await updateProfile(userId, {
    profile_picture_url: urlData.publicUrl
  })
  
  return { data: userData, error: updateError }
}