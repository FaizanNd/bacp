import React, { useState, useEffect } from 'react'
import { 
  Home, Upload, Settings, LogOut, User, Crown, Shield, 
  Eye, Download, Heart, MessageCircle, Star, Search,
  Plus, Edit, Trash2, Check, X, Users, Sparkles,
  AlertCircle, UserPlus
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { LoadingSpinner } from './LoadingSpinner'
import { 
  User as UserType, Script, Program, 
  getScripts, getPrograms, uploadScript, verifyScript, 
  createProgram, updateProgram, incrementScriptViews, 
  incrementProgramViews, incrementProgramDownloads,
  hasValidConfig
} from '../lib/supabase'

interface DashboardProps {
  user: UserType | null
  onLogout: () => void
  isGuestMode?: boolean
  showGuestPrompt?: boolean
  onGuestContinue?: () => void
  onGuestSignUp?: () => void
}

interface GuestPromptModalProps {
  onContinue: () => void
  onSignUp: () => void
}

const GuestPromptModal: React.FC<GuestPromptModalProps> = ({ onContinue, onSignUp }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="glass backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full animate-scale-in">
      <div className="text-center mb-6">
        <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Enjoying BypassAC Hub?</h2>
        <p className="text-gray-300">
          Sign up to upload your own scripts, comment, like content, and join our community!
        </p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onSignUp}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Sign Up Now
        </button>
        
        <button
          onClick={onContinue}
          className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
        >
          Continue as Guest
        </button>
      </div>
      
      <p className="text-gray-400 text-sm text-center mt-4">
        Guest mode lets you browse content but limits interaction features.
      </p>
    </div>
  </div>
)

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  isGuestMode = false,
  showGuestPrompt = false,
  onGuestContinue = () => {},
  onGuestSignUp = () => {}
}) => {
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('browse')
  const [scripts, setScripts] = useState<Script[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showProgramForm, setShowProgramForm] = useState(false)

  // Form states
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    script_content: ''
  })
  const [programData, setProgramData] = useState({
    title: '',
    description: '',
    version: '1.0.0',
    download_url: '',
    file_size: '',
    is_featured: false
  })

  const isOwner = user?.username === 'AV3'
  const isAdmin = user?.is_admin || false

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [scriptsResult, programsResult] = await Promise.all([
        getScripts(),
        getPrograms()
      ])

      if (scriptsResult.data) {
        setScripts(scriptsResult.data)
      }
      if (programsResult.data) {
        setPrograms(programsResult.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScriptUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isGuestMode) {
      alert('Please sign in to upload scripts')
      return
    }

    try {
      const { data, error } = await uploadScript({
        ...uploadData,
        user_id: user.user_id
      })

      if (error) throw error

      setUploadData({ title: '', description: '', script_content: '' })
      setShowUploadForm(false)
      loadData()
      alert('Script uploaded successfully!')
    } catch (error: any) {
      alert('Error uploading script: ' + error.message)
    }
  }

  const handleProgramCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) {
      alert('Only the owner can create programs')
      return
    }

    try {
      const { data, error } = await createProgram({
        ...programData,
        created_by: user!.user_id
      })

      if (error) throw error

      setProgramData({
        title: '',
        description: '',
        version: '1.0.0',
        download_url: '',
        file_size: '',
        is_featured: false
      })
      setShowProgramForm(false)
      loadData()
      alert('Program created successfully!')
    } catch (error: any) {
      alert('Error creating program: ' + error.message)
    }
  }

  const handleVerifyScript = async (scriptId: string, isVerified: boolean) => {
    if (!isAdmin) return

    try {
      const { error } = await verifyScript(scriptId, isVerified)
      if (error) throw error
      loadData()
    } catch (error: any) {
      alert('Error verifying script: ' + error.message)
    }
  }

  const handleViewScript = async (script: Script) => {
    setSelectedScript(script)
    if (!isGuestMode) {
      await incrementScriptViews(script.id)
    }
  }

  const handleViewProgram = async (program: Program) => {
    setSelectedProgram(program)
    if (!isGuestMode) {
      await incrementProgramViews(program.id)
    }
  }

  const handleDownloadProgram = async (program: Program) => {
    if (!isGuestMode) {
      await incrementProgramDownloads(program.id)
    }
    if (program.download_url && program.download_url !== '#') {
      window.open(program.download_url, '_blank')
    } else {
      alert('Download link not available')
    }
  }

  const filteredScripts = scripts.filter(script =>
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderHeader = () => (
    <header className="glass backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h1 className="text-xl font-bold text-white">BypassAC Hub</h1>
            {isGuestMode && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
                Guest Mode
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isGuestMode && user && (
              <div className="flex items-center space-x-2">
                {isOwner && <Crown className="h-5 w-5 text-yellow-400" />}
                {isAdmin && !isOwner && <Shield className="h-5 w-5 text-blue-400" />}
                <span className="text-white font-medium">{user.username}</span>
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {!isGuestMode && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )

  const renderNavigation = () => (
    <nav className="glass backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {[
            { id: 'browse', label: 'Browse', icon: Home },
            ...((!isGuestMode && user) ? [{ id: 'upload', label: 'Upload Script', icon: Upload }] : []),
            ...(isOwner ? [{ id: 'owner-posts', label: 'Owner Posts', icon: Crown }] : []),
            ...(isOwner ? [{ id: 'users', label: 'User Management', icon: Users }] : []),
            ...((!isGuestMode && user) ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-all duration-300 ${
                activeTab === id
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )

  const renderBrowseTab = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search scripts and programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Programs Section */}
      {filteredPrograms.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Crown className="h-6 w-6 text-yellow-400 mr-2" />
            Owner Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="glass rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{program.title}</h3>
                  {program.is_featured && <Star className="h-5 w-5 text-yellow-400" />}
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{program.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>v{program.version}</span>
                  <span>{program.file_size}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {program.view_count}
                    </span>
                    <span className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {program.download_count}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProgram(program)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDownloadProgram(program)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scripts Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Community Scripts</h2>
        {loading ? (
          <LoadingSpinner message="Loading scripts..." fullScreen={false} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScripts.map((script) => (
              <div key={script.id} className="glass rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{script.title}</h3>
                  {script.is_verified && <Check className="h-5 w-5 text-green-400" />}
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{script.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>by {script.user?.username || 'Unknown'}</span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {script.view_count}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewScript(script)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
                  >
                    View Script
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleVerifyScript(script.id, !script.is_verified)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        script.is_verified
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {script.is_verified ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderUploadTab = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Upload Script</h2>
      
      {isGuestMode ? (
        <div className="glass rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
          <p className="text-gray-300 mb-4">
            You need to sign in to upload scripts to the community.
          </p>
          <button
            onClick={onGuestSignUp}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
          >
            Sign Up Now
          </button>
        </div>
      ) : (
        <form onSubmit={handleScriptUpload} className="glass rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter script title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your script"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Script Content</label>
            <textarea
              value={uploadData.script_content}
              onChange={(e) => setUploadData({ ...uploadData, script_content: e.target.value })}
              className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              placeholder="Paste your script code here"
              rows={10}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
          >
            Upload Script
          </button>
        </form>
      )}
    </div>
  )

  const renderOwnerPostsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Crown className="h-6 w-6 text-yellow-400 mr-2" />
          Owner Posts Management
        </h2>
        <button
          onClick={() => setShowProgramForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Program</span>
        </button>
      </div>

      {showProgramForm && (
        <form onSubmit={handleProgramCreate} className="glass rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={programData.title}
                onChange={(e) => setProgramData({ ...programData, title: e.target.value })}
                className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Program title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
              <input
                type="text"
                value={programData.version}
                onChange={(e) => setProgramData({ ...programData, version: e.target.value })}
                className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1.0.0"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={programData.description}
              onChange={(e) => setProgramData({ ...programData, description: e.target.value })}
              className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Program description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Download URL</label>
              <input
                type="url"
                value={programData.download_url}
                onChange={(e) => setProgramData({ ...programData, download_url: e.target.value })}
                className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/download"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">File Size</label>
              <input
                type="text"
                value={programData.file_size}
                onChange={(e) => setProgramData({ ...programData, file_size: e.target.value })}
                className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="2.5 MB"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={programData.is_featured}
              onChange={(e) => setProgramData({ ...programData, is_featured: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="featured" className="text-sm text-gray-300">Featured Program</label>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
            >
              Create Program
            </button>
            <button
              type="button"
              onClick={() => setShowProgramForm(false)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <div key={program.id} className="glass rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{program.title}</h3>
              {program.is_featured && <Star className="h-5 w-5 text-yellow-400" />}
            </div>
            
            <p className="text-gray-300 text-sm mb-4">{program.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span>v{program.version}</span>
              <span>{program.file_size}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {program.view_count}
              </span>
              <span className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                {program.download_count}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300">
                <Edit className="h-4 w-4" />
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <div className="glass rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Theme</span>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
            >
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
        
        {!hasValidConfig && (
          <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <h4 className="text-yellow-300 font-semibold mb-2">Configuration Notice</h4>
            <p className="text-yellow-200 text-sm">
              Running in guest mode. Some features may be limited. Contact the administrator to set up full functionality.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // Script/Program Detail Modals
  const renderScriptModal = () => {
    if (!selectedScript) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="glass backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedScript.title}</h2>
              <p className="text-gray-300">by {selectedScript.user?.username || 'Unknown'}</p>
            </div>
            <button
              onClick={() => setSelectedScript(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          
          {selectedScript.description && (
            <p className="text-gray-300 mb-6">{selectedScript.description}</p>
          )}
          
          <div className="bg-black/20 rounded-lg p-4 mb-6">
            <pre className="text-green-400 font-mono text-sm overflow-x-auto">
              {selectedScript.script_content || 'No script content available'}
            </pre>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {selectedScript.view_count} views
              </span>
              {selectedScript.is_verified && (
                <span className="flex items-center text-green-400">
                  <Check className="h-4 w-4 mr-1" />
                  Verified
                </span>
              )}
            </div>
            <span>{new Date(selectedScript.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderProgramModal = () => {
    if (!selectedProgram) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="glass backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 max-w-2xl w-full">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                {selectedProgram.title}
                {selectedProgram.is_featured && <Star className="h-6 w-6 text-yellow-400 ml-2" />}
              </h2>
              <p className="text-gray-300">v{selectedProgram.version}</p>
            </div>
            <button
              onClick={() => setSelectedProgram(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          
          {selectedProgram.description && (
            <p className="text-gray-300 mb-6">{selectedProgram.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{selectedProgram.view_count}</div>
              <div className="text-sm text-gray-400">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{selectedProgram.download_count}</div>
              <div className="text-sm text-gray-400">Downloads</div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => handleDownloadProgram(selectedProgram)}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
            >
              <Download className="h-5 w-5 mr-2" />
              Download ({selectedProgram.file_size})
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 light:from-blue-50 light:via-indigo-50 light:to-purple-50">
      {renderHeader()}
      {renderNavigation()}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && renderBrowseTab()}
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'owner-posts' && isOwner && renderOwnerPostsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </main>

      {renderScriptModal()}
      {renderProgramModal()}
      
      {showGuestPrompt && (
        <GuestPromptModal
          onContinue={onGuestContinue}
          onSignUp={onGuestSignUp}
        />
      )}
    </div>
  )
}