import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import {
  Users, Bell, CheckCircle, Clock, RefreshCw,
  Phone, Mail, MessageSquare, Calendar, Filter,
  ChevronDown, ArrowLeft, Inbox, TrendingUp
} from 'lucide-react'


const STATUS_OPTIONS = ['new', 'contacted', 'confirmed', 'cancelled']
const STATUS_COLORS = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default function AdminBookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchBookings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchBookings() }, [])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    setUpdatingId(null)
  }

  const filtered = bookings.filter(b => {
    const typeMatch = filter === 'all' || b.type === filter
    const statusMatch = statusFilter === 'all' || b.status === statusFilter
    return typeMatch && statusMatch
  })

  const stats = {
    total:    bookings.length,
    newCount: bookings.filter(b => b.status === 'new').length,
    bookings: bookings.filter(b => b.type === 'booking').length,
    notifies: bookings.filter(b => b.type === 'notify_me').length,
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Bookings Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">All submissions from the website</p>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Inbox}      label="Total"     value={stats.total}    color="bg-slate-700" />
          <StatCard icon={TrendingUp} label="New"       value={stats.newCount} color="bg-blue-500"  />
          <StatCard icon={Users}      label="Bookings"  value={stats.bookings} color="bg-violet-500"/>
          <StatCard icon={Bell}       label="Notify Me" value={stats.notifies} color="bg-amber-500" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { key: 'all',       label: 'All' },
            { key: 'booking',   label: 'Bookings' },
            { key: 'notify_me', label: 'Notify Me' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                filter === f.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 bg-white outline-none"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No entries found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">

                  {/* Left: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        b.type === 'booking' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {b.type === 'booking' ? 'Booking' : 'Notify Me'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(b.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    {b.name && (
                      <p className="font-black text-slate-900 text-lg">{b.name}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="flex items-center gap-1 hover:text-slate-900">
                          <Phone size={13} /> {b.phone}
                        </a>
                      )}
                      {b.email && (
                        <a href={`mailto:${b.email}`} className="flex items-center gap-1 hover:text-slate-900">
                          <Mail size={13} /> {b.email}
                        </a>
                      )}
                      {b.trip && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {b.trip}
                        </span>
                      )}
                      {b.travelers && (
                        <span className="flex items-center gap-1">
                          <Users size={13} /> {b.travelers} traveler{b.travelers > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {b.message && (
                      <p className="mt-2 text-sm text-slate-500 flex items-start gap-1">
                        <MessageSquare size={13} className="mt-0.5 shrink-0" />
                        {b.message}
                      </p>
                    )}
                  </div>

                  {/* Right: status */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                    <select
                      value={b.status}
                      disabled={updatingId === b.id}
                      onChange={e => updateStatus(b.id, e.target.value)}
                      className="border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-700 bg-white outline-none"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
