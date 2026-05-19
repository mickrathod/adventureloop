import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Save, RefreshCw, Check, Eye, EyeOff } from 'lucide-react'

const FIELDS = [
  { key: 'name',           label: 'Site Name',         type: 'text'     },
  { key: 'tagline',        label: 'Tagline',            type: 'text'     },
  { key: 'description',   label: 'SEO Description',    type: 'textarea' },
  { key: 'phone',          label: 'Phone (display)',    type: 'text',    hint: 'e.g. +91 88491 12126' },
  { key: 'phone_raw',      label: 'Phone (WhatsApp)',   type: 'text',    hint: 'Digits only, e.g. 918849112126' },
  { key: 'email',          label: 'Email',              type: 'email'    },
  { key: 'instagram',      label: 'Instagram URL',      type: 'url'      },
  { key: 'facebook',       label: 'Facebook URL',       type: 'url'      },
  { key: 'upi_id',         label: 'UPI ID',             type: 'text'     },
  { key: 'year',           label: 'Copyright Year',     type: 'text'     },
  { key: 'admin_password', label: 'Admin Password',     type: 'password' },
]

export default function AdminSiteConfig() {
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)
  const [showPasswords, setShowPasswords] = useState({})

  const fetchAll = async () => {
    setLoading(true)
    const { data } = await supabase.from('site_config').select('key, value')
    if (data) {
      const map = {}
      data.forEach(({ key, value }) => { map[key] = value })
      setForm(map)
    }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const saveField = async (key) => {
    setSaving(key)
    await supabase.from('site_config').upsert({ key, value: form[key] })
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Site Config</h1>
            <p className="text-slate-500 text-sm mt-1">Changes save instantly to Supabase — no deploy needed</p>
          </div>
          <button onClick={fetchAll} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition shadow-sm text-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading…</div>
        ) : (
          <div className="space-y-4">
            {FIELDS.map(({ key, label, type, hint }) => {
              const isPassword = type === 'password'
              const showPw = showPasswords[key]
              const isSaving = saving === key
              const isSaved  = saved === key

              return (
                <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{label}</label>
                  {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}

                  <div className="flex gap-2 items-start">
                    {type === 'textarea' ? (
                      <textarea
                        value={form[key] ?? ''}
                        onChange={e => set(key, e.target.value)}
                        rows={3}
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 resize-none"
                      />
                    ) : (
                      <div className="flex-1 relative">
                        <input
                          type={isPassword && !showPw ? 'password' : 'text'}
                          value={form[key] ?? ''}
                          onChange={e => set(key, e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveField(key)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 pr-10"
                        />
                        {isPassword && (
                          <button
                            onClick={() => setShowPasswords(p => ({ ...p, [key]: !showPw }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => saveField(key)}
                      disabled={isSaving}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition ${
                        isSaved
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-900 text-white hover:bg-slate-700'
                      } disabled:opacity-50`}
                    >
                      {isSaved ? <><Check size={14} /> Saved</> : isSaving ? <RefreshCw size={14} className="animate-spin" /> : <><Save size={14} /> Save</>}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-8">
          ⚠️ Changing <strong>Admin Password</strong> takes effect on next page load.
        </p>
      </div>
    </div>
  )
}
