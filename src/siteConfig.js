import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Fallback values used before Supabase loads
export const DEFAULTS = {
  name:           'AdventureLoop',
  tagline:        'Loop in. Adventure out.',
  description:    'Small-group trips from Gujarat. Goa · Diu · Dwarka · All inclusive · Scooty included · Solo travelers welcome.',
  phone:          '+91 88491 12126',
  phone_raw:      '918849112126',
  email:          'hello@adventureloop.in',
  instagram:      'https://instagram.com/adventureloop.in',
  facebook:       'https://facebook.com/adventureloop',
  upi_id:         'adventureloop@upi',
  year:           '2026',
  admin_password: 'adventureloop2025',
}

// Shared promise so we only fetch once
let _configPromise = null
let _config = { ...DEFAULTS }

function fetchConfig() {
  if (!_configPromise) {
    _configPromise = supabase
      .from('site_config')
      .select('key, value')
      .then(({ data }) => {
        if (data?.length) {
          data.forEach(({ key, value }) => { _config[key] = value })
        }
      })
  }
  return _configPromise
}

// Start fetching immediately on module load
fetchConfig()

// ── React hook ───────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'

export function useSiteConfig() {
  const [config, setConfig] = useState(_config)
  const [loading, setLoading] = useState(!_configPromise)

  useEffect(() => {
    fetchConfig().then(() => {
      setConfig({ ..._config })
      setLoading(false)
    })
  }, [])

  return { config, loading }
}

// ── Synchronous getters (use after app has loaded) ───────────────────────────
export const getSite   = () => _config
export const waLink    = (msg = '') =>
  `https://wa.me/${_config.phone_raw}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`

// Static export for files that reference site.* at module level (AdminCalculator etc.)
// These update once the fetch resolves via the proxy
export const site = new Proxy(DEFAULTS, {
  get(_, key) { return _config[key] ?? DEFAULTS[key] }
})

export function getAdminPassword() {
  return _config.admin_password ?? DEFAULTS.admin_password
}
