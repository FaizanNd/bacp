import React, { useState, useEffect } from 'react'
import { User, Script, Program, Comment, supabase, signOut, getScripts, uploadScript, verifyScript, getProfile, getPrograms, createProgram, updateProgram, getComments, createComment, toggleLike, getLikeCount, getUserLike, incrementScriptViews, incrementProgramViews, incrementProgramDownloads, uploadProfilePicture, updateProfile } from '../lib/supabase'
import { Upload, FileText, Settings, Shield, LogOut, CheckCircle, XCircle, Clock, Star, Download, Eye, Heart, MessageCircle, Plus, Edit, Trash2, Moon, Sun, Sparkles, Zap, TrendingUp, Camera, Loader2, Crown, UserPlus, Link } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface DashboardProps {
  user: User
  onLogout: () => void
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'scripts' | 'programs' | 'settings' | 'admin' | 'users'>('browse')
  const [scripts, setScripts] = useState<Script[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Script | Program | null>(null)
  const [newComment, setNewComment] = useState('')
  const [editingScript, setEditingScript] = useState<Script | null>(null)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const { theme, toggleTheme } = useTheme()
  
  const [scriptForm, setScriptForm] = useState({
    title: '',
    description: '',
    script_content: '',
    file: null as File | null
  })

  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    version: '1.0.0',
    download_url: '',
    file: null as File | null,
    is_featured: false
  })

  // Check if current user is the owner (AV3)
  const isOwner = user.username === 'AV3'
  const isAdmin = user.is_admin

  useEffect(() => {
    loadData()
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const loadData = async () => {
    const [scriptsResult, programsResult] = await Promise.all([
      getScripts(),
      getPrograms()
    ])
    
    if (scriptsResult.data) setScripts(scriptsResult.data)
    if (programsResult.data) setPrograms(programsResult.data)
  }

  const loadUsers = async () => {
    if (!isAdmin) return
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
  }

  const handleScriptUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const scriptData = {
        title: scriptForm.title,
        description: scriptForm.description,
        script_content: scriptForm.script_content,
        user_id: user.user_id
      }
      
      const { data, error } = await uploadScript(scriptData)
      if (error) throw error
      
      setScriptForm({ title: '', description: '', script_content: '', file: null })
      await loadData()
      setActiveTab('scripts')
    } catch (error) {
      console.error('Error uploading script:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProgramUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const programData = {
        title: programForm.title,
        description: programForm.description,
        version: programForm.version,
        download_url: programForm.download_url,
        is_featured: programForm.is_featured,
        created_by: user.user_id
      }
      
      const { data, error } = await createProgram(programData)
      if (error) throw error
      
      setProgramForm({ title: '', description: '', version: '1.0.0', download_url: '', file: null, is_featured: false })
      await loadData()
    } catch (error) {
      console.error('Error uploading program:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyScript = async (scriptId: string, isVerified: boolean) => {
    await verifyScript(scriptId, isVerified)
    await loadData()
  }

  const handleDeleteScript = async (scriptId: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return
    
    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('id', scriptId)
    
    if (!error) {
      await loadData()
    }
  }

  const handlePromoteUser = async (userId: string, promote: boolean) => {
    if (!isOwner) return
    
    const action = promote ? 'promote to admin' : 'remove admin privileges from'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    
    const { error } = await supabase
      .from('users')
      .update({ is_admin: promote })
      .eq('user_id', userId)
    
    if (!error) {
      await loadUsers()
    }
  }

  const handleLogout = async () => {
    await signOut()
    onLogout()
  }

  const handleItemClick = async (item: Script | Program) => {
    setSelectedItem(item)
    
    // Increment view count
    if ('script_content' in item) {
      await incrementScriptViews(item.id)
    } else {
      await incrementProgramViews(item.id)
    }
    
    // Load comments
    const { data } = await getComments(
      'script_content' in item ? item.id : undefined,
      'version' in item ? item.id : undefined
    )
    if (data) setComments(data)
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedItem) return
    
    const commentData = {
      content: newComment,
      user_id: user.user_id,
      script_id: 'script_content' in selectedItem ? selectedItem.id : undefined,
      program_id: 'version' in selectedItem ? selectedItem.id : undefined
    }
    
    const { data, error } = await createComment(commentData)
    if (data) {
      setComments([...comments, data[0]])
      setNewComment('')
    }
  }

  const handleLike = async (item: Script | Program) => {
    await toggleLike(
      user.user_id,
      'script_content' in item ? item.id : undefined,
      'version' in item ? item.id : undefined
    )
    // Refresh the item to update like count
    await loadData()
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPicture(true)
    try {
      const { data, error } = await uploadProfilePicture(user.user_id, file)
      if (error) throw error
      
      // Refresh user data
      window.location.reload()
    } catch (error) {
      console.error('Error uploading profile picture:', error)
    } finally {
      setUploadingPicture(false)
    }
  }

  const handleDownload = async (program: Program) => {
    if (program.download_url) {
      // Increment download count
      await incrementProgramDownloads(program.id)
      // Open download link
      window.open(program.download_url, '_blank')
      // Refresh data to update download count
      await loadData()
    }
  }

  const getStatusIcon = (isVerified: boolean) => {
    return isVerified ? 
      <CheckCircle className="h-5 w-5 text-green-400" /> : 
      <Clock className="h-5 w-5 text-yellow-400" />
  }

  const getStatusText = (isVerified: boolean) => {
    return isVerified ? 'Verified' : 'Pending'
  }

  const getUserRoleDisplay = (user: User) => {
    if (user.username === 'AV3') {
      return (
        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-semibold rounded-full flex items-center">
          <Crown className="h-3 w-3 mr-1" />
          Owner
        </span>
      )
    } else if (user.is_admin) {
      return (
        <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full flex items-center">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 bg-gradient-to-r from-gray-500 to-slate-500 text-white text-xs font-semibold rounded-full">
          User
        </span>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 light:from-blue-50 light:via-indigo-50 light:to-purple-50 transition-all duration-500 animate-gradient-shift">
      {/* Header */}
      <header className="glass backdrop-blur-md border-b border-white/10 dark:border-white/10 light:border-gray-200 transition-all duration-300 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-8 w-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-800 animate-fade-in">BypassAC Hub</h1>
              </div>
              {isOwner && (
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-semibold rounded-full animate-pulse-glow">
                  <Crown className="h-4 w-4 inline mr-1" />
                  Owner
                </span>
              )}
              {isAdmin && !isOwner && (
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full animate-pulse-glow">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 glass hover-glow text-white dark:text-white light:text-gray-800 rounded-lg transition-all duration-300 transform hover:scale-110"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <span className="text-gray-300 dark:text-gray-300 light:text-gray-600 animate-fade-in">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 glass hover-glow text-white dark:text-white light:text-gray-800 rounded-lg transition-all duration-300 transform hover:scale-105 animate-slide-in"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-slide-in">
              <nav className="space-y-2">
                {[
                  { id: 'browse', icon: Eye, label: 'Browse', color: 'from-blue-500 to-cyan-500' },
                  { id: 'upload', icon: Upload, label: 'Upload Script', color: 'from-green-500 to-emerald-500' },
                  { id: 'scripts', icon: FileText, label: 'My Scripts', color: 'from-purple-500 to-pink-500' },
                  ...(isOwner ? [{ id: 'programs', icon: Download, label: 'Owner Posts', color: 'from-orange-500 to-red-500' }] : []),
                  { id: 'settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' },
                  ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin Panel', color: 'from-yellow-500 to-amber-500' }] : []),
                  ...(isOwner ? [{ id: 'users', icon: UserPlus, label: 'User Management', color: 'from-indigo-500 to-purple-500' }] : [])
                ].map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 animate-slide-in stagger-${index + 1} ${
                      activeTab === item.id 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                        : 'text-gray-300 dark:text-gray-300 light:text-gray-700 hover-glow'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <div className="space-y-6">
                {/* Programs Section */}
                {programs.length > 0 && (
                  <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-fade-in">
                    <div className="flex items-center space-x-2 mb-6">
                      <TrendingUp className="h-6 w-6 text-purple-400" />
                      <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">Owner Programs</h2>
                    </div>
                    <div className="grid gap-4">
                      {programs.map((program, index) => (
                        <div 
                          key={program.id} 
                          className={`glass rounded-lg p-4 border border-white/20 dark:border-white/20 light:border-gray-200 cursor-pointer transition-all duration-300 transform hover:scale-105 hover-lift animate-slide-in stagger-${index + 1}`}
                          onClick={() => handleItemClick(program)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800">{program.title}</h3>
                                {program.is_featured && <Star className="h-5 w-5 text-yellow-400" />}
                              </div>
                              <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mb-2">{program.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{program.view_count}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Download className="h-4 w-4" />
                                  <span>{program.download_count}</span>
                                </span>
                                <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">v{program.version}</span>
                              </div>
                            </div>
                            {program.download_url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownload(program)
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scripts Section */}
                <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-fade-in">
                  <div className="flex items-center space-x-2 mb-6">
                    <Zap className="h-6 w-6 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">Community Scripts</h2>
                  </div>
                  <div className="grid gap-4">
                    {scripts.filter(script => script.is_verified).map((script, index) => (
                      <div 
                        key={script.id} 
                        className={`glass rounded-lg p-4 border border-white/20 dark:border-white/20 light:border-gray-200 cursor-pointer transition-all duration-300 transform hover:scale-105 hover-lift animate-slide-in stagger-${index + 1}`}
                        onClick={() => handleItemClick(script)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800">{script.title}</h3>
                              {getStatusIcon(script.is_verified)}
                            </div>
                            <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mb-2">{script.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{script.view_count || 0}</span>
                              </span>
                              <span>by {(script as any).user?.username || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-fade-in">
                <div className="flex items-center space-x-2 mb-6">
                  <Upload className="h-6 w-6 text-green-400" />
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">Upload New Script</h2>
                </div>
                <form onSubmit={handleScriptUpload} className="space-y-4">
                  <div className="animate-slide-in stagger-1">
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                      Script Title
                    </label>
                    <input
                      type="text"
                      value={scriptForm.title}
                      onChange={(e) => setScriptForm({ ...scriptForm, title: e.target.value })}
                      className="w-full px-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover-glow"
                      placeholder="Enter script title"
                      required
                    />
                  </div>
                  <div className="animate-slide-in stagger-2">
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={scriptForm.description}
                      onChange={(e) => setScriptForm({ ...scriptForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover-glow"
                      placeholder="Describe your script"
                      required
                    />
                  </div>
                  <div className="animate-slide-in stagger-3">
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                      Script Content
                    </label>
                    <textarea
                      value={scriptForm.script_content}
                      onChange={(e) => setScriptForm({ ...scriptForm, script_content: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono transition-all duration-300 hover-glow"
                      placeholder="Paste your script code here"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 button-magic text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 animate-slide-in stagger-4 hover-glow"
                  >
                    {loading ? <span className="flex items-center justify-center"><Loader2 className="h-5 w-5 animate-loading-spin mr-2" />Uploading...</span> : 'Upload Script'}
                  </button>
                </form>
              </div>
            )}

            {/* My Scripts Tab */}
            {activeTab === 'scripts' && (
              <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-fade-in">
                <div className="flex items-center space-x-2 mb-6">
                  <FileText className="h-6 w-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">My Scripts</h2>
                </div>
                <div className="grid gap-4">
                  {scripts.filter(script => script.user_id === user.user_id).map((script, index) => (
                    <div key={script.id} className={`glass rounded-lg p-4 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 transform hover:scale-105 animate-slide-in stagger-${index + 1}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800">{script.title}</h3>
                          <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mt-1">{script.description}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            {getStatusIcon(script.is_verified)}
                            <span className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-600">
                              {getStatusText(script.is_verified)}
                            </span>
                            <span className="flex items-center space-x-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">
                              <Eye className="h-4 w-4" />
                              <span>{script.view_count || 0}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingScript(script)}
                            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 transform hover:scale-110"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Posts Tab (Owner Only) */}
            {activeTab === 'programs' && isOwner && (
              <div className="space-y-6 animate-fade-in">
                <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift">
                  <div className="flex items-center space-x-2 mb-6">
                    <Download className="h-6 w-6 text-orange-400" />
                    <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">Upload Program</h2>
                  </div>
                  <form onSubmit={handleProgramUpload} className="space-y-4">
                    <div className="animate-slide-in stagger-1">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                        Program Title
                      </label>
                      <input
                        type="text"
                        value={programForm.title}
                        onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                        className="w-full px-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover-glow"
                        placeholder="Enter program title"
                        required
                      />
                    </div>
                    <div className="animate-slide-in stagger-2">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={programForm.description}
                        onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover-glow"
                        placeholder="Describe your program"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="animate-slide-in stagger-3">
                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                          Version
                        </label>
                        <input
                          type="text"
                          value={programForm.version}
                          onChange={(e) => setProgramForm({ ...programForm, version: e.target.value })}
                          className="w-full px-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover-glow"
                          placeholder="1.0.0"
                        />
                      </div>
                      <div className="animate-slide-in stagger-3">
                        <label className="flex items-center space-x-2 mt-8">
                          <input
                            type="checkbox"
                            checked={programForm.is_featured}
                            onChange={(e) => setProgramForm({ ...programForm, is_featured: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all duration-300"
                          />
                          <span className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">Featured Program</span>
                          <Star className="h-4 w-4 text-yellow-400" />
                        </label>
                      </div>
                    </div>
                    <div className="animate-slide-in stagger-4">
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                        Download URL
                      </label>
                      <div className="relative">
                        <Link className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="url"
                          value={programForm.download_url}
                          onChange={(e) => setProgramForm({ ...programForm, download_url: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover-glow"
                          placeholder="https://example.com/download-link"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 button-magic text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 animate-slide-in stagger-5 hover-glow"
                    >
                      {loading ? <span className="flex items-center justify-center"><Loader2 className="h-5 w-5 animate-loading-spin mr-2" />Uploading...</span> : 'Upload Program'}
                    </button>
                  </form>
                </div>

                <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift">
                  <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">My Programs</h2>
                  </div>
                  <div className="grid gap-4">
                    {programs.map((program, index) => (
                      <div key={program.id} className={`glass rounded-lg p-4 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 transform hover:scale-105 animate-slide-in stagger-${index + 1}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800">{program.title}</h3>
                              {program.is_featured && <Star className="h-5 w-5 text-yellow-400" />}
                            </div>
                            <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mb-2">{program.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{program.view_count}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Download className="h-4 w-4" />
                                <span>{program.download_count}</span>
                              </span>
                              <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">v{program.version}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingProgram(program)}
                              className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-fade-in">
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="h-6 w-6 text-gray-400" />
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">Account Settings</h2>
                </div>
                <div className="space-y-6">
                  <div className="animate-slide-in stagger-1">
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800 mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                          Profile Picture
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                              {user.profile_picture_url ? (
                                <img 
                                  src={user.profile_picture_url} 
                                  alt="Profile" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-lg">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {uploadingPicture && (
                              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-white animate-loading-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePictureUpload}
                              disabled={uploadingPicture}
                              className="flex-1 px-4 py-3 glass rounded-lg text-white dark:text-white light:text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:button-magic file:text-white hover:file:from-purple-600 hover:file:to-pink-600 transition-all duration-300 hover-glow"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="animate-slide-in stagger-2">
                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={user.username}
                          disabled
                          className="w-full px-4 py-3 glass rounded-lg text-gray-400 dark:text-gray-400 light:text-gray-500"
                        />
                      </div>
                      <div className="animate-slide-in stagger-3">
                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 glass rounded-lg text-gray-400 dark:text-gray-400 light:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="animate-slide-in stagger-4">
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800 mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">Theme</span>
                        <button
                          onClick={toggleTheme}
                          className="flex items-center space-x-2 px-4 py-2 glass hover-glow text-white dark:text-white light:text-gray-800 rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                          <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">Email Notifications</span>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all duration-300" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">Comment Notifications</span>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all duration-300" />
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 px-4 button-magic text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 active:scale-95 animate-slide-in stagger-5 hover-glow">
                    Update Profile
                  </button>
                </div>
              </div>
            )}

            {/* Admin Panel */}
            {activeTab === 'admin' && isAdmin && (
              <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-fade-in">
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="h-6 w-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">Admin Panel</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800 mb-4">Pending Scripts</h3>
                    <div className="grid gap-4">
                      {scripts.filter(script => !script.is_verified).map((script, index) => (
                        <div key={script.id} className={`glass rounded-lg p-4 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 transform hover:scale-105 animate-slide-in stagger-${index + 1}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-white dark:text-white light:text-gray-800">{script.title}</h4>
                              <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mt-1">{script.description}</p>
                              <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-500 mt-2">
                                Submitted by: {(script as any).user?.username || 'Unknown'} • {new Date(script.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleVerifyScript(script.id, true)}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
                              >
                                <CheckCircle className="h-4 w-4 inline mr-1" />
                                Verify
                              </button>
                              <button
                                onClick={() => handleDeleteScript(script.id)}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4 inline mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {scripts.filter(script => !script.is_verified).length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          No pending scripts to review
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Management Tab (Owner Only) */}
            {activeTab === 'users' && isOwner && (
              <div className="glass backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 hover-lift animate-fade-in">
                <div className="flex items-center space-x-2 mb-6">
                  <UserPlus className="h-6 w-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">User Management</h2>
                </div>
                <div className="space-y-4">
                  {users.map((userItem, index) => (
                    <div key={userItem.user_id} className={`glass rounded-lg p-4 border border-white/20 dark:border-white/20 light:border-gray-200 transition-all duration-300 transform hover:scale-105 animate-slide-in stagger-${index + 1}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                            {userItem.profile_picture_url ? (
                              <img 
                                src={userItem.profile_picture_url} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {userItem.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800">{userItem.username}</h3>
                              {getUserRoleDisplay(userItem)}
                            </div>
                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-500 text-sm">{userItem.email}</p>
                            <p className="text-gray-500 dark:text-gray-500 light:text-gray-400 text-xs">
                              Joined: {new Date(userItem.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {userItem.username !== 'AV3' && (
                          <div className="flex space-x-2">
                            {userItem.is_admin ? (
                              <button
                                onClick={() => handlePromoteUser(userItem.user_id, false)}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
                              >
                                Remove Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePromoteUser(userItem.user_id, true)}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
                              >
                                <UserPlus className="h-4 w-4 inline mr-1" />
                                Make Admin
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass backdrop-blur-md rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-white/20 light:border-gray-200 animate-scale-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-800">{selectedItem.title}</h2>
                <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mt-2">{selectedItem.description}</p>
                {'download_url' in selectedItem && selectedItem.download_url && (
                  <button
                    onClick={() => handleDownload(selectedItem as Program)}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Program</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 glass hover-glow text-white dark:text-white light:text-gray-800 rounded-lg transition-all duration-300 transform hover:scale-110"
              >
                ✕
              </button>
            </div>

            {/* Script Content */}
            {'script_content' in selectedItem && selectedItem.script_content && (
              <div className="mb-6 animate-slide-in">
                <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800 mb-3">Script Code</h3>
                <pre className="glass p-4 rounded-lg overflow-x-auto text-sm text-gray-300 dark:text-gray-300 light:text-gray-800 font-mono hover-glow">
                  {selectedItem.script_content}
                </pre>
              </div>
            )}

            {/* Comments Section */}
            <div className="space-y-4 animate-slide-in">
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-800">Comments</h3>
              
              {/* Add Comment */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 glass rounded-lg text-white dark:text-white light:text-gray-800 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover-glow"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 button-magic text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover-glow"
                >
                  <MessageCircle className="h-4 w-4 inline mr-1" />
                  Post
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment, index) => (
                  <div key={comment.id} className={`glass rounded-lg p-3 border border-white/20 dark:border-white/20 light:border-gray-200 animate-slide-in stagger-${index + 1} hover-lift`}>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-white dark:text-white light:text-gray-800">
                            {comment.user?.username || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}