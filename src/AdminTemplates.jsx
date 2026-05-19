import { useState } from 'react'
import { site } from './siteConfig'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle, Copy, Check, ChevronDown, ChevronUp,
  Calculator, Send, Phone, Calendar, IndianRupee,
  AlertCircle, Star, MapPin, Clock, Users
} from 'lucide-react'

const TRIP = {
  name: 'Goa Trip',
  dates: 'Wed 11 Jun → Sat 14 Jun 2026',
  duration: '3 Nights · 4 Days',
  price: '₹8,999',
  oldPrice: '₹9,999',
  meetingPoint: 'Ahmedabad / Surat (confirmed on WhatsApp)',
  coordinator: 'Your coordinator',
  upiId: site.upiId,
  phone: site.phone,
}

const TEMPLATES = [
  {
    id: 1,
    category: 'Booking',
    icon: Check,
    color: 'bg-green-500',
    light: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    title: 'Booking Confirmed',
    desc: 'Send after confirming a traveler\'s spot',
    variables: ['Name'],
    message: (v) => `Hey ${v.Name || '[Name]'} 👋

Your spot for the *${TRIP.name}* is *CONFIRMED* 🎉

Here are your trip details:
📅 *Dates:* ${TRIP.dates}
⏱ *Duration:* ${TRIP.duration}
💰 *Price:* ${TRIP.price} per person
📍 *Pickup:* ${TRIP.meetingPoint}

*Next steps:*
1️⃣ Pay the booking amount to confirm your seat
2️⃣ You'll be added to the trip WhatsApp group
3️⃣ Full itinerary + packing list shared 48hrs before

Payment details below 👇
*UPI:* ${TRIP.upiId}

Any questions? Just reply here. Super excited to travel with you! 🚀

— Team ${site.name}`,
  },
  {
    id: 2,
    category: 'Payment',
    icon: IndianRupee,
    color: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    title: 'Payment Due Reminder',
    desc: 'Send when payment hasn\'t come in yet',
    variables: ['Name', 'Amount', 'Deadline'],
    message: (v) => `Hey ${v.Name || '[Name]'} 👋

Just a friendly reminder — your payment of *${v.Amount || '₹8,999'}* for the *${TRIP.name}* is due by *${v.Deadline || '[date]'}*.

Your spot is reserved but will be released if payment isn't received by then.

*Pay here:*
💳 UPI: ${TRIP.upiId}

After payment, please send the screenshot here and we'll confirm immediately ✅

Need any help? Just reply! 😊

— Team ${site.name}`,
  },
  {
    id: 3,
    category: 'Payment',
    icon: Check,
    color: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    title: 'Payment Received',
    desc: 'Send immediately after payment comes in',
    variables: ['Name'],
    message: (v) => `Hey ${v.Name || '[Name]'} 🙌

*Payment received — you're officially in!* 🎉

✅ Booking: Confirmed
✅ Payment: Received
✅ Trip: ${TRIP.name} · ${TRIP.dates}

You'll be added to the *trip WhatsApp group* shortly where you'll get:
📋 Full itinerary
🎒 Packing list
📍 Exact pickup location & time
👥 Meet your fellow travelers

Can't wait to see you on the trip! If you have any questions before then, I'm right here 🤙

— Team ${site.name}`,
  },
  {
    id: 4,
    category: 'Reminder',
    icon: Clock,
    color: 'bg-amber-500',
    light: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    title: '1 Week Before Trip',
    desc: 'Send 7 days before departure',
    variables: ['Name'],
    message: (v) => `Hey ${v.Name || '[Name]'} 🌴

*One week to go!* The ${TRIP.name} is almost here 🔥

📅 *Departure:* ${TRIP.dates}
📍 *Pickup:* Details will be confirmed in 48 hours

*Quick checklist for you:*
🪪 Government ID (Aadhaar / Passport)
👙 Swimwear + light clothes
🧴 Sunscreen & sunglasses
👟 Comfortable footwear
💊 Personal medicines
🔋 Power bank
💵 Some cash for personal spends

Any questions or concerns — drop them here anytime 🙌

See you soon! 🚀

— Team ${site.name}`,
  },
  {
    id: 5,
    category: 'Reminder',
    icon: MapPin,
    color: 'bg-rose-500',
    light: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    title: '48 Hours Before — Pickup Details',
    desc: 'Send 2 days before with exact pickup info',
    variables: ['Name', 'PickupLocation', 'PickupTime'],
    message: (v) => `Hey ${v.Name || '[Name]'} 🗺️

*Your trip starts in 48 hours!* Here are your final pickup details:

📍 *Meeting Point:* ${v.PickupLocation || '[Pickup Location]'}
⏰ *Time:* ${v.PickupTime || '[Time]'}
📅 *Date:* ${TRIP.dates.split('→')[0].trim()}

*Please be on time* — the vehicle will depart as scheduled.

What to carry tomorrow:
✅ Government ID
✅ Fully charged phone + power bank
✅ Cash for personal expenses
✅ Light luggage only (one bag preferred)

Your coordinator *${TRIP.coordinator}* will be there to receive you.

See you very soon! 🎉

— Team ${site.name}`,
  },
  {
    id: 6,
    category: 'Reminder',
    icon: Calendar,
    color: 'bg-purple-500',
    light: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    title: 'Day Before — Final Reminder',
    desc: 'Send the evening before departure',
    variables: ['Name', 'PickupTime'],
    message: (v) => `Hey ${v.Name || '[Name]'} 🌟

*Tomorrow is the day!* 🎉

⏰ Pickup tomorrow at *${v.PickupTime || '[Time]'}*
🗺️ Check the group for exact location pin

*Last minute checklist:*
🎒 Bag packed?
🪪 ID ready?
🔋 Devices charged?
💵 Cash in wallet?

Sleep well tonight — tomorrow is going to be *amazing* ✨

Any last-minute questions? Reply right here!

— Team ${site.name} 🚀`,
  },
  {
    id: 7,
    category: 'Enquiry',
    icon: MessageCircle,
    color: 'bg-teal-500',
    light: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    title: 'Reply to Enquiry',
    desc: 'First response when someone asks about the trip',
    variables: ['Name'],
    message: (v) => `Hey ${v.Name || 'there'} 👋

Thanks for your interest in the *${TRIP.name}*! 🌴

Here's a quick overview:

📅 *Dates:* ${TRIP.dates}
⏱ *Duration:* ${TRIP.duration}
💰 *Price:* ${TRIP.price}/person ~~${TRIP.oldPrice}~~ (early bird!)
🔥 *Seats:* Limited — book early to secure yours
🛵 *Scooty included!* Explore Goa on your own terms

*What's included:*
✅ Sleeper train (round trip)
✅ 3-night hotel stay
✅ All meals
✅ Scooty + petrol
✅ Travel coordinator throughout

*No payment needed right now* — just fill the booking form and we'll confirm your spot within 24 hours.

Want me to reserve a spot for you? 😊

— Team ${site.name}`,
  },
  {
    id: 8,
    category: 'Enquiry',
    icon: Users,
    color: 'bg-indigo-500',
    light: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    title: 'Solo Traveler Reassurance',
    desc: 'When someone asks if they can join alone',
    variables: ['Name'],
    message: (v) => `Hey ${v.Name || 'there'} 👋

Absolutely, solo travelers are *most welcome* — in fact, that's most of our group! 😄

Here's what makes it easy:
👫 *Limited seats* so you're never lost in a crowd
🎮 *Ice-breaking activities* on Day 1 so no awkward silences
🛵 *Scooty freedom* — explore at your own pace too
👩 *Safe environment* — we pay special attention to solo & women travelers
📞 *Coordinator with you* throughout the trip

You'll arrive as a solo traveler and leave with a group of friends — that's the ${site.name} promise 🤝

Want to grab a spot? Reply here or fill the booking form!

— Team ${site.name}`,
  },
  {
    id: 9,
    category: 'Post-Trip',
    icon: Star,
    color: 'bg-yellow-500',
    light: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    title: 'Post-Trip Review Request',
    desc: 'Send 1–2 days after the trip ends',
    variables: ['Name'],
    message: (v) => `Hey ${v.Name || '[Name]'} 🌟

Hope you made it back safely and are already missing Goa 😄

It was an absolute pleasure having you on the trip! We put a lot of heart into it and would *love* to hear your feedback.

Could you take 2 minutes to share your experience? It truly means the world to us as a new team 🙏

*What we'd love to know:*
⭐ How was the overall experience?
🏨 How was the stay?
🛵 Did you enjoy the scooty freedom?
💬 What can we do better?

Feel free to reply here or drop a Google review if you're feeling generous! 😊

And if you'd like to join our next trip — we'll have special returning traveler prices 👀

Thank you for being part of our founding batch! 🚀

— Team ${site.name}`,
  },
  {
    id: 10,
    category: 'Post-Trip',
    icon: AlertCircle,
    color: 'bg-slate-500',
    light: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    title: 'Cancellation Response',
    desc: 'When a traveler needs to cancel',
    variables: ['Name'],
    message: (v) => `Hey ${v.Name || '[Name]'} 👋

Really sorry to hear you can't make it 😔 We completely understand that plans change.

Here's what happens next based on our cancellation policy:

*If cancellation is 15+ days before:* Full refund ✅
*If 7–14 days before:* 50% refund
*If less than 7 days:* No refund (costs already committed)

Please check our full policy at: adventureloop.in/policies/cancellation

If your plans change and you want to join a *future batch*, we'll give you priority booking 🙌

Let us know if you need anything else — we're always here!

— Team ${site.name}`,
  },
]

