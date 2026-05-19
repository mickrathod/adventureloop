import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminPassword } from './siteConfig'
import { site } from './siteConfig'
import { Globe, Eye, EyeOff } from 'lucide-react'

const ADMIN_EMAIL = 'manavrathod6466@gmail.com'
export const SESSION_KEY = 'al_admin_authed'

export function isAuthed() {
  return localStorage.getItem(SESSION_KEY) === '1'
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 300))
    if (
      email.trim().toLowerCase() === ADMIN_EMAIL &&
      password === getAdminPassword()
    ) {
      localStorage.setItem(SESSION_KEY, '1')
      navigate('/admin/bookings', { replace: true })
    } else {
      setError('Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-coral-500 rounded-2xl flex items-center justify-center shadow-lg shadow-coral-500/30">
            <Globe size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none">{site.name}</p>
            <p className="text-slate-500 text-xs font-semibold">Admin Panel</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <h1 className="text-white font-black text-xl mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-6">Enter your credentials to continue</p>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                placeholder="admin@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-coral-500 text-sm placeholder-slate-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-coral-500 text-sm placeholder-slate-600 transition pr-11"
                />
                <button
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-coral-500 hover:bg-coral-600 text-white font-black rounded-xl py-3 transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 text-slate-600 text-sm hover:text-slate-400 transition"
        >
          ← Back to site
        </button>
      </div>
    </div>
  )
}
