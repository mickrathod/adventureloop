import {
  ArrowLeft, MapPin, Calendar, Clock,
  CheckCircle, X, Utensils,
  Waves, Shield, Phone, Send,
  Sunrise, Sunset, Coffee, Car, Share2, ChevronRight, Zap, Train, Home
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './supabaseClient'
import { site, waLink } from './siteConfig'
import { useSEO } from './useSEO'

// ── Live countdown hook ───────────────────────────────────────────────────────
function useCountdown(targetDateStr) {
  const getTimeLeft = () => {
    const raw = targetDateStr?.split('→')[0]?.trim()
    if (!raw) return null
    const parts = raw.replace(/^[A-Za-z]+\s+/, '')
    const target = new Date(`${parts} 2026 00:00:00`)
    const now = new Date()
    const diff = target - now
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, gone: true }
    return {
      days:  Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      mins:  Math.floor((diff / (1000 * 60)) % 60),
      secs:  Math.floor((diff / 1000) % 60),
      gone:  false,
    }
  }
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft())
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [targetDateStr])
  return timeLeft
}

const DAY_COLORS = {
  'bg-teal-500':    '#14b8a6',
  'bg-teal-600':    '#0d9488',
  'bg-emerald-500': '#10b981',
  'bg-blue-500':    '#3b82f6',
  'bg-violet-500':  '#8b5cf6',
  'bg-orange-400':  '#fb923c',
  'bg-amber-500':   '#f59e0b',
  'bg-rose-500':    '#f43f5e',
  'bg-coral-500':   '#f43f5e',
  'bg-slate-500':   '#64748b',
  'bg-slate-600':   '#475569',
}

// ── icon map for itinerary day icons ─────────────────────────────────────────
const ICONS = {
  Sunrise:  <Sunrise  className="h-5 w-5 text-white" />,
  Sunset:   <Sunset   className="h-5 w-5 text-white" />,
  Coffee:   <Coffee   className="h-5 w-5 text-white" />,
  Waves:    <Waves    className="h-5 w-5 text-white" />,
  Car:      <Car      className="h-5 w-5 text-white" />,
  Train:    <Train    className="h-5 w-5 text-white" />,
  Zap:      <Zap      className="h-5 w-5 text-white" />,
  Home:     <Home     className="h-5 w-5 text-white" />,
}

// ── inclusion icon map ────────────────────────────────────────────────────────
const INCLUSION_ICONS = {
  Car:      <Car      className="h-6 w-6" />,
  Shield:   <Shield   className="h-6 w-6" />,
  Coffee:   <Coffee   className="h-6 w-6" />,
  Zap:      <Zap      className="h-6 w-6" />,
  Utensils: <Utensils className="h-6 w-6" />,
  Train:    <Train    className="h-6 w-6" />,
}

// ── accent color classes per trip ────────────────────────────────────────────
const ACCENT = {
  coral: {
    badge:     'bg-coral-500 text-white shadow-coral-500/30',
    timelineDot: 'border-coral-400',
    timeText:  'text-coral-500',
    btn:       'bg-coral-500 hover:bg-coral-600 shadow-coral-500/20',
    icon:      'text-coral-500',
    pill:      'bg-coral-500 text-white',
    heroMeta:  'text-coral-400',
    cardBadge: 'bg-teal-500',
  },
  amber: {
    badge:     'bg-amber-400 text-amber-950 shadow-amber-400/20',
    timelineDot: 'border-amber-400',
    timeText:  'text-amber-500',
    btn:       'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    icon:      'text-amber-500',
    pill:      'bg-amber-400 text-amber-950',
    heroMeta:  'text-amber-400',
    cardBadge: 'bg-amber-400',
  },
  teal: {
    badge:     'bg-teal-500 text-white shadow-teal-500/30',
    timelineDot: 'border-teal-400',
    timeText:  'text-teal-500',
    btn:       'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20',
    icon:      'text-teal-500',
    pill:      'bg-teal-500 text-white',
    heroMeta:  'text-teal-400',
    cardBadge: 'bg-teal-500',
  },
}

function rowToTrip(row) {
  const { id, slug, name, tagline, location, emoji, duration, dates,
          price, old_price, spots_total, badge, accent_color,
          hero_image, card_image, active, data } = row
  return {
    id, slug, name, tagline, location, emoji, duration, dates,
    price, oldPrice: old_price, spotsTotal: spots_total, badge,
    accentColor: accent_color, heroImage: hero_image, cardImage: card_image,
    active, ...data,
  }
}