const CATEGORIES = ['All', 'Booking', 'Payment', 'Reminder', 'Enquiry', 'Post-Trip']

export default function AdminTemplates() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [variables, setVariables] = useState({})

  const filtered = activeCategory === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === activeCategory)

  const handleCopy = (template) => {
    const vars = variables[template.id] || {}
    const text = template.message(vars)
    navigator.clipboard.writeText(text)
    setCopiedId(template.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const setVar = (templateId, key, val) => {
    setVariables(prev => ({
      ...prev,
      [templateId]: { ...(prev[templateId] || {}), [key]: val }
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-black text-lg tracking-tight">WhatsApp Templates</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Admin · {site.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold">{TEMPLATES.length} templates</span>
            <button onClick={() => navigate('/admin/calculator')}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-xs font-black transition-all">
              <Calculator className="h-3.5 w-3.5" /> Calculator
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* How to use */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex gap-3">
          <Send className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-green-800 text-sm mb-1">How to use</div>
            <div className="text-green-700 text-xs font-medium leading-relaxed">
              Fill in the variable fields (name, amount, etc.) → Click <strong>Copy</strong> → Paste directly into WhatsApp. Messages are pre-formatted with bold (*text*) that WhatsApp renders correctly.
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${activeCategory === cat ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
            >
              {cat}
              <span className="ml-1.5 opacity-60">
                {cat === 'All' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Templates */}
        <div className="space-y-3">
          {filtered.map(template => {
            const Icon = template.icon
            const isExpanded = expandedId === template.id
            const isCopied = copiedId === template.id
            const vars = variables[template.id] || {}
            const previewText = template.message(vars)

            return (
              <motion.div key={template.id} layout
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${isExpanded ? template.border : 'border-slate-100'}`}
              >
                {/* Header row */}
                <button onClick={() => setExpandedId(isExpanded ? null : template.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 ${template.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">{template.title}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${template.light} ${template.text}`}>
                        {template.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">{template.desc}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); handleCopy(template) }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${isCopied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
                    >
                      {isCopied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                    </button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">

                        {/* Variable inputs */}
                        {template.variables.length > 0 && (
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fill in Details</div>
                            <div className="flex flex-wrap gap-3">
                              {template.variables.map(varName => (
                                <div key={varName} className="flex-1 min-w-[140px]">
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{varName}</label>
                                  <input
                                    value={vars[varName] || ''}
                                    onChange={e => setVar(template.id, varName, e.target.value)}
                                    placeholder={varName}
                                    className={`w-full px-3 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:border-current text-sm font-bold text-slate-900 ${template.text}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message preview */}
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview</div>
                          <div className="bg-[#e5ddd5] rounded-2xl p-4 relative">
                            {/* WhatsApp bubble */}
                            <div className="bg-white rounded-xl rounded-tl-none p-4 shadow-sm max-w-sm">
                              <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed">{previewText}</pre>
                              <div className="text-[10px] text-slate-400 text-right mt-2 font-medium">
                                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ✓✓
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Copy button at bottom */}
                        <button
                          onClick={() => handleCopy(template)}
                          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all ${isCopied ? 'bg-green-500 text-white' : `${template.color} text-white hover:opacity-90`}`}
                        >
                          {isCopied ? <><Check className="h-4 w-4" /> Copied to clipboard!</> : <><Copy className="h-4 w-4" /> Copy Message</>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
