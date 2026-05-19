// Run this once from browser console or a one-time script to seed trips into Supabase
// Import and call seedTrips() from a temporary component or browser console

import { supabase } from './supabaseClient'
import { tripsData } from './tripsData'

export async function seedTrips() {
  for (const trip of tripsData) {
    const { id, slug, name, tagline, location, emoji, duration, dates,
            price, oldPrice, spotsTotal, badge, accentColor,
            heroImage, cardImage, ...rest } = trip

    const { error } = await supabase.from('trips').upsert({
      id,
      slug,
      name,
      tagline,
      location,
      emoji,
      duration,
      dates,
      price,
      old_price: oldPrice ?? null,
      spots_total: spotsTotal,
      badge,
      accent_color: accentColor,
      hero_image: heroImage,
      card_image: cardImage,
      active: true,
      data: rest,
    })

    if (error) console.error(`Failed to seed ${slug}:`, error)
    else console.log(`Seeded: ${slug}`)
  }
  console.log('Done seeding trips.')
}
