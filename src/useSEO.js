import { useEffect } from 'react'
import { site } from './siteConfig'

const setMeta = (selector, attr, value) => {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [attrName, attrVal] = selector.match(/\[(.+?)="(.+?)"\]/)?.slice(1) || []
    if (attrName) el.setAttribute(attrName, attrVal)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const setLink = (rel, href) => {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el) }
  el.setAttribute('href', href)
}

const setJsonLd = (id, data) => {
  let el = document.getElementById(id)
  if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el) }
  el.textContent = JSON.stringify(data)
}

const removeJsonLd = (id) => { document.getElementById(id)?.remove() }

export function useSEO({ title, description, image, url, trip } = {}) {
  useEffect(() => {
    const base      = site.name
    const fullTitle = title ? `${title} — ${base}` : `${base} — Group Trips from Gujarat`
    const desc      = description || `${base} — Small-group trips from Gujarat. Goa · Diu · Dwarka. All inclusive: transport, stay, meals & activities. Solo travelers welcome.`
    const img       = image || 'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=1200'
    const canonical = url || window.location.href

    document.title = fullTitle

    // Basic
    setMeta('meta[name="description"]',    'content', desc)
    setMeta('meta[name="robots"]',         'content', 'index, follow')
    setMeta('meta[name="author"]',         'content', base)

    // Canonical
    setLink('canonical', canonical)

    // Open Graph
    setMeta('meta[property="og:title"]',       'content', fullTitle)
    setMeta('meta[property="og:description"]',  'content', desc)
    setMeta('meta[property="og:image"]',        'content', img)
    setMeta('meta[property="og:url"]',          'content', canonical)
    setMeta('meta[property="og:type"]',         'content', trip ? 'article' : 'website')
    setMeta('meta[property="og:site_name"]',    'content', base)
    setMeta('meta[property="og:locale"]',       'content', 'en_IN')

    // Twitter
    setMeta('meta[name="twitter:card"]',        'content', 'summary_large_image')
    setMeta('meta[name="twitter:title"]',       'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', desc)
    setMeta('meta[name="twitter:image"]',       'content', img)

    // Trip-specific structured data
    if (trip) {
      setJsonLd('ld-trip', {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: trip.name,
        description: trip.description?.slice(0, 300),
        url: canonical,
        image: trip.heroImage,
        touristType: 'Group Travel',
        offers: {
          '@type': 'Offer',
          price: String(trip.price),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
        },
        provider: {
          '@type': 'TravelAgency',
          name: base,
          url: 'https://adventureloop.in',
          telephone: site.phone,
        },
        itinerary: trip.itinerary?.map(day => ({
          '@type': 'ItemList',
          name: day.label,
          itemListElement: day.timeline?.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t.activity,
          })),
        })),
      })

      // BreadcrumbList
      setJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://adventureloop.in' },
          { '@type': 'ListItem', position: 2, name: 'Trips', item: 'https://adventureloop.in/#trips' },
          { '@type': 'ListItem', position: 3, name: trip.name, item: canonical },
        ],
      })

      // FAQ from trip faqs
      if (trip.faqs?.length) {
        setJsonLd('ld-faq', {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: trip.faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        })
      }
    } else {
      removeJsonLd('ld-trip')
      removeJsonLd('ld-breadcrumb')
      removeJsonLd('ld-faq')
    }

    return () => {
      document.title = `${base} — Group Trips from Gujarat`
    }
  }, [title, description, image, url, trip])
}
