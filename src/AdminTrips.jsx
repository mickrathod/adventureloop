import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAllTrips } from './useTrips'
import { seedTrips } from './seedTrips'
import {
  RefreshCw, Eye, EyeOff, Edit2, Check, X,
  MapPin, Clock, IndianRupee, Users, Tag, Database, ChevronDown, ChevronUp, Plus, Trash2
} from 'lucide-react'

function Field({ label, value, onChange, type = 'text', textarea = false }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400"
        />
      )}
    </div>
  )
}

function ItineraryEditor({ itinerary, onChange }) {
  const updateDay = (di, field, val) => {
    const next = itinerary.map((day, i) => i === di ? { ...day, [field]: val } : day)
    onChange(next)
  }
  const updateItem = (di, ti, field, val) => {
    const next = itinerary.map((day, i) => i !== di ? day : {
      ...day,
      timeline: day.timeline.map((item, j) => j === ti ? { ...item, [field]: val } : item)
    })
    onChange(next)
  }
  const addItem = di => {
    const next = itinerary.map((day, i) => i !== di ? day : {
      ...day,
      timeline: [...day.timeline, { time: '', activity: '' }]
    })
    onChange(next)
  }
  const removeItem = (di, ti) => {
    const next = itinerary.map((day, i) => i !== di ? day : {
      ...day,
      timeline: day.timeline.filter((_, j) => j !== ti)
    })
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {itinerary.map((day, di) => (
        <div key={di} className="border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Day Label</label>
                <input value={day.day ?? ''} onChange={e => updateDay(di, 'day', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Day Title</label>
                <input value={day.label ?? ''} onChange={e => updateDay(di, 'label', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400" />
              </div>
            </div>
            <button onClick={() => onChange(itinerary.filter((_, i) => i !== di))}
              className="mt-5 text-slate-300 hover:text-red-400 transition shrink-0">
              <Trash2 size={15}/>
            </button>
          </div>
          <div className="space-y-2">
            {day.timeline?.map((item, ti) => (
              <div key={ti} className="flex gap-2 items-start">
                <input value={item.time ?? ''} onChange={e => updateItem(di, ti, 'time', e.target.value)}
                  placeholder="10:00 AM"
                  className="w-28 shrink-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-400" />
                <input value={item.activity ?? ''} onChange={e => updateItem(di, ti, 'activity', e.target.value)}
                  placeholder="Activity description"
                  className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-400" />
                <button onClick={() => removeItem(di, ti)} className="text-slate-300 hover:text-red-400 transition mt-1">
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
            <button onClick={() => addItem(di)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition mt-1">
              <Plus size={12}/> Add item
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...itinerary, {
          day: `Day ${itinerary.length + 1}`,
          label: 'New Day',
          iconKey: 'Sunrise',
          color: 'bg-coral-500',
          timeline: [{ time: '', activity: '' }]
        }])}
        className="flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-700 transition mt-2"
      >
        <Plus size={13}/> Add Day
      </button>
    </div>
  )
}

function TripRow({ trip, onSave, onToggleActive }) {
  const [editing, setEditing]       = useState(false)
  const [showMore, setShowMore]     = useState(false)
  const [showItinerary, setShowItin] = useState(false)
  const [saving, setSaving]         = useState(false)

  const data = trip.data || {}

  // flat columns
  const [flat, setFlat] = useState({
    name:        trip.name,
    tagline:     trip.tagline,
    location:    trip.location,
    dates:       trip.dates,
    duration:    trip.duration,
    price:       trip.price,
    old_price:   trip.old_price,
    spots_total: trip.spots_total,
    badge:       trip.badge,
    hero_image:  trip.hero_image,
    card_image:  trip.card_image,
  })

  // editable data fields
  const [d, setD] = useState({
    description:       data.description       ?? '',
    bookingCardQuote:  data.bookingCardQuote   ?? '',
    bookingCardBadge:  data.bookingCardBadge   ?? '',
    bookingCardSaveText: data.bookingCardSaveText ?? '',
    // bookingCardInfo items by label
    bi_duration:  data.bookingCardInfo?.find(x => x.label === 'Duration')?.value  ?? '',
    bi_travel:    data.bookingCardInfo?.find(x => x.label === 'Travel')?.value    ?? '',
    bi_seats:     data.bookingCardInfo?.find(x => x.label === 'Seats')?.value     ?? '',
    bi_pickup:    data.bookingCardInfo?.find(x => x.label === 'Pickup Cities')?.value ?? '',
    bi_status:    data.bookingCardInfo?.find(x => x.label === 'Status')?.value    ?? '',
  })

  const [itinerary, setItinerary] = useState(data.itinerary ?? [])

  const setF = key => val => setFlat(f => ({ ...f, [key]: val }))
  const setDk = key => val => setD(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    setSaving(true)

    // rebuild bookingCardInfo with updated values
    const existingInfo = data.bookingCardInfo || []
    const updatedInfo = existingInfo.map(item => {
      if (item.label === 'Duration')      return { ...item, value: d.bi_duration }
      if (item.label === 'Travel')        return { ...item, value: d.bi_travel }
      if (item.label === 'Seats')         return { ...item, value: d.bi_seats }
      if (item.label === 'Pickup Cities') return { ...item, value: d.bi_pickup }
      if (item.label === 'Status')        return { ...item, value: d.bi_status }
      return item
    })

    const newData = {
      ...data,
      description:       d.description,
      bookingCardQuote:  d.bookingCardQuote,
      bookingCardBadge:  d.bookingCardBadge,
      bookingCardSaveText: d.bookingCardSaveText,
      bookingCardInfo:   updatedInfo,
      itinerary,
    }

    await onSave(trip.id, { ...flat, data: newData })
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-5 transition ${trip.active ? 'border-slate-100' : 'border-slate-200 opacity-60'}`}>
      {!editing ? (
        <div className="flex items-start gap-4">
          <img src={trip.card_image} alt={trip.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-lg">{trip.emoji}</span>
              <h3 className="font-black text-slate-900 text-lg">{trip.name}</h3>
              {trip.badge && <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{trip.badge}</span>}
              {!trip.active && <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full">Hidden</span>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1"><MapPin size={13}/>{trip.location}</span>
              <span className="flex items-center gap-1"><Clock size={13}/>{trip.duration}</span>
              <span className="flex items-center gap-1"><IndianRupee size={13}/>₹{trip.price?.toLocaleString('en-IN')}{trip.old_price ? ` (was ₹${trip.old_price?.toLocaleString('en-IN')})` : ''}</span>
              <span className="flex items-center gap-1"><Users size={13}/>{trip.spots_total} spots</span>
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1"><Tag size={12}/>{trip.dates}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleActive(trip.id, !trip.active)}
              className={`p-2 rounded-xl border transition ${trip.active ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
              title={trip.active ? 'Hide trip' : 'Show trip'}
            >
              {trip.active ? <Eye size={16}/> : <EyeOff size={16}/>}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <Edit2 size={16}/>
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* ── Core fields ── */}
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Core Info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Name"           value={flat.name}        onChange={setF('name')} />
            <Field label="Location"       value={flat.location}    onChange={setF('location')} />
            <Field label="Tagline"        value={flat.tagline}     onChange={setF('tagline')} />
            <Field label="Dates"          value={flat.dates}       onChange={setF('dates')} />
            <Field label="Duration"       value={flat.duration}    onChange={setF('duration')} />
            <Field label="Badge"          value={flat.badge}       onChange={setF('badge')} />
            <Field label="Price (₹)"      value={flat.price}       onChange={setF('price')}     type="number" />
            <Field label="Old Price (₹)"  value={flat.old_price}   onChange={setF('old_price')} type="number" />
            <Field label="Total Spots"    value={flat.spots_total} onChange={setF('spots_total')} type="number" />
          </div>

          {/* ── Booking card fields ── */}
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 mt-2">Booking Card (what users see)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Card — Duration value"   value={d.bi_duration}        onChange={setDk('bi_duration')} />
            <Field label="Card — Travel value"     value={d.bi_travel}          onChange={setDk('bi_travel')} />
            <Field label="Card — Seats value"      value={d.bi_seats}           onChange={setDk('bi_seats')} />
            <Field label="Card — Pickup Cities"    value={d.bi_pickup}          onChange={setDk('bi_pickup')} />
            <Field label="Card — Status value"     value={d.bi_status}          onChange={setDk('bi_status')} />
            <Field label="Card Badge"              value={d.bookingCardBadge}   onChange={setDk('bookingCardBadge')} />
            <Field label="Card Save Text"          value={d.bookingCardSaveText} onChange={setDk('bookingCardSaveText')} />
            <div className="sm:col-span-2">
              <Field label="Card Quote"            value={d.bookingCardQuote}   onChange={setDk('bookingCardQuote')} />
            </div>
          </div>

          {/* ── More fields toggle ── */}
          <button
            onClick={() => setShowMore(m => !m)}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 mb-3 transition"
          >
            {showMore ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
            {showMore ? 'Hide' : 'Show'} images & description
          </button>

          {showMore && (
            <div className="grid grid-cols-1 gap-4 mb-4">
              <Field label="Description"    value={d.description}  onChange={setDk('description')} textarea />
              <Field label="Hero Image URL" value={flat.hero_image} onChange={setF('hero_image')} />
              <Field label="Card Image URL" value={flat.card_image} onChange={setF('card_image')} />
            </div>
          )}

          {/* ── Itinerary toggle ── */}
          <button
            onClick={() => setShowItin(s => !s)}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 mb-3 transition"
          >
            {showItinerary ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
            {showItinerary ? 'Hide' : 'Edit'} itinerary ({itinerary.length} days)
          </button>

          {showItinerary && (
            <div className="mb-4">
              <ItineraryEditor itinerary={itinerary} onChange={setItinerary} />
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1 bg-slate-900 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
              <Check size={14}/> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-1 border border-slate-200 text-slate-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition">
              <X size={14}/> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminTrips() {
  const navigate = useNavigate()
  const { trips, loading, refetch } = useAllTrips()
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)

  const handleSave = async (id, fields) => {
    const { data, ...flatFields } = fields
    await supabase.from('trips').update({ ...flatFields, data }).eq('id', id)
    await refetch()
  }

  const handleToggleActive = async (id, active) => {
    await supabase.from('trips').update({ active }).eq('id', id)
    await refetch()
  }

  const handleSeed = async () => {
    setSeeding(true)
    await seedTrips()
    await refetch()
    setSeeding(false)
    setSeedDone(true)
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Trips Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage trip listings · {trips.length} trips</p>
          </div>
          <div className="flex gap-2">
            {trips.length === 0 && (
              <button onClick={handleSeed} disabled={seeding || seedDone}
                className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-violet-700 transition shadow-sm disabled:opacity-50 text-sm">
                <Database size={15}/> {seeding ? 'Seeding…' : seedDone ? 'Seeded ✓' : 'Seed from code'}
              </button>
            )}
            <button onClick={refetch}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition shadow-sm text-sm">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''}/> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading trips…</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">No trips in Supabase yet.</p>
            <button onClick={handleSeed} disabled={seeding}
              className="flex items-center gap-2 bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition mx-auto">
              <Database size={16}/> {seeding ? 'Seeding…' : 'Seed trips from code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => (
              <TripRow key={trip.id} trip={trip} onSave={handleSave} onToggleActive={handleToggleActive} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