export default function TripPage({ onBack }) {
  const { slug } = useParams()
  const navigate  = useNavigate()
  const [trip, setTrip]     = useState(null)
  const [others, setOthers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('trips').select('*').eq('active', true).order('id').then(({ data }) => {
      if (data) {
        const all = data.map(rowToTrip)
        setTrip(all.find(t => t.slug === slug) ?? null)
        setOthers(all.filter(t => t.slug !== slug))
      }
      setLoading(false)
    })
  }, [slug])

  const ac = ACCENT[trip?.accentColor] || ACCENT.coral
  const priceStr    = trip ? `₹${trip.price.toLocaleString('en-IN')}` : ''
  const oldPriceStr = trip?.oldPrice ? `₹${trip.oldPrice.toLocaleString('en-IN')}` : null
  const countdown = useCountdown(trip?.batches?.[0]?.dates)

  useSEO({
    title: trip ? `${trip.name} Group Trip from Gujarat · ${trip.duration} · ₹${trip?.price?.toLocaleString('en-IN')} All Inclusive` : 'Trip',
    description: trip ? `${trip.tagline || trip.description?.slice(0, 150)} — ${priceStr} all inclusive. ${trip.dates}. Transport, stay, meals & activities included. Book now.` : '',
    image: trip?.heroImage,
    url: window.location.href,
    trip,
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-lg font-semibold">Loading…</div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-4">Trip not found</h1>
          <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  const shareText = `${trip.emoji} Check out this ${trip.name} trip — ${priceStr} all inclusive! ${window.location.href}`

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative h-[70vh] sm:h-[80vh] md:h-[85vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src={trip.heroImage}
          alt={trip.name}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        {/* Nav row */}
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black hover:bg-white/20 transition border border-white/20 text-sm"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}
            className={`flex items-center gap-2 ${ac.btn} text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black transition shadow-xl text-sm`}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 md:p-20 z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className={`inline-flex items-center gap-2 ${ac.pill} px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-4 animate-pulse`}
            >
              {trip.badge}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-4 leading-[0.9] tracking-tighter"
            >
              {trip.name.split(',')[0]}, <span className={ac.heroMeta}>{trip.name.split(',')[1]?.trim()}</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3 sm:gap-6 text-white/80 text-xs sm:text-sm font-bold"
            >
              <span className="flex items-center gap-1.5"><Calendar className={`h-4 w-4 ${ac.heroMeta}`} /> {trip.dates}</span>
              <span className="flex items-center gap-1.5"><Clock    className={`h-4 w-4 ${ac.heroMeta}`} /> {trip.duration}</span>
              <span className="flex items-center gap-1.5"><MapPin   className={`h-4 w-4 ${ac.heroMeta}`} /> {trip.location}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">

          {/* ── Left col ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10 sm:space-y-12">

            {/* Experience */}
            <div className="glass-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-slate-100">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">The Experience</h2>
              <p className="text-slate-500 leading-relaxed text-base sm:text-lg font-medium">{trip.description}</p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {trip.highlightCards.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100">
                    <span className="text-xl sm:text-2xl shrink-0">{h.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-slate-900 truncate">{h.label}</div>
                      <div className={`text-[9px] sm:text-[10px] font-bold ${ac.icon} uppercase tracking-wide`}>{h.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusion icons */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 tracking-tight">What's Included</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {trip.inclusionIcons.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-center hover:bg-white hover:shadow-xl transition-all group"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center ${ac.icon} mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                      {INCLUSION_ICONS[item.icon]}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 mb-1">{item.label}</div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-5">Itinerary</h2>
              <div className="space-y-7">
                {trip.itinerary.map((day, di) => (
                  <div key={di}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-white p-2.5 rounded-xl shadow-md shrink-0" style={{background: DAY_COLORS[day.color] ?? '#0f172a'}}>{ICONS[day.iconKey]}</div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day.day}</div>
                        <div className="text-base sm:text-lg font-black text-gray-900">{day.label}</div>
                      </div>
                    </div>
                    <div className="ml-5 border-l-2 border-dashed border-gray-200">
                      {day.timeline.map((item, ti) => (
                        <div key={ti} className="relative pl-5 sm:pl-6 pb-4 last:pb-0">
                          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 ${ac.timelineDot}`}></div>
                          <div className={`text-xs font-bold ${ac.timeText} mb-0.5`}>{item.time}</div>
                          <div className="text-gray-700 text-sm font-medium">{item.activity}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions / Exclusions */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-green-50/50 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-green-100/50">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {trip.inclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 font-medium text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50/50 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-red-100/50">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  Not Included
                </h3>
                <ul className="space-y-3">
                  {trip.exclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 font-medium text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">Trip Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {trip.photos.map((src, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-square">
                    <img src={src} alt={`${trip.name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Point */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className={`h-5 w-5 ${ac.icon} shrink-0`} /> {trip.meetingPoint.title}
              </h2>
              {trip.meetingPoint.lines.map((line, i) => (
                <p key={i} className="text-gray-700 text-sm leading-relaxed mb-2">
                  <strong>{line.bold}</strong> {line.text}
                </p>
              ))}
              <p className="text-gray-500 text-xs">{trip.meetingPoint.note}</p>
            </div>

            {/* What to Carry */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">What to Carry</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {trip.whatToCarry.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm text-gray-700">
                    <span className="text-xl shrink-0">{item.emoji}</span>{item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {trip.faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 sm:p-5">
                    <div className="font-black text-gray-900 text-sm mb-1.5">Q: {faq.q}</div>
                    <div className="text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tagline banner (optional) */}
            {trip.tagline && (
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 text-center text-white">
                <div className="text-3xl mb-3">{trip.emoji}</div>
                <h3 className="text-xl sm:text-2xl font-black mb-2">{trip.tagline}</h3>
                <p className="text-white/80 font-medium text-sm">Experience {trip.name.split(',')[0]} like never before with your new travel family.</p>
              </div>
            )}

          </div>

          {/* ── Right: sticky booking card ────────────────────────────────────── */}
          <div className="lg:col-span-1 order-first lg:order-none">
            <div className="lg:sticky lg:top-24 glass-card rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">

              {/* Price header */}
              <div className="bg-slate-900 p-6 sm:p-10 text-white">
                <div className="mb-4 sm:mb-6">
                  <span className={`${ac.badge} text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg animate-pulse`}>
                    {trip.bookingCardBadge}
                  </span>
                </div>
                <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Package Starts At</div>
                <div className="flex items-end gap-3 mb-3">
                  <div className="text-4xl sm:text-6xl font-black leading-none tracking-tighter">{priceStr}</div>
                  {oldPriceStr && (
                    <div className="pb-1">
                      <div className="text-white/30 line-through text-sm font-bold">{oldPriceStr}</div>
                      <div className="text-green-400 text-[10px] font-black uppercase tracking-wider mt-1">{trip.bookingCardSaveText}</div>
                    </div>
                  )}
                  {!oldPriceStr && <div className="text-white/50 text-xs font-bold pb-1">/ person</div>}
                </div>
                <p className="text-white/50 text-xs font-medium leading-relaxed italic">"{trip.bookingCardQuote}"</p>
              </div>

              {/* Info rows */}
              <div className="p-5 sm:p-8 space-y-3 bg-white/50">
                {trip.bookingCardInfo.map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{row.label}</span>
                    <span className="font-black text-slate-900 text-right text-xs sm:text-sm">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Live countdown */}
              {countdown && !countdown.gone && (
                <div className="px-5 sm:px-8 pb-2 bg-white/50">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">⏳ Trip Starts In</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: String(countdown.days).padStart(2, '0'),  label: 'Days' },
                      { val: String(countdown.hours).padStart(2, '0'), label: 'Hrs'  },
                      { val: String(countdown.mins).padStart(2, '0'),  label: 'Mins' },
                      { val: String(countdown.secs).padStart(2, '0'),  label: 'Secs' },
                    ].map((t, i) => (
                      <div key={i} className="bg-slate-900 rounded-xl py-2 text-center">
                        <div className="text-lg sm:text-2xl font-black text-white leading-none tabular-nums">{t.val}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {countdown?.gone && (
                <div className="px-5 sm:px-8 pb-2 bg-white/50 text-center">
                  <span className="text-xs font-black text-coral-500 uppercase tracking-wider">🔥 Trip is Live!</span>
                </div>
              )}

              {/* CTA */}
              <div className="p-5 sm:p-8 space-y-3 bg-white">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0 })
                    setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100)
                    onBack()
                  }}
                  className={`w-full py-4 sm:py-5 ${ac.btn} text-white font-black rounded-2xl flex items-center justify-center gap-3 transition shadow-2xl text-sm sm:text-base`}
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" /> Reserve My Spot
                </button>
                <a href={`tel:${site.phone}`} className="btn-secondary w-full !py-4 sm:!py-5 text-sm">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" /> Direct Call
                </a>
                <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Shield className="h-3.5 w-3.5 text-blue-500" /> No payment needed today
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── You Might Also Like ─────────────────────────────────────────────── */}
        {others.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-5">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {others.map(other => {
                const otherAc = ACCENT[other.accentColor] || ACCENT.coral
                return (
                  <div
                    key={other.slug}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
                    onClick={() => navigate(`/trips/${other.slug}`)}
                  >
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img src={other.cardImage} alt={other.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className={`absolute top-3 left-3 ${otherAc.cardBadge} text-white text-xs font-black px-2.5 py-1 rounded-full`}>{other.badge}</span>
                      <h3 className="absolute bottom-3 left-4 text-lg sm:text-xl font-black text-white">{other.name}</h3>
                    </div>
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">{other.duration} · {other.dates.split('·')[0].trim()}</div>
                        <div className={`text-lg sm:text-xl font-black ${otherAc.icon}`}>
                          ₹{other.price.toLocaleString('en-IN')} <span className="text-xs text-gray-400 font-normal">/ person</span>
                        </div>
                      </div>
                      <button className={`${otherAc.btn} text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition`}>
                        View <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
