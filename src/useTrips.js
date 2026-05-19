import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function rowToTrip(row) {
  const { id, slug, name, tagline, location, emoji, duration, dates,
          price, old_price, spots_total, badge, accent_color,
          hero_image, card_image, active, data } = row
  return {
    id,
    slug,
    name,
    tagline,
    location,
    emoji,
    duration,
    dates,
    price,
    oldPrice: old_price,
    spotsTotal: spots_total,
    badge,
    accentColor: accent_color,
    heroImage: hero_image,
    cardImage: card_image,
    active,
    ...data,
  }
}

export function useTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('trips')
      .select('*')
      .eq('active', true)
      .order('id')
      .then(({ data, error }) => {
        if (!error && data) setTrips(data.map(rowToTrip))
        setLoading(false)
      })
  }, [])

  return { trips, loading }
}

export function useAllTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('trips').select('*').order('id')
    if (!error && data) setTrips(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  return { trips, loading, refetch: fetch }
}
