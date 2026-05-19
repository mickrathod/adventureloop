import { useState } from 'react'
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import { site } from './siteConfig'
import { SESSION_KEY } from './AdminLogin'
import {
  Users, Map, Settings, Calculator,
  MessageSquare, LogOut, Menu, X, Globe, ChevronRight
} from 'lucide-react'

const NAV = [
  { path: '/admin/bookings',   label: 'Bookings',    icon: Users         },
  { path: '/admin/trips',      label: 'Trips',       icon: Map           },
  { path: '/admin/config',     label: 'Site Config', icon: Settings      },
  { path: '/admin/calculator', label: 'Calculator',  icon: Calculator    },
  { path: '/admin/templates',  label: 'Templates',   icon: MessageSquare },
]

function Sidebar({ onLogout, collapsed, setCollapsed }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <aside className={`h-screen sticky top-0 bg-slate-900 flex flex-col transition-all duration-300 shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center shrink-0">
          <Globe size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-black text-sm truncate">{site.name}</p>
            <p className="text-slate-500 text-[10px] font-semibold">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-coral-500 text-white shadow-lg shadow-coral-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate flex-1 text-left">{label}</span>}
              {!collapsed && active && <ChevronRight size={14} className="shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-slate-800 p-2 space-y-1">
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand' : 'Collapse'}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white text-sm font-semibold transition"
        >
          {collapsed ? <Menu size={18} /> : <><X size={18} /><span>Collapse</span></>}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-semibold transition"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const authed = localStorage.getItem(SESSION_KEY) === '1'
  if (!authed) return <Navigate to="/admin/login" replace />

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[#fafaf8]">
      <Sidebar onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
