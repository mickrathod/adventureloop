import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, MapPin, Calendar, Clock, Users, Star,
  Send, Phone, Mail, Instagram, Facebook,
  ChevronRight, Heart, Camera, BookOpen,
  Globe, Compass, Plane, Mountain,
  Sparkles, ArrowRight, Shield, Award,
  Headphones, Zap, CheckCircle, UserCheck, Car
} from 'lucide-react'
import TripPage from './TripPage'
import PoliciesPage from './PoliciesPage'
import AdminCalculator from './AdminCalculator'
import AdminTemplates from './AdminTemplates'
import AdminBookings from './AdminBookings'
import AdminTrips from './AdminTrips'
import AdminSiteConfig from './AdminSiteConfig'
import AdminLayout from './AdminLayout'
import AdminLogin from './AdminLogin'
import { useTrips } from './useTrips'
import { useSEO } from './useSEO'
import { supabase } from './supabaseClient'
import { site, waLink } from './siteConfig'

function PoliciesPageWrapper() {
  const { type } = useParams()
  const nav = useNavigate()
  return <PoliciesPage activePolicy={type} onBack={() => nav(-1)} />
}

function App() {
  const navigate = useNavigate()
  const { trips: tripsData } = useTrips()
  useSEO({
    title: 'Group Trips from Gujarat · Goa, Diu, Dwarka & More',
    description: 'AdventureLoop — Loop in. Adventure out. Small-group trips from Gujarat. Goa · Diu · Dwarka · All inclusive · Scooty included · Solo travelers welcome.',
    image: 'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=1200',
  })

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    trip: '',
    travelers: 1,
    message: ''
  })
  const [hoveredCard, setHoveredCard] = useState(null)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [tripDropdownOpen, setTripDropdownOpen] = useState(false)
  const [notifyInputs, setNotifyInputs] = useState({})   // { tripId: { phone, submitted, loading } }

  const handleNotifySubmit = async (tripId, tripName) => {
    const phone = notifyInputs[tripId]?.phone || ''
    if (!phone) return
    setNotifyInputs(p => ({ ...p, [tripId]: { ...p[tripId], loading: true } }))
    const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL
    try {
      if (SLACK_WEBHOOK_URL) {
        await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          body: JSON.stringify({ text: `📣 *Notify Me Request*\n*Trip:* ${tripName}\n*Phone:* ${phone}` }),
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
        })
      }
    } catch (_) {}
    await supabase.from('bookings').insert({
      type: 'notify_me',
      trip: tripName,
      phone,
      status: 'new',
    })
    setNotifyInputs(p => ({ ...p, [tripId]: { phone, loading: false, submitted: true } }))
  }
  const [heroTrip, setHeroTrip] = useState(0)
  const [showLiveNotif, setShowLiveNotif] = useState(false)
  const [liveNotif, setLiveNotif] = useState({ name: '', city: '', action: '' })

  useEffect(() => {
    const names = ['Arjun', 'Siddharth', 'Priya', 'Ananya', 'Rohan', 'Meera']
    const cities = ['Ahmedabad', 'Mumbai', 'Surat', 'Bhavnagar']
    const actions = ['just booked a spot for Diu!', 'is enquiring about Dwarka', 'joined the waitlist for Kerala', 'just shared the Diu trip!', 'just reserved a spot for Goa!', 'is checking the Goa package 👀']

    const showNotif = () => {
      setLiveNotif({
        name: names[Math.floor(Math.random() * names.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        action: actions[Math.floor(Math.random() * actions.actions?.length || Math.floor(Math.random() * 4))]
      })
      setShowLiveNotif(true)
      setTimeout(() => setShowLiveNotif(false), 5000)
    }

    const timer = setInterval(() => {
      if (Math.random() > 0.7) showNotif()
    }, 15000)

    return () => clearInterval(timer)
  }, [])


  const featuredTrips = tripsData.map(t => ({
    name:     t.name,
    location: t.location,
    emoji:    t.emoji,
    image:    t.cardImage,
    badge:    t.badge,
    spots:    `${t.spotsTotal} spots left`,
    dates:    t.dates,
    duration: t.duration,
    tags:     t.tags,
    oldPrice: t.oldPrice ? `₹${t.oldPrice.toLocaleString('en-IN')}` : null,
    price:    `₹${t.price.toLocaleString('en-IN')}`,
    save:     t.oldPrice ? `SAVE ₹${(t.oldPrice - t.price).toLocaleString('en-IN')}` : null,
    onClick:  () => navigate(`/trips/${t.slug}`),
    btnLabel: 'View Details',
  }))

  const activeTrips = tripsData
  const tripBatches = Object.fromEntries(activeTrips.map(t => [t.name, t.batches ?? []]))
  const [selectedTripName, setSelectedTripName] = useState('')
  useEffect(() => {
    if (!selectedTripName && activeTrips.length > 0) setSelectedTripName(activeTrips[0].name)
  }, [activeTrips])

  // Show Policies page — now handled by /policies/:type route

  const scrollToSection = (section) => {
    setActiveSection(section)
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setBookingLoading(true)
    setBookingError(null)

    // Slack Webhook URL (You can set this in your .env file as VITE_SLACK_WEBHOOK_URL)
    const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL

    if (!SLACK_WEBHOOK_URL) {
      setBookingError('Slack Webhook URL not configured. Please contact the administrator.')
      setBookingLoading(false)
      return
    }

    try {
      const slackMessage = {
        text: `*New Trip Booking Request!* 🚀`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*New Trip Booking Request!* 🚀\n\n*Name:* ${bookingForm.name}\n*Email:* ${bookingForm.email}\n*Phone:* ${bookingForm.phone}\n*Trip:* ${bookingForm.trip}\n*Travelers:* ${bookingForm.travelers}\n*Message:* ${bookingForm.message || 'None'}`
            }
          }
        ]
      }

      const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify(slackMessage),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors' // Use no-cors for simple Slack webhooks if CORS is an issue
      })

      await supabase.from('bookings').insert({
        type: 'booking',
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        trip: bookingForm.trip,
        travelers: bookingForm.travelers,
        message: bookingForm.message || '',
        status: 'new',
      })

      setBookingSubmitted(true)

      // Reset form
      setBookingForm({
        name: '', email: '', phone: '', trip: '', travelers: 1, message: ''
      })
    } catch (err) {
      console.error('Slack Error:', err)
      setBookingError('Something went wrong. Please try again or chat with us on WhatsApp.')
    } finally {
      setBookingLoading(false)
    }
  }

  const upcomingTrips = tripsData.map(t => ({
    id: t.id,
    slug: t.slug,
    destination: t.name,
    dates: t.dates,
    price: `₹${t.price.toLocaleString('en-IN')}`,
    oldPrice: t.oldPrice ? `₹${t.oldPrice.toLocaleString('en-IN')}` : null,
    spots: t.spotsTotal,
    image: t.cardImage,
    highlights: t.highlights,
    comingSoon: false,
  }))

  const blogPosts = [
    {
      id: 1,
      title: 'Top 5 Group Travel Destinations for 2026',
      excerpt: 'Discover the most exciting places to explore with new friends this year...',
      date: 'April 15, 2026',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'
    },
    {
      id: 2,
      title: 'Packing Tips for Group Adventures',
      excerpt: 'Essential items and smart packing strategies for your next group trip...',
      date: 'April 10, 2026',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600'
    },
    {
      id: 3,
      title: 'Making Friends While Traveling',
      excerpt: 'How to connect with fellow travelers and build lasting friendships...',
      date: 'April 5, 2026',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600'
    }
  ]

  return (
    <div className="relative">
      {/* ── Live Booking Notification ── */}
      <AnimatePresence>
        {showLiveNotif && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-[100] glass-card !bg-white/90 p-4 rounded-2xl flex items-center gap-4 max-w-sm shadow-2xl border-orange-100"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <UserCheck className="h-6 w-6 text-[#F97316]" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Live Activity</div>
              <div className="text-sm font-bold text-slate-900">
                <span className="text-[#F97316]">{liveNotif.name}</span> from {liveNotif.city}
              </div>
              <div className="text-xs text-slate-500 font-medium">{liveNotif.action}</div>
            </div>
            <button onClick={() => setShowLiveNotif(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/trips/:slug" element={<TripPage onBack={() => { navigate('/'); window.scrollTo(0, 0); }} />} />
        <Route path="/policies/:type" element={<PoliciesPageWrapper />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/bookings" replace />} />
          <Route path="bookings"   element={<AdminBookings />} />
          <Route path="trips"      element={<AdminTrips />} />
          <Route path="config"     element={<AdminSiteConfig />} />
          <Route path="calculator" element={<AdminCalculator />} />
          <Route path="templates"  element={<AdminTemplates />} />
        </Route>
        <Route path="*" element={
          <div className="min-h-screen bg-[#fafaf8]">

            {/* ── Top Marquee Announcement Bar ── */}
            <div className="fixed top-0 left-0 right-0 z-[60] overflow-hidden py-2" style={{background:'var(--primary)'}}>
              <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(2)].map((_, ri) => (
                  <div key={ri} className="flex items-center gap-8 mr-8">
                    {[
                      { icon: '🛡️', text: 'Verified Hotels & Transport' },
                      { icon: '🤝', text: 'Limited Seats Per Batch' },
                      { icon: '💸', text: 'No Hidden Costs Ever' },
                      { icon: '📞', text: '24/7 Founder Support' },
                      { icon: '🗺️', text: 'Hand-Crafted Itineraries' },
                      { icon: '👫', text: 'Solo Traveler Friendly' },
                      { icon: '🔥', text: 'Founding Batch Pricing' },
                      { icon: '✈️', text: 'All-Inclusive Packages' },
                    ].map((item, i) => (
                      <span key={i} className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wide">
                        <span>{item.icon}</span>
                        <span>{item.text}</span>
                        <span className="text-white/40 mx-2">✦</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="fixed top-8 left-0 right-0 z-50 transition-all duration-500">
              <div className="absolute inset-0 glass-nav shadow-lg shadow-black/5" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between items-center h-20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { scrollToSection('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{background:'var(--primary)'}}>
                      <Plane className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-display font-black tracking-tight text-slate-900">{site.name}</span>
                  </motion.button>

                  <div className="hidden md:flex items-center gap-2">
                    {['Home', 'About', 'Trips', 'Gallery', 'Blog'].map((item) => (
                      <button key={item} onClick={() => scrollToSection(item.toLowerCase())}
                        className={`relative px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${activeSection === item.toLowerCase() ? '' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        style={activeSection === item.toLowerCase() ? {color:'var(--primary)'} : {}}>
                        {item}
                        {activeSection === item.toLowerCase() && (
                          <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl -z-10" style={{background:'rgba(8,47,73,0.07)'}} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                        )}
                      </button>
                    ))}
                    <button onClick={() => scrollToSection('contact')}
                      className="ml-4 btn-primary !py-2.5 !px-6 text-sm">
                      Book a Spot
                    </button>
                  </div>

                  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-900">
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden absolute top-full left-0 right-0 glass-nav border-t border-slate-100 shadow-2xl p-4 space-y-2"
                  >
                    {['Home', 'About', 'Trips', 'Gallery', 'Blog'].map((item) => (
                      <button key={item} onClick={() => scrollToSection(item.toLowerCase())}
                        className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#F97316] text-sm font-bold transition-colors">
                        {item}
                      </button>
                    ))}
                    <button onClick={() => scrollToSection('contact')}
                      className="w-full btn-primary !py-3 mt-2">
                      Book a Spot
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>


            {/* ── Hero ─────────────────────────────────────────── */}
            <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-28" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #fff3e0 40%, #e0f2f1 100%)' }}>
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl -mr-64 -mt-32 animate-pulse-slow pointer-events-none" style={{background:'radial-gradient(circle, rgba(15,118,110,0.15), rgba(8,47,73,0.08))'}} />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl -ml-48 -mb-32 animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s', background:'radial-gradient(circle, rgba(249,115,22,0.12), transparent)' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-rose-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Floating emoji decorations */}
              <div className="absolute top-32 left-8 text-3xl opacity-20 animate-float pointer-events-none select-none hidden lg:block" style={{ animationDelay: '0s' }}>🌊</div>
              <div className="absolute top-64 right-8 text-2xl opacity-15 animate-float pointer-events-none select-none hidden lg:block" style={{ animationDelay: '1s' }}>🏔️</div>
              <div className="absolute bottom-40 left-16 text-2xl opacity-15 animate-float pointer-events-none select-none hidden lg:block" style={{ animationDelay: '3s' }}>🌅</div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full relative z-10">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                  {/* ── Left: text ── */}
                  <div>
                    {/* Pill badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 border px-4 py-2 rounded-full mb-6 shadow-sm backdrop-blur-sm" style={{background:'rgba(8,47,73,0.07)', borderColor:'rgba(8,47,73,0.2)'}}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{background:'var(--accent)'}}></span>
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{background:'var(--accent)'}}></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-widest" style={{color:'var(--primary)'}}>✦ Gujarat's #1 Group Travel</span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-5 sm:mb-7 leading-[0.9] tracking-tighter"
                    >
                      <span className="bg-clip-text text-transparent animate-gradient-x" style={{backgroundImage:'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))', backgroundSize:'200% 200%'}}>Adventure Loop,</span>
                      <br />
                      <span className="text-slate-900 relative">
                        Explore More
                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 8C50 3 100 1 150 4C200 7 250 9 298 6" stroke="#f97316" strokeWidth="3" strokeLinecap="round" className="opacity-40"/>
                        </svg>
                      </span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed max-w-lg font-medium"
                    >
                      Start as strangers. Leave as a pack. 🤝 Curated group trips from Gujarat — beaches, mountains, temples, and everything in between.
                    </motion.p>

                    {/* Stats row */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="flex gap-6 mb-8"
                    >
                      {[
                        { val: '3+', label: 'Active Trips' },
                        { val: '10–12', label: 'Per Batch' },
                        { val: '100%', label: 'Transparent' },
                      ].map((s, i) => (
                        <div key={i} className="text-center">
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{s.val}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col sm:flex-row gap-4 mb-10"
                    >
                      <button
                        onClick={() => scrollToSection('trips')}
                        className="btn-primary !px-8 !py-4 text-base sm:text-lg group relative overflow-hidden"
                      >
                        <span className="absolute inset-0 animate-shimmer pointer-events-none" />
                        <span>🏖️ Browse Trips</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <a
                        href={waLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary !px-8 !py-4 text-base sm:text-lg group"
                      >
                        <span className="text-green-600">💬</span> Chat on WhatsApp
                      </a>
                    </motion.div>

                    {/* Social proof avatars */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex -space-x-3">
                        {['🧑', '👩', '🧔', '👱', '🙋'].map((emoji, i) => (
                          <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-white flex items-center justify-center text-sm shadow-sm">{emoji}</div>
                        ))}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-700">50+ travelers already registered</div>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xs">★</span>)}
                          <span className="text-[10px] text-slate-400 font-bold ml-1">Founding batch</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* ── Right: Featured Trip Card ── */}
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-3xl blur-2xl animate-pulse-slow" style={{background:'rgba(249,115,22,0.15)'}}></div>

                    {/* Featured label + switcher */}
                    <div className="relative z-10 mb-3 flex items-center gap-2">
                      <div className="h-px flex-1" style={{background:'linear-gradient(to right, var(--accent), transparent)'}}></div>
                      <span className="text-xs font-black uppercase tracking-widest" style={{color:'var(--accent)'}}>✦ Featured Trips</span>
                      <div className="h-px flex-1" style={{background:'linear-gradient(to left, var(--accent), transparent)'}}></div>
                    </div>

                    {/* Trip toggle tabs */}
                    <div className="relative z-10 flex gap-2 mb-3">
                      {featuredTrips.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroTrip(i)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border-2 transition-all ${heroTrip === i ? 'text-white shadow-md' : 'bg-white border-gray-200 text-gray-500'}`}
                          style={heroTrip === i ? {background:'var(--primary)', borderColor:'var(--primary)'} : {}}
                        >
                          {t.emoji} {t.name}
                        </button>
                      ))}
                    </div>

                    {/* Card */}
                    {featuredTrips.map((trip, i) => (
                      <div
                        key={i}
                        className={`relative z-10 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group transition-all duration-300 ${heroTrip === i ? 'block' : 'hidden'}`}
                        onClick={trip.onClick}
                      >
                        {/* Image */}
                        <div className="relative h-52 sm:h-64 overflow-hidden">
                          <img
                            src={trip.image}
                            alt={trip.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="bg-white text-xs font-black px-3 py-1.5 rounded-full shadow-md" style={{color:'var(--primary)'}}>{trip.badge}</span>
                          </div>
                          <div className="absolute top-4 right-4">
                            <span className="text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md" style={{background:'var(--accent)'}}>🔥 {trip.spots}</span>
                          </div>
                          <div className="absolute bottom-4 left-5">
                            <div className="text-white/70 text-xs font-semibold mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> {trip.location}</div>
                            <h3 className="text-3xl font-black text-white">{trip.name}</h3>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="bg-white px-6 py-5">
                          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-4">
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-orange-400" /> {trip.dates}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-orange-400" /> {trip.duration}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {trip.tags.map(tag => (
                              <span key={tag} className="bg-orange-50 text-[#ea6c00] border border-orange-100 text-xs font-bold px-2.5 py-1 rounded-full">{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                              {trip.oldPrice && (
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-xs text-gray-400 line-through">{trip.oldPrice}</span>
                                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">{trip.save}</span>
                                </div>
                              )}
                              {!trip.oldPrice && <div className="text-xs text-gray-400 mb-0.5 font-medium">Per person</div>}
                              <span className="text-3xl font-black text-[#F97316]">{trip.price}</span>
                              <span className="text-gray-400 text-xs ml-1">/ person</span>
                            </div>
                            <button className="bg-[#F97316] hover:bg-[#ea6c00] text-white px-6 py-3 rounded-2xl font-black text-sm transition-all hover:scale-105 shadow-lg shadow-orange-500/20 flex items-center gap-1.5">
                              {trip.btnLabel} <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Scroll indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-md border border-gray-100">
                  <ChevronRight className="h-5 w-5 text-gray-500 rotate-90" />
                </div>
              </div>
            </section>


            {/* ── Why Choose Us ────────────────────────────────── */}
            <section id="about" className="section-padding px-4 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/30 rounded-full blur-[100px] -mr-64 -mt-64"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-50/30 rounded-full blur-[100px] -ml-64 -mb-64"></div>

              <div className="max-w-7xl mx-auto relative">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                  {/* Left: Text Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 px-5 py-2.5 rounded-2xl mb-8 shadow-sm shadow-orange-500/5">
                      <Heart className="h-4 w-4 text-[#F97316] animate-pulse" />
                      <span className="text-[#ea6c00] text-xs font-black uppercase tracking-widest">Our Story</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8 leading-[1.1] text-slate-900 tracking-tight">
                      Started by Travelers,<br />
                      <span className="text-gradient">For the New Explorer</span>
                    </h2>
                    <div className="space-y-6 text-slate-500 text-lg leading-relaxed font-medium">
                      <p>
                        We didn't start {site.name} to be the biggest agency. We started it because we were tired of generic tours that felt like items on a checklist.
                      </p>
                      <p>
                        We are a small team of passionate travelers who believe that the best part of any journey isn't just the destination—it's the people you meet along the way.
                      </p>
                      <div className="relative p-8 bg-[#082F49] rounded-3xl shadow-2xl shadow-orange-500/15 mt-10 overflow-hidden">
                        <div className="absolute top-4 right-6 text-white/10 text-8xl font-serif leading-none select-none">"</div>
                        <p className="font-bold text-white text-lg leading-relaxed relative z-10">
                          "This is our very first official trip. We are putting all our heart and soul into making sure every traveler in our founding batch has an unforgettable experience."
                        </p>
                        <div className="mt-5 flex items-center gap-3 relative z-10">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🚀</div>
                          <div>
                            <div className="text-white font-black text-sm">The Founders</div>
                            <div className="text-white/60 text-xs font-bold">{site.name}, {site.year}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right: Visual Trust / Values */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                    {[
                      { icon: <Shield className="h-7 w-7" />, title: 'Genuine Connection', desc: 'No large crowds. Small, curated groups for real friendships.', bg: "bg-[#082F49]" },
                      { icon: <Zap className="h-7 w-7" />, title: 'Pure Passion', desc: 'Every itinerary is hand-crafted by people who love to explore.', bg: "bg-[#F97316]" },
                      { icon: <Users className="h-7 w-7" />, title: 'First-Batch Focus', desc: 'You aren\'t just a customer; you are part of our founding history.', bg: "bg-[#0F766E]" },
                      { icon: <Star className="h-7 w-7" />, title: 'Full Transparency', desc: 'No hidden costs, no fake reviews. Just honest, good travel.', bg: 'bg-[#F97316]' },
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2"
                      >
                        <div className={`${feature.bg} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                        <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Community Vibe ──────────────────────────────── */}
            <section className="section-padding px-4 bg-slate-900 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,0.1),transparent_50%)]"></div>

              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight text-white"
                  >
                    More Than Just <span className="text-[#F97316]" style={{color:"#F97316"}}>Sightseeing</span>
                  </motion.h2>
                  <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">We curate experiences that break the ice and build bonds.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { icon: <Users className="h-8 w-8" />, title: 'Solo-Traveler Hub', desc: '80% of our travelers join solo. We ensure you feel at home from minute one.' },
                    { icon: <Sparkles className="h-8 w-8" />, title: 'Ice-Breaking Games', desc: 'No awkward silences. Our group games and activities spark real conversations.' },
                    { icon: <Heart className="h-8 w-8" />, title: 'The "Pack" Vibe', desc: `You start as strangers, you leave as a pack. That is the ${site.name} promise.` }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-500"
                    >
                      <div className="text-[#F97316] mb-8">{item.icon}</div>
                      <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
            <section className="section-padding px-4 bg-[#FFF7ED] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -mr-64 -mt-64" style={{background:'rgba(15,118,110,0.08)'}}></div>

              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center space-x-2 bg-white border border-orange-100 px-5 py-2.5 rounded-2xl mb-6 shadow-sm"
                  >
                    <Shield className="h-4 w-4 text-[#0F766E]" />
                    <span className="text-xs font-black uppercase tracking-widest" style={{color:'#082F49'}}>Travel with Confidence</span>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-slate-900"
                  >
                    Our Safety & <span style={{color:'#0F766E'}}>Trust Commitment</span>
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-500 max-w-2xl mx-auto font-medium"
                  >
                    Because your peace of mind is our top priority. We ensure every trip is safe, secure, and professionally managed.
                  </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      icon: <CheckCircle className="h-8 w-8 text-[#0F766E]" />,
                      title: 'Verified Stays',
                      desc: 'We only partner with hotels we have personally visited. Clean, safe, and prime locations.',
                      iconBg: 'rgba(15,118,110,0.12)'
                    },
                    {
                      icon: <Car className="h-8 w-8 text-white" />,
                      title: 'Trusted Transport',
                      desc: 'Professional drivers and well-maintained AC vehicles for your transit comfort.',
                      iconBg: '#082F49'
                    },
                    {
                      icon: <UserCheck className="h-8 w-8 text-white" />,
                      title: 'Safe Group Vibe',
                      desc: 'Special focus on solo & women travelers. We ensure an inclusive, respectful environment.',
                      iconBg: '#F97316'
                    },
                    {
                      icon: <Phone className="h-8 w-8 text-white" />,
                      title: '24/7 Support',
                      desc: 'Direct access to the founders throughout the journey. No bots, just real help.',
                      iconBg: '#082F49'
                    }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white p-8 rounded-[2rem] border border-orange-100 hover:shadow-2xl hover:shadow-orange-200/30 transition-all duration-500 group"
                    >
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform" style={{background: item.iconBg}}>
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-black mb-4 tracking-tight" style={{color:'#082F49'}}>{item.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── How It Works ─────────────────────────────────── */}
            <section className="py-24 px-4 bg-[#FFF7ED] relative overflow-hidden">
              <div className="absolute top-20 right-20 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute bottom-20 left-20 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

              <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center space-x-2 bg-white border border-orange-100 px-5 py-2.5 rounded-full mb-6 shadow-sm">
                    <Compass className="h-4 w-4 text-[#F97316]" />
                    <span className="text-[#ea6c00] text-sm font-bold">How It Works</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                    <span className="bg-gradient-to-r from-[#082F49] to-[#F97316] bg-clip-text text-transparent">4 Steps</span>{' '}
                    <span className="text-gray-900">to Your Dream Trip</span>
                  </h2>
                  <p className="text-xl text-gray-500 max-w-2xl mx-auto">Getting started is easier than packing your bags.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                  {[
                    { step: '01', icon: <Compass className="h-7 w-7" />, title: 'Pick a Trip', desc: 'Browse our upcoming adventures and find the one that matches your vibe.', bg: "bg-[#F97316]", numColor: 'text-[#F97316]' },
                    { step: '02', icon: <Calendar className="h-7 w-7" />, title: 'Book Your Spot', desc: 'Reserve your place in minutes with our simple and secure booking form.', bg: "bg-[#0F766E]", numColor: 'text-orange-500' },
                    { step: '03', icon: <CheckCircle className="h-7 w-7" />, title: 'Get Confirmed', desc: 'Receive your trip details, packing list, and meet-your-group intro within 24 hours.', bg: 'bg-[#082F49]', numColor: 'text-[#082F49]' },
                    { step: '04', icon: <Mountain className="h-7 w-7" />, title: 'Explore Together', desc: 'Show up and let us take care of everything. Just bring your spirit of adventure!', bg: 'bg-[#ea6c00]', numColor: 'text-[#F97316]' },
                  ].map((item, idx, arr) => (
                    <div key={idx} className="relative bg-white rounded-3xl p-5 sm:p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border border-gray-100 group flex flex-col items-center">
                      {/* Icon */}
                      <div className={`${item.bg} w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>

                      {/* Arrow connector between cards (not a background line) */}
                      {idx < arr.length - 1 && (
                        <div className="hidden lg:flex absolute -right-3 top-8 z-10 items-center justify-center w-6 h-6 bg-white rounded-full border-2 border-orange-200 shadow-sm">
                          <ChevronRight className="h-3 w-3 text-orange-400" />
                        </div>
                      )}

                      {/* Step number — bold and clearly visible */}
                      <div className={`text-5xl font-black ${item.numColor} opacity-40 mb-1 select-none leading-none`}>{item.step}</div>
                      <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Upcoming Trips ────────────────────────────────── */}
            <section id="trips" className="py-24 px-4 bg-[#FFF7ED] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>

              <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 bg-white border border-orange-100 px-5 py-2.5 rounded-full mb-6 shadow-sm"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
                    </span>
                    <span className="text-[#ea6c00] text-sm font-black uppercase tracking-wider">Live Trips · Book Now</span>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4"
                  >
                    <span className="bg-gradient-to-r from-[#082F49] to-orange-500 bg-clip-text text-transparent">Your Next Adventure</span>
                    <br className="hidden sm:block" />
                    <span className="text-slate-900 text-2xl sm:text-3xl md:text-4xl font-black"> Starts Here 🗺️</span>
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-gray-500 max-w-2xl mx-auto"
                  >
                    Carefully curated group trips — Goa, Diu, Dwarka + more coming soon. Small batches, big memories.
                  </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {upcomingTrips.map((trip, idx) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      onMouseEnter={() => setHoveredCard(trip.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className={`group glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 ${trip.comingSoon ? 'opacity-70' : 'hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-4 cursor-pointer'}`}
                      onClick={() => { if (!trip.comingSoon && trip.slug) navigate(`/trips/${trip.slug}`) }}
                    >
                      <div className="relative h-80 overflow-hidden">
                        <img
                          src={trip.image}
                          alt={trip.destination}
                          className={`w-full h-full object-cover transition-transform duration-1000 ${trip.comingSoon ? 'grayscale' : 'group-hover:scale-110'}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

                        {trip.comingSoon ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20 shadow-2xl">
                              <span className="text-white font-black text-xl tracking-[0.2em] uppercase">Coming Soon</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="absolute top-6 right-6">
                              <div className="bg-[#F97316] text-white px-4 py-2 rounded-2xl text-xs font-black shadow-xl shadow-orange-500/20 flex items-center gap-1.5 animate-pulse">
                                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                                LIMITED SEATS
                              </div>
                            </div>
                            {trip.id === 1 && (
                              <div className="absolute top-6 left-6">
                                <div className="bg-white/90 backdrop-blur-sm text-[#F97316] px-4 py-2 rounded-2xl text-xs font-black shadow-xl">
                                  🎉 LAUNCH PRICE
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        <div className="absolute bottom-6 left-8">
                          <div className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Adventure Awaits</div>
                          <h3 className="text-3xl font-black text-white tracking-tight">{trip.destination}</h3>
                        </div>
                      </div>
                      <div className="p-5 sm:p-8">
                        <div className="flex items-center text-slate-500 mb-6 text-sm font-bold">
                          <Calendar className="h-4 w-4 mr-2 text-[#F97316]" />
                          <span>{trip.dates}</span>
                        </div>

                        {/* Batch Progress Bar */}
                        {!trip.comingSoon && (
                          <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Status</span>
                              <span className="text-xs font-black text-[#F97316] uppercase italic">Filling Fast!</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '85%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-[#0F766E] to-[#F97316] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-8">
                          {trip.highlights.map((highlight, idx) => (
                            <span key={idx} className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-xl text-[11px] font-bold border border-slate-100 group-hover:bg-orange-50 group-hover:text-[#ea6c00] group-hover:border-orange-100 transition-colors">
                              {highlight}
                            </span>
                          ))}
                        </div>
                        <div className="pt-6 border-t border-slate-100">
                          {trip.comingSoon ? (
                            /* ── Notify Me form ── */
                            notifyInputs[trip.id]?.submitted ? (
                              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <div>
                                  <div className="text-xs font-black text-green-700">You're on the list! 🎉</div>
                                  <div className="text-[10px] text-green-600 font-medium">We'll WhatsApp you when it drops.</div>
                                </div>
                              </div>
                            ) : (
                              <div onClick={e => e.stopPropagation()} className="space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🔔 Notify me when it's live</div>
                                <div className="flex gap-2">
                                  <input
                                    type="tel"
                                    placeholder="WhatsApp number"
                                    value={notifyInputs[trip.id]?.phone || ''}
                                    onChange={e => setNotifyInputs(p => ({ ...p, [trip.id]: { ...p[trip.id], phone: e.target.value } }))}
                                    className="flex-1 px-3 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:border-orange-400 text-xs font-bold text-slate-900"
                                  />
                                  <button
                                    onClick={() => handleNotifySubmit(trip.id, trip.destination)}
                                    disabled={notifyInputs[trip.id]?.loading}
                                    className="bg-slate-900 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-black text-xs transition-all shrink-0"
                                  >
                                    {notifyInputs[trip.id]?.loading ? '...' : 'Notify Me'}
                                  </button>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                {trip.oldPrice ? (
                                  <>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-slate-300 line-through font-bold">{trip.oldPrice}</span>
                                      <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">Save ₹400</span>
                                    </div>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{trip.price}</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting at</div>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{trip.price}</span>
                                  </>
                                )}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); if (trip.slug) { navigate(`/trips/${trip.slug}`) } else { scrollToSection('contact') } }}
                                className="btn-primary !py-3.5 !px-7 !text-xs !rounded-2xl"
                              >
                                View Details
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Photo Gallery ─────────────────────────────────── */}
            <section id="gallery" className="py-24 px-4 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl"></div>

              <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 px-5 py-2.5 rounded-full mb-6">
                    <Camera className="h-4 w-4 text-[#F97316]" />
                    <span className="text-[#ea6c00] text-sm font-bold">Photo Gallery</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                    <span className="bg-gradient-to-r from-[#082F49] to-[#F97316] bg-clip-text text-transparent">Moments We've Shared</span>
                  </h2>
                  <p className="text-xl text-gray-500 max-w-2xl mx-auto">Glimpses from our journey and the locations we explore.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
                    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',
                    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600',
                    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600',
                    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
                    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600',
                    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600',
                    'https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=600'
                  ].map((src, idx) => (
                    <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1">
                      <img
                        src={src}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-40 sm:h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-[#F97316] text-white px-3 py-1.5 rounded-lg text-sm font-bold inline-block">
                          Explore #{idx + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Traveler Voices (Coming Soon) ────────────────── */}
            <section className="py-24 px-4 bg-[#FFF7ED] relative overflow-hidden">
              <div className="max-w-7xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center space-x-2 bg-white border border-orange-100 px-5 py-2.5 rounded-full mb-6 shadow-sm">
                  <Star className="h-4 w-4 text-[#F97316]" />
                  <span className="text-[#ea6c00] text-sm font-bold">Traveler Voices</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">What Our Adventurers Say</h2>

                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-12 border border-white shadow-xl max-w-3xl mx-auto">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-10 w-10 text-[#F97316]" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">First Batch Reviews Coming Soon!</h3>
                  <p className="text-gray-500 text-lg leading-relaxed mb-8">
                    We are currently preparing for our very first group trip. Check back soon to see the photos and stories from our founding travelers!
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-6 w-6 text-gray-200 fill-gray-200" />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Blog ─────────────────────────────────────────── */}
            <section id="blog" className="py-24 px-4 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl"></div>

              <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 px-5 py-2.5 rounded-full mb-6">
                    <BookOpen className="h-4 w-4 text-[#F97316]" />
                    <span className="text-[#ea6c00] text-sm font-bold">Travel Blog</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                    <span className="bg-gradient-to-r from-[#082F49] to-orange-500 bg-clip-text text-transparent">Travel Stories</span>{' '}
                    <span className="text-gray-900">& Tips</span>
                  </h2>
                  <p className="text-xl text-gray-500 max-w-2xl mx-auto">Inspiration and advice for your next adventure.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {blogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 hover:-translate-y-3 border border-gray-100"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-[#F97316] text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                            {post.date}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-[#F97316] transition-colors leading-snug">{post.title}</h3>
                        <p className="text-gray-500 mb-6 leading-relaxed text-sm">{post.excerpt}</p>
                        <button className="group/btn flex items-center text-[#F97316] font-bold text-sm hover:text-[#ea6c00] transition-colors">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Contact & Booking ─────────────────────────────── */}

            {/* ── FAQs ─────────────────────────────────────────── */}
            <section className="section-padding px-4 bg-[#FFF7ED]">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">Common Questions</h2>
                  <p className="text-xl text-slate-500 font-medium">Everything you need to know before you join the pack.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { q: 'Can I join solo?', a: 'Absolutely! 80% of our travelers join solo. We curate groups of like-minded people so you\'ll never feel out of place.' },
                    { q: 'Is it safe for women?', a: 'Yes, safety is our top priority. We have dedicated trip coordinators and verified accommodations to ensure a secure environment.' },
                    { q: 'How do I pay?', a: 'No payment is needed right now. Once we confirm your spot, we\'ll share payment details via WhatsApp or Email.' },
                    { q: 'Are seats limited?', a: 'Yes — we keep batches intentionally small to ensure a high-quality, personal experience for everyone. Book early to secure your spot.' },
                  ].map((faq, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                    >
                      <h4 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-3">
                        <span className="w-8 h-8 bg-orange-100 text-[#F97316] rounded-xl flex items-center justify-center text-xs">Q</span>
                        {faq.q}
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium pl-11">{faq.a}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <section id="contact" className="section-padding px-4 bg-[#FFF7ED] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.07),transparent_50%)]"></div>

              <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center space-x-2 bg-white border border-orange-100 px-5 py-2.5 rounded-2xl mb-6 shadow-sm"
                  >
                    <Send className="h-4 w-4 text-[#F97316]" />
                    <span className="text-[#ea6c00] text-xs font-black uppercase tracking-widest">Book Your Trip</span>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-slate-900"
                  >
                    <span className="text-gradient">Start Your Adventure</span>
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-500 max-w-2xl mx-auto font-medium"
                  >
                    Ready to join us? Fill out the form below or reach out directly.
                  </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
                  {/* Form */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/10" style={{background:'#082F49'}}
                  >
                    {bookingSubmitted ? (
                      /* ── Success screen ── */
                      <div className="flex flex-col items-center justify-center text-center py-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-green-100 p-6 rounded-full mb-8 shadow-xl shadow-green-500/20"
                        >
                          <CheckCircle className="h-16 w-16 text-green-500" />
                        </motion.div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4">Request Sent! 🎉</h3>
                        <p className="text-slate-500 mb-10 text-lg leading-relaxed font-medium">
                          Your booking request has been received.<br />
                          We'll confirm your spot within <strong>24 hours</strong>.
                        </p>
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl px-8 py-6 mb-10 text-sm text-slate-600 font-bold w-full text-left space-y-3 shadow-inner">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                            Our team has been notified instantly
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                            We'll call or WhatsApp you to confirm
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                            No payment needed right now
                          </div>
                        </div>
                        <button
                          onClick={() => setBookingSubmitted(false)}
                          className="btn-secondary w-full !py-4"
                        >
                          Submit Another Request
                        </button>
                      </div>
                    ) : (
                      /* ── Booking form ── */
                      <>
                        <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Reservation Form</h3>
                        <form onSubmit={handleBookingSubmit} className="space-y-6">
                          <div className="space-y-2">
                            <label className="block text-white/50 font-black text-xs uppercase tracking-widest ml-1">Full Name</label>
                            <input
                              type="text"
                              required
                              value={bookingForm.name}
                              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-white/10 focus:border-[#F97316] outline-none font-bold text-white placeholder-white/25 transition-all"
                              style={{background:'rgba(255,255,255,0.08)'}}
                              placeholder="Your name"
                            />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                              <label className="block text-white/50 font-black text-xs uppercase tracking-widest ml-1">Email</label>
                              <input
                                type="email"
                                required
                                value={bookingForm.email}
                                onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-white/10 focus:border-[#F97316] outline-none font-bold text-white placeholder-white/25 transition-all"
                                style={{background:'rgba(255,255,255,0.08)'}}
                                placeholder="your@email.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-white/50 font-black text-xs uppercase tracking-widest ml-1">Phone</label>
                              <input
                                type="tel"
                                required
                                value={bookingForm.phone}
                                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-white/10 focus:border-[#F97316] outline-none font-bold text-white placeholder-white/25 transition-all"
                                style={{background:'rgba(255,255,255,0.08)'}}
                                placeholder="+91 88491 12126"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-white/60 font-black text-xs uppercase tracking-widest ml-1">Select Trip & Batch</label>
                            <div className="relative">
                              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                                {Object.keys(tripBatches).map(name => (
                                  <button
                                    key={name}
                                    type="button"
                                    onClick={() => { setSelectedTripName(name); setBookingForm({ ...bookingForm, trip: '' }) }}
                                    className={`shrink-0 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${selectedTripName === name
                                      ? 'border-[#F97316] text-white'
                                      : 'border-white/10 text-white/40 hover:border-white/30'
                                      }`}
                                    style={selectedTripName === name ? {background:'#F97316'} : {background:'rgba(255,255,255,0.07)'}}
                                  >
                                    {tripsData.find(t => t.name === name)?.emoji ?? ''} {name.split(',')[0]}
                                  </button>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => setTripDropdownOpen(!tripDropdownOpen)}
                                className={`w-full px-6 py-4 border-2 rounded-2xl text-left flex items-center justify-between transition-all outline-none ${tripDropdownOpen ? 'border-[#F97316]' : 'border-white/10 hover:border-white/30'}`}
                                style={{background:'rgba(255,255,255,0.07)'}}
                              >
                                {bookingForm.trip ? (
                                  <div>
                                    <div className="text-[10px] text-[#F97316] font-black uppercase tracking-widest mb-0.5">{selectedTripName}</div>
                                    <div className="text-white font-black text-sm">{bookingForm.trip.split('·')[1]?.trim()}</div>
                                  </div>
                                ) : (
                                  <span className="text-white/30 font-bold">Choose a batch...</span>
                                )}
                                <ChevronRight className={`h-5 w-5 text-white/30 transition-transform duration-500 ${tripDropdownOpen ? 'rotate-90' : ''}`} />
                              </button>

                              <AnimatePresence>
                                {tripDropdownOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute z-50 mt-3 w-full rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden border border-white/10"
                                    style={{background:'#0a3d5c'}}
                                  >
                                    <div className="px-6 py-3 border-b border-white/10">
                                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                                        {selectedTripName} Batches
                                      </span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                      {['June'].map(month => (
                                        <div key={month}>
                                          <div className="px-6 py-2 sticky top-0 z-10 border-b border-white/5" style={{background:'#0a3d5c'}}>
                                            <span className="text-[9px] font-black text-[#F97316] uppercase tracking-[0.3em]">{month}</span>
                                          </div>
                                          {tripBatches[selectedTripName].filter(b => b.month === month).map((batch) => {
                                            const val = `${batch.label} · ${batch.dates}`
                                            const selected = bookingForm.trip === val
                                            return (
                                              <button
                                                key={batch.label}
                                                type="button"
                                                onClick={() => { setBookingForm({ ...bookingForm, trip: `${selectedTripName} — ${val}` }); setTripDropdownOpen(false) }}
                                                className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${selected ? 'bg-[#F97316]/20' : 'hover:bg-white/5'}`}
                                              >
                                                <div>
                                                  <span className="text-[10px] font-black text-white/30 mr-3 uppercase tracking-tighter">{batch.label}</span>
                                                  <span className="text-sm font-black text-white">{batch.dates}</span>
                                                </div>
                                                {selected && <CheckCircle className="h-5 w-5 text-[#F97316] shrink-0" />}
                                              </button>
                                            )
                                          })}
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <input type="text" required value={bookingForm.trip} onChange={() => { }} className="sr-only" tabIndex={-1} />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-white/60 font-black text-xs uppercase tracking-widest ml-1">Number of Travelers</label>
                            <div className="flex gap-3">
                              {[1, 2, 3, 4, '5+'].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setBookingForm({ ...bookingForm, travelers: num === '5+' ? 5 : num })}
                                  className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${(num === '5+' ? bookingForm.travelers >= 5 : bookingForm.travelers === num)
                                      ? 'border-[#F97316] text-white'
                                      : 'border-white/10 text-white/40 hover:border-white/30'
                                    }`}
                                  style={(num === '5+' ? bookingForm.travelers >= 5 : bookingForm.travelers === num)
                                    ? {background:'#F97316'}
                                    : {background:'rgba(255,255,255,0.07)'}}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-white/60 font-black text-xs uppercase tracking-widest ml-1">Message (Optional)</label>
                            <textarea
                              rows="4"
                              value={bookingForm.message}
                              onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                              className="w-full px-6 py-4 border-2 border-white/10 rounded-2xl focus:border-[#F97316] transition-all outline-none font-bold text-white placeholder-white/30 resize-none"
                              style={{background:'rgba(255,255,255,0.07)'}}
                              placeholder="Any special requests or questions..."
                            ></textarea>
                          </div>
                          <button
                            type="submit"
                            disabled={bookingLoading}
                            className="w-full py-5 text-lg mt-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:shadow-2xl"
                            style={{background:'linear-gradient(135deg,#0F766E,#F97316)'}}
                          >
                            {bookingLoading ? (
                              <><span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full inline-block"></span> Sending...</>
                            ) : (
                              <><Send className="h-5 w-5" /> Send Booking Request</>
                            )}
                          </button>
                          {bookingError && (
                            <p className="text-sm text-red-400 text-center font-black uppercase tracking-wider">{bookingError}</p>
                          )}
                          <p className="text-xs text-white/30 text-center font-bold tracking-tight">No immediate payment · 24h confirmation guarantee</p>
                        </form>
                      </>
                    )}
                  </motion.div>

                  {/* Contact info */}
                  <div className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/10" style={{background:'#082F49'}}
                    >
                      <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Direct Support</h3>
                      <div className="space-y-4">
                        <a href={`tel:${site.phone}`} className="flex items-center transition p-6 rounded-[1.5rem] border-2 border-white/10 hover:border-[#F97316]/40 group" style={{background:'rgba(255,255,255,0.07)'}}>
                          <div className="p-4 rounded-2xl mr-6 group-hover:scale-110 transition-transform shadow-lg" style={{background:'#F97316'}}>
                            <Phone className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Call for Enquiry</div>
                            <div className="font-black text-base tracking-tight text-white">{site.phone}</div>
                          </div>
                        </a>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-white group hover:-translate-y-2 transition-all duration-500"
                      style={{background:'linear-gradient(135deg,#0F766E,#082F49)'}}
                    >
                      <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                        <Send className="h-6 w-6" /> WhatsApp Support
                      </h3>
                      <p className="mb-8 text-white/60 text-base font-medium leading-relaxed italic">"Get instant responses directly from the founders for any doubts or custom requests."</p>
                      <a
                        href={waLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-white px-8 py-4 rounded-2xl font-black text-sm hover:shadow-[0_15px_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105" style={{color:'#082F49'}}
                      >
                        Message Us Now <ArrowRight className="h-5 w-5 ml-3" />
                      </a>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-white overflow-hidden relative border border-white/10" style={{background:'#082F49'}}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16" style={{background:'rgba(249,115,22,0.15)'}}></div>
                      <h3 className="text-2xl font-black mb-4 tracking-tight relative z-10">Follow Our Journey</h3>
                      <p className="mb-8 text-white/40 text-base font-medium relative z-10">Join our community of 500+ explorers and stay updated.</p>
                      <div className="flex gap-4 relative z-10">
                        <a href="#" className="p-4 rounded-2xl hover:scale-110 transition-all shadow-lg group" style={{background:'#F97316'}}>
                          <Instagram className="h-6 w-6 group-hover:rotate-6 transition-transform" />
                        </a>
                        <a href="#" className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all hover:scale-110 group">
                          <Facebook className="h-6 w-6 group-hover:-rotate-6 transition-transform" />
                        </a>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Pre-Footer CTA ───────────────────────────────── */}
            <section className="bg-gradient-to-r from-[#082F49] via-[#0F766E] to-orange-500 py-16 px-4 animate-gradient-x relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                  Ready to Join the Pack?
                </h2>
                <p className="text-white/80 text-lg mb-8 font-medium">
                  Founding batch spots are filling fast. Reserve your seat — no payment needed now.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="bg-white text-[#082F49] px-10 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    Book My Spot <ArrowRight className="h-5 w-5" />
                  </button>
                  <a
                    href={waLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    💬 WhatsApp Us
                  </a>
                </div>
              </div>
            </section>

            {/* ── Footer ───────────────────────────────────────── */}
            <footer className="text-white py-16 px-4 border-t border-white/10" style={{background:'var(--primary)'}}>
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                  <div>
                    <div className="flex items-center mb-5">
                      <div className="p-2.5 rounded-xl shadow-md" style={{background:"#082F49"}}>
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <span className="ml-3 text-xl font-black text-white">{site.name}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-sm">Starting our journey in 2026 with a mission to create genuine group travel experiences. Be part of our founding story.</p>
                  </div>
                  <div>
                    <h4 className="font-black mb-5 text-white">Quick Links</h4>
                    <ul className="space-y-2.5 text-slate-400 text-sm">
                      {[['home', 'Home'], ['about', 'About'], ['trips', 'Trips'], ['gallery', 'Gallery'], ['contact', 'Contact']].map(([id, label]) => (
                        <li key={id}>
                          <button onClick={() => scrollToSection(id)} className="hover:text-orange-400 transition flex items-center">
                            <ChevronRight className="h-3.5 w-3.5 mr-1.5" />{label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-black mb-5 text-white">Policies</h4>
                    <ul className="space-y-2.5 text-slate-400 text-sm">
                      {[
                        ['cancellation', 'Cancellation Policy'],
                        ['refund', 'Refund Policy'],
                        ['terms', 'Terms & Conditions'],
                        ['privacy', 'Privacy Policy'],
                      ].map(([id, label]) => (
                        <li key={id}>
                          <button onClick={() => navigate(`/policies/${id}`)} className="hover:text-orange-400 transition flex items-center">
                            <ChevronRight className="h-3.5 w-3.5 mr-1.5" />{label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-black mb-5 text-white">Contact</h4>
                    <div className="space-y-3 text-slate-400 text-sm">
                      <a href={`tel:${site.phone}`} className="flex items-center hover:text-white transition"><Phone className="h-4 w-4 mr-2 text-orange-400" />{site.phone}</a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black mb-5 text-white">Follow Us</h4>
                    <div className="flex gap-3">
                      <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="bg-[#F97316] p-3 rounded-xl hover:bg-[#ea6c00] transition hover:scale-110 shadow-md">
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="bg-slate-700 p-3 rounded-xl hover:bg-slate-600 transition hover:scale-110">
                        <Facebook className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
                  <span>&copy; {site.year} {site.name}. All rights reserved. Made with{' '}
                    <Heart className="h-3.5 w-3.5 inline text-[#F97316] fill-orange-400" /> for adventurers.
                  </span>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {[['cancellation', 'Cancellation'], ['refund', 'Refund'], ['terms', 'Terms'], ['privacy', 'Privacy']].map(([id, label]) => (
                      <button key={id} onClick={() => navigate(`/policies/${id}`)} className="hover:text-orange-400 transition">
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </footer>
            {/* ── Floating WhatsApp Button ── */}
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-[100] group"
              aria-label="Chat on WhatsApp"
            >
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Questions? Chat with us!
              </div>

              {/* Pulse effect */}
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>

              {/* Button */}
              <div className="relative bg-[#25D366] hover:bg-[#20ba5a] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
            </a>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
