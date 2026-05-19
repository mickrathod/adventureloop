import { useState, useMemo } from 'react'
import { site, getAdminPassword } from './siteConfig'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Calculator, Users, IndianRupee, TrendingUp, TrendingDown,
  Bus, Hotel, Utensils, Ticket, Package, Percent,
  ChevronDown, ChevronUp, Plus, Trash2, RotateCcw,
  CheckCircle, AlertCircle, Fuel, BedDouble, MessageCircle
} from 'lucide-react'

const CATEGORY_META = {
  transport:     { label: 'Transport',     color: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-600',   icon: Bus      },
  accommodation: { label: 'Accommodation', color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', icon: Hotel    },
  food:          { label: 'Food & Meals',  color: 'bg-amber-500',  light: 'bg-amber-50',  text: 'text-amber-600',  icon: Utensils },
  activities:    { label: 'Activities',    color: 'bg-teal-500',   light: 'bg-teal-50',   text: 'text-teal-600',   icon: Ticket   },
  misc:          { label: 'Miscellaneous', color: 'bg-slate-500',  light: 'bg-slate-50',  text: 'text-slate-600',  icon: Package  },
}

// Sharing labels
const SHARING_OPTIONS = [
  { value: 1, label: 'Single Occupancy', short: 'Single' },
  { value: 2, label: 'Twin Sharing',     short: 'Twin'   },
  { value: 3, label: 'Triple Sharing',   short: 'Triple' },
  { value: 4, label: 'Quad Sharing',     short: 'Quad'   },
]

let _id = 200

const DEFAULT_COSTS = [
  { id: 1,  category: 'transport',     label: 'Sleeper Train (Round Trip)',   amount: 1200, perPerson: true  },
  { id: 2,  category: 'food',          label: 'Meals (all included)',         amount: 900,  perPerson: true  },
  { id: 3,  category: 'activities',    label: 'Entry Fees & Activities',      amount: 500,  perPerson: true  },
  { id: 5,  category: 'misc',          label: 'Emergency Fund',               amount: 5000, perPerson: false },
  { id: 6,  category: 'misc',          label: 'Marketing & Misc',             amount: 3000, perPerson: false },
]

export default function AdminCalculator() {
  const navigate = useNavigate()
  // Core inputs
  const [travelers, setTravelers]     = useState(12)
  const [sellingPrice, setSellingPrice] = useState(8999)
  const [costs, setCosts]             = useState(DEFAULT_COSTS)
  const [newCost, setNewCost]         = useState({ label: '', amount: '', category: 'misc', perPerson: true })

  // ── Team members ─────────────────────────────────────────────────────────────
  const [teamMembers, setTeamMembers]           = useState(3)
  const [teamRoomSharing, setTeamRoomSharing]   = useState(3)   // all 3 in 1 room
  const [teamIncludePerPerson, setTeamIncludePerPerson] = useState(true) // meals, activities etc.
  const [teamPayAmount, setTeamPayAmount]       = useState(4000) // fixed amount each team member pays

  // ── Room sharing ────────────────────────────────────────────────────────────
  const [roomSharing, setRoomSharing]     = useState(2)        // persons per room
  const [roomCostPerNight, setRoomCostPerNight] = useState(2400) // full room cost per night
  const [nights, setNights]               = useState(3)

  // ── Scooty / petrol ─────────────────────────────────────────────────────────
  const [scootyEnabled, setScootyEnabled]           = useState(true)
  const [scootyRentPerDay, setScootyRentPerDay]     = useState(400)  // per scooty per day
  const [scootyDays, setScootyDays]                 = useState(3)
  const [travelersPerScooty, setTravelersPerScooty] = useState(2)    // how many share 1 scooty
  const [petrolLitersPerDay, setPetrolLitersPerDay] = useState(3)    // litres per scooty per day
  const [petrolPricePerLitre, setPetrolPricePerLitre] = useState(104) // ₹/litre

  // UI
  const [showBreakdown, setShowBreakdown]     = useState(true)
  const [showScenarios, setShowScenarios]     = useState(true)

  // ── Computed derived costs ───────────────────────────────────────────────────
  const roomCostPerPerson = useMemo(() => {
    // cost per room per night / persons sharing * nights
    return (roomCostPerNight / roomSharing) * nights
  }, [roomCostPerNight, roomSharing, nights])

  const totalRoomCost = useMemo(() => roomCostPerPerson * travelers, [roomCostPerPerson, travelers])

  const scootyCount = useMemo(() => Math.ceil(travelers / travelersPerScooty), [travelers, travelersPerScooty])

  const scootyCostTotal = useMemo(() => {
    if (!scootyEnabled) return 0
    return scootyRentPerDay * scootyDays * scootyCount
  }, [scootyEnabled, scootyRentPerDay, scootyDays, scootyCount])

  const petrolCostTotal = useMemo(() => {
    if (!scootyEnabled) return 0
    return petrolLitersPerDay * petrolPricePerLitre * scootyDays * scootyCount
  }, [scootyEnabled, petrolLitersPerDay, petrolPricePerLitre, scootyDays, scootyCount])

  const scootyPerPerson = useMemo(() => (scootyCostTotal + petrolCostTotal) / travelers, [scootyCostTotal, petrolCostTotal, travelers])

  // ── Team cost ────────────────────────────────────────────────────────────────
  const teamRoomCost = useMemo(() => {
    // 1 room shared by all team members, same nightly rate
    return roomCostPerNight * nights
  }, [roomCostPerNight, nights])

  const teamPerPersonCost = useMemo(() => {
    const perPersonCosts = costs.filter(c => c.perPerson).reduce((s, c) => s + Number(c.amount), 0)
    const mealAndActivity = teamIncludePerPerson ? perPersonCosts : 0
    return mealAndActivity
  }, [costs, teamIncludePerPerson])

  const teamTotalCost = useMemo(() => {
    return teamRoomCost + (teamPerPersonCost * teamMembers)
  }, [teamRoomCost, teamPerPersonCost, teamMembers])

  const teamCostPerMember = useMemo(() => teamMembers > 0 ? teamTotalCost / teamMembers : 0, [teamTotalCost, teamMembers])

  // ── Team contribution ────────────────────────────────────────────────────────
  const teamContribution = useMemo(() =>
    teamMembers * teamPayAmount
  , [teamMembers, teamPayAmount])

  // ── Main calc ───────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const totalRevenue = travelers * sellingPrice + teamContribution

    const perPersonCosts = costs.filter(c => c.perPerson).reduce((s, c) => s + Number(c.amount), 0)
    const fixedCosts     = costs.filter(c => !c.perPerson).reduce((s, c) => s + Number(c.amount), 0)

    // Add smart costs
    const totalPerPersonBase = perPersonCosts + roomCostPerPerson + (scootyEnabled ? scootyPerPerson : 0)
    const totalCostPerPerson = totalPerPersonBase + fixedCosts / travelers
    const totalCost = totalPerPersonBase * travelers + fixedCosts + teamTotalCost

    const profitTotal    = totalRevenue - totalCost
    const profitPerPerson = profitTotal / travelers
    const marginPct      = totalRevenue > 0 ? (profitTotal / totalRevenue) * 100 : 0
    const breakEven      = sellingPrice > totalPerPersonBase
      ? Math.ceil(fixedCosts / (sellingPrice - totalPerPersonBase))
      : Infinity

    // Category breakdown (manual costs only)
    const byCategory = {}
    for (const cat of Object.keys(CATEGORY_META)) {
      const catCosts = costs.filter(c => c.category === cat)
      const total = catCosts.reduce((s, c) => s + (c.perPerson ? Number(c.amount) * travelers : Number(c.amount)), 0)
      byCategory[cat] = total
    }
    byCategory['accommodation'] = (byCategory['accommodation'] || 0) + totalRoomCost
    byCategory['transport']     = (byCategory['transport']     || 0) + scootyCostTotal + petrolCostTotal

    return {
      totalRevenue, perPersonCosts, fixedCosts,
      totalCostPerPerson, totalCost,
      profitTotal, profitPerPerson, marginPct, breakEven,
      byCategory,
      totalPerPersonBase,
    }
  }, [travelers, sellingPrice, costs, roomCostPerPerson, totalRoomCost, scootyEnabled, scootyPerPerson, scootyCostTotal, petrolCostTotal, teamTotalCost, teamContribution])

  const addCost  = () => {
    if (!newCost.label || !newCost.amount) return
    setCosts(p => [...p, { ...newCost, id: ++_id, amount: Number(newCost.amount) }])
    setNewCost({ label: '', amount: '', category: 'misc', perPerson: true })
  }
  const removeCost = (id) => setCosts(p => p.filter(c => c.id !== id))
  const updateCost = (id, field, val) =>
    setCosts(p => p.map(c => c.id === id ? { ...c, [field]: field === 'amount' ? val : val } : c))

  const fmt  = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`
  const isProfit = calc.profitTotal >= 0

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-coral-500 rounded-xl flex items-center justify-center shrink-0">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="font-black text-lg tracking-tight">Trip Cost Calculator</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Admin · {site.name}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/templates')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl text-sm font-black transition-all">
              <MessageCircle className="h-4 w-4" /> Templates
            </button>
            <button
              onClick={() => { setCosts(DEFAULT_COSTS); setTravelers(12); setSellingPrice(8999); setRoomSharing(2); setRoomCostPerNight(2400); setNights(3); setScootyEnabled(true); setScootyRentPerDay(400); setScootyDays(3); setTravelersPerScooty(2); setPetrolLitersPerDay(3); setPetrolPricePerLitre(104); setTeamMembers(3); setTeamRoomSharing(3); setTeamIncludePerPerson(true); setTeamPayAmount(4000) }}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm font-black transition-all"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Row 1: Travelers + Selling Price ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> Travelers
            </label>
            <div className="flex items-center gap-3">
              <input type="number" min="1" max="50" value={travelers}
                onChange={e => setTravelers(Math.max(1, Number(e.target.value)))}
                className="w-full text-3xl font-black text-slate-900 bg-slate-50 rounded-xl px-4 py-3 outline-none border-2 border-transparent focus:border-coral-400"
              />
              <div className="flex flex-col gap-1">
                {[8, 10, 12, 15].map(n => (
                  <button key={n} onClick={() => setTravelers(n)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${travelers === n ? 'bg-coral-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-coral-50'}`}
                  >{n}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Selling Price / Person
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-400">₹</span>
              <input type="number" min="0" value={sellingPrice}
                onChange={e => setSellingPrice(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-black text-slate-900 bg-slate-50 rounded-xl px-4 py-3 outline-none border-2 border-transparent focus:border-coral-400"
              />
            </div>
            <div className="text-xs text-slate-400 font-bold mt-2">
              Total Revenue: <span className="text-slate-900 font-black">{fmt(calc.totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* ── Room Sharing Smart Panel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-purple-50">
            <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
              <BedDouble className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-black text-slate-900">Room Sharing</div>
              <div className="text-xs text-slate-500 font-medium">Auto-calculates cost per person based on sharing</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cost per person</div>
              <div className="text-xl font-black text-purple-600">{fmt(roomCostPerPerson)}</div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Sharing type */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sharing Type</label>
              <div className="grid grid-cols-2 gap-2">
                {SHARING_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setRoomSharing(opt.value)}
                    className={`py-3 px-3 rounded-xl text-xs font-black border-2 transition-all text-center ${roomSharing === opt.value ? 'bg-purple-500 border-purple-500 text-white shadow-md shadow-purple-500/20' : 'bg-white border-slate-200 text-slate-500 hover:border-purple-300'}`}
                  >
                    <div className="text-lg mb-0.5">{'🛏️'.repeat(opt.value > 2 ? 1 : opt.value)}</div>
                    {opt.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Room cost per night */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Room Cost / Night (full room)</label>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-purple-400">
                <span className="text-slate-400 font-bold">₹</span>
                <input type="number" min="0" value={roomCostPerNight}
                  onChange={e => setRoomCostPerNight(Number(e.target.value))}
                  className="w-full text-xl font-black text-slate-900 bg-transparent outline-none"
                />
              </div>
              <div className="text-xs text-slate-400 font-medium mt-2">
                Per person/night: <span className="font-black text-slate-700">{fmt(roomCostPerNight / roomSharing)}</span>
              </div>
            </div>

            {/* Nights */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Number of Nights</label>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setNights(n)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${nights === n ? 'bg-purple-500 border-purple-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-purple-300'}`}
                  >{n}</button>
                ))}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Total room cost: <span className="font-black text-slate-700">{fmt(totalRoomCost)}</span>
                <span className="text-slate-300 mx-1">·</span>
                Rooms needed: <span className="font-black text-slate-700">{Math.ceil(travelers / roomSharing)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Team Members Panel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-indigo-50">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-black text-slate-900">Team Members</div>
              <div className="text-xs text-slate-500 font-medium">Team cost is separate — not charged to travelers</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Team Total Cost</div>
              <div className="text-xl font-black text-indigo-600">₹{Math.round(teamTotalCost).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Number of team members */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Team Members</label>
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => { setTeamMembers(n); setTeamRoomSharing(n) }}
                    className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${teamMembers === n ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                  >{n}</button>
                ))}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Cost/member: <span className="font-black text-slate-700">₹{Math.round(teamCostPerMember).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Room — 1 room shared by all */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Team Room</label>
              <div className="bg-indigo-50 rounded-xl px-4 py-3 text-center border-2 border-indigo-200">
                <div className="text-sm font-black text-indigo-700">1 Room · {teamMembers}-sharing</div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  ₹{roomCostPerNight.toLocaleString('en-IN')}/night × {nights} nights
                </div>
                <div className="text-lg font-black text-indigo-600 mt-1">
                  = ₹{Math.round(teamRoomCost).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Per-person costs toggle */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Meals & Activities</label>
              <button onClick={() => setTeamIncludePerPerson(!teamIncludePerPerson)}
                className={`w-full py-3 px-4 rounded-xl font-black text-sm border-2 transition-all mb-2 ${teamIncludePerPerson ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                {teamIncludePerPerson ? '✓ Included' : 'Not Included'}
              </button>
              {teamIncludePerPerson && (
                <div className="text-xs text-slate-400 font-medium">
                  ₹{Math.round(teamPerPersonCost).toLocaleString('en-IN')}/member × {teamMembers} = <span className="font-black text-slate-700">₹{Math.round(teamPerPersonCost * teamMembers).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Team contribution amount */}
          <div className="px-6 pb-6">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Each Team Member Pays
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-indigo-400 flex-1">
                <span className="text-slate-400 font-bold">₹</span>
                <input type="number" min="0" value={teamPayAmount}
                  onChange={e => setTeamPayAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-black text-slate-900 bg-transparent outline-none"
                />
              </div>
              <div className="flex gap-2">
                {[0, 1500, 2000, 4000].map(n => (
                  <button key={n} onClick={() => setTeamPayAmount(n)}
                    className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all ${teamPayAmount === n ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                  >{n === 0 ? 'Free' : `₹${n.toLocaleString('en-IN')}`}</button>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-2">
              {teamMembers} members × ₹{teamPayAmount.toLocaleString('en-IN')} = <span className="font-black text-green-600">+₹{Math.round(teamContribution).toLocaleString('en-IN')} revenue</span>
            </div>
          </div>

          {/* Team cost summary row */}
          <div className="px-6 pb-5 grid grid-cols-3 gap-4">
            {[
              { label: 'Room Cost',     val: `₹${Math.round(teamRoomCost).toLocaleString('en-IN')}` },
              { label: 'Meals & More',  val: teamIncludePerPerson ? `₹${Math.round(teamPerPersonCost * teamMembers).toLocaleString('en-IN')}` : '—' },
              { label: 'Total Team',    val: `₹${Math.round(teamTotalCost).toLocaleString('en-IN')}` },
            ].map((s, i) => (
              <div key={i} className="bg-indigo-50 rounded-xl p-3 text-center">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-1">{s.label}</div>
                <div className="text-lg font-black text-slate-900">{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scooty & Petrol Smart Panel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-orange-50">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-base">🛵</span>
            </div>
            <div>
              <div className="font-black text-slate-900">Scooty & Petrol</div>
              <div className="text-xs text-slate-500 font-medium">Auto-splits across travelers</div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {scootyEnabled && (
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cost per person</div>
                  <div className="text-xl font-black text-orange-600">{fmt(scootyPerPerson)}</div>
                </div>
              )}
              <button onClick={() => setScootyEnabled(!scootyEnabled)}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all border-2 ${scootyEnabled ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
              >
                {scootyEnabled ? '✓ Included' : 'Off'}
              </button>
            </div>
          </div>

          {scootyEnabled && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Travelers per scooty */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Travelers per Scooty</label>
                <div className="flex gap-2 mb-2">
                  {[1, 2].map(n => (
                    <button key={n} onClick={() => setTravelersPerScooty(n)}
                      className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${travelersPerScooty === n ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-300'}`}
                    >
                      {n === 1 ? '1 person' : '2 persons'}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Scooties needed: <span className="font-black text-slate-700 text-sm">{scootyCount}</span>
                </div>
              </div>

              {/* Rent per scooty per day */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Rent / Scooty / Day</label>
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-orange-400 mb-2">
                  <span className="text-slate-400 font-bold">₹</span>
                  <input type="number" min="0" value={scootyRentPerDay}
                    onChange={e => setScootyRentPerDay(Number(e.target.value))}
                    className="w-full text-xl font-black text-slate-900 bg-transparent outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setScootyDays(n)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${scootyDays === n ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-300'}`}
                    >{n}d</button>
                  ))}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-2">
                  {scootyDays} day{scootyDays > 1 ? 's' : ''} · Total rent: <span className="font-black text-slate-700">{fmt(scootyCostTotal)}</span>
                </div>
              </div>

              {/* Petrol */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Fuel className="h-3.5 w-3.5" /> Petrol
                </label>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold mb-1">Litres / scooty / day</div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border-2 border-transparent focus-within:border-orange-400">
                      <input type="number" min="0" step="0.5" value={petrolLitersPerDay}
                        onChange={e => setPetrolLitersPerDay(Number(e.target.value))}
                        className="w-full text-lg font-black text-slate-900 bg-transparent outline-none"
                      />
                      <span className="text-slate-400 text-xs font-bold">L</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold mb-1">Price / litre</div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border-2 border-transparent focus-within:border-orange-400">
                      <span className="text-slate-400 font-bold">₹</span>
                      <input type="number" min="0" value={petrolPricePerLitre}
                        onChange={e => setPetrolPricePerLitre(Number(e.target.value))}
                        className="w-full text-lg font-black text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-2">
                  Total petrol: <span className="font-black text-slate-700">{fmt(petrolCostTotal)}</span>
                  <span className="text-slate-300 mx-1">·</span>
                  {fmt(petrolLitersPerDay * petrolPricePerLitre)}/scooty/day
                </div>
              </div>

            </div>
          )}

          {/* Scooty summary row */}
          {scootyEnabled && (
            <div className="px-6 pb-5 grid grid-cols-3 gap-4">
              {[
                { label: 'Scooties',       val: scootyCount                        },
                { label: 'Total Rent',     val: fmt(scootyCostTotal)               },
                { label: 'Total Petrol',   val: fmt(petrolCostTotal)               },
              ].map((s, i) => (
                <div key={i} className="bg-orange-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-black text-orange-400 uppercase tracking-wider mb-1">{s.label}</div>
                  <div className="text-lg font-black text-slate-900">{s.val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',   val: fmt(calc.totalRevenue),         sub: `${travelers} × ${fmt(sellingPrice)}`,      color: 'from-blue-500 to-blue-600',                                         icon: TrendingUp   },
            { label: 'Total Cost',      val: fmt(calc.totalCost),            sub: `${fmt(calc.totalCostPerPerson)} / person`,  color: 'from-slate-600 to-slate-800',                                       icon: Package      },
            { label: isProfit ? 'Net Profit' : 'Net Loss', val: fmt(Math.abs(calc.profitTotal)), sub: `${fmt(Math.abs(calc.profitPerPerson))} / person`, color: isProfit ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600', icon: isProfit ? TrendingUp : TrendingDown },
            { label: 'Profit Margin',   val: `${calc.marginPct.toFixed(1)}%`, sub: calc.breakEven === Infinity ? 'Increase price' : `Break-even: ${calc.breakEven} travelers`, color: isProfit ? 'from-coral-500 to-rose-600' : 'from-orange-500 to-red-500', icon: Percent },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-lg`}
            >
              <card.icon className="h-5 w-5 mb-3 opacity-70" />
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{card.label}</div>
              <div className="text-2xl sm:text-3xl font-black leading-none mb-1">{card.val}</div>
              <div className="text-xs opacity-60 font-bold">{card.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Health indicator ── */}
        <div className={`rounded-2xl p-5 flex items-start gap-4 border-2 ${isProfit && calc.marginPct >= 15 ? 'bg-green-50 border-green-200' : isProfit ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          {isProfit && calc.marginPct >= 15
            ? <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
            : <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          }
          <div>
            <div className="font-black text-slate-900 text-sm">
              {isProfit && calc.marginPct >= 20 ? '✅ Excellent margins — good to go!'
                : isProfit && calc.marginPct >= 10 ? '⚠️ Decent margins — consider reviewing costs'
                : isProfit ? '⚠️ Thin margins — reduce costs or raise price'
                : '❌ Loss-making — increase price or cut costs'}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {calc.breakEven === Infinity
                ? 'Selling price is too low to cover per-person costs. Raise the price first.'
                : `Need ${calc.breakEven} travelers to break even. You have ${travelers} → ${travelers >= calc.breakEven ? `${travelers - calc.breakEven} extra (profit zone ✅)` : `${calc.breakEven - travelers} short ❌`}`
              }
            </div>
          </div>
        </div>

        {/* ── Per-person cost breakdown ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 font-black text-slate-900 flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-coral-500" /> Per Person Cost Breakdown
          </div>
          <div className="divide-y divide-slate-50">
            {[
              ...costs.filter(c => c.perPerson).map(c => ({ label: c.label, amount: Number(c.amount), color: CATEGORY_META[c.category].color, light: CATEGORY_META[c.category].light, text: CATEGORY_META[c.category].text })),
              { label: `Hotel (${roomSharing}-sharing, ${nights} nights)`, amount: roomCostPerPerson, color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
              ...(scootyEnabled ? [{ label: `Scooty rent + petrol (${scootyCount} scooties, ${scootyDays}d)`, amount: scootyPerPerson, color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' }] : []),
              { label: `Fixed costs split across ${travelers} travelers`, amount: calc.fixedCosts / travelers, color: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                </div>
                <span className={`font-black text-sm ${item.text}`}>{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900">
              <span className="text-sm font-black text-white uppercase tracking-wider">Total Cost per Person</span>
              <span className="text-xl font-black text-white">{fmt(calc.totalCostPerPerson)}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-green-50">
              <span className="text-sm font-black text-green-700 uppercase tracking-wider">Profit per Person</span>
              <span className={`text-xl font-black ${isProfit ? 'text-green-600' : 'text-red-500'}`}>{fmt(calc.profitPerPerson)}</span>
            </div>
          </div>
        </div>

        {/* ── Other cost items ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
            <div className="font-black text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-coral-500" /> Other Cost Items
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{costs.length}</span>
            </div>
            {showBreakdown ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          <AnimatePresence>
            {showBreakdown && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2 text-center">Type</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                <div className="divide-y divide-slate-50">
                  {costs.map(cost => {
                    const meta = CATEGORY_META[cost.category]
                    const Icon = meta.icon
                    const impact = cost.perPerson ? Number(cost.amount) * travelers : Number(cost.amount)
                    return (
                      <div key={cost.id} className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-slate-50 group">
                        <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                          <div className={`${meta.light} w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}>
                            <Icon className={`h-3.5 w-3.5 ${meta.text}`} />
                          </div>
                          <input value={cost.label} onChange={e => updateCost(cost.id, 'label', e.target.value)}
                            className="font-bold text-sm text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-coral-400 w-full" />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <select value={cost.category} onChange={e => updateCost(cost.id, 'category', e.target.value)}
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${meta.light} ${meta.text}`}>
                            {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </div>
                        <div className="col-span-4 sm:col-span-2 flex justify-center">
                          <button onClick={() => updateCost(cost.id, 'perPerson', !cost.perPerson)}
                            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${cost.perPerson ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                            {cost.perPerson ? '👤 /person' : '📦 fixed'}
                          </button>
                        </div>
                        <div className="col-span-3 sm:col-span-2 flex justify-end">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-sm font-bold">₹</span>
                            <input type="number" min="0" value={cost.amount}
                              onChange={e => updateCost(cost.id, 'amount', e.target.value)}
                              className="w-24 text-right font-black text-slate-900 bg-slate-50 rounded-lg px-2 py-1 outline-none border-2 border-transparent focus:border-coral-400 text-sm" />
                          </div>
                        </div>
                        <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-2">
                          <span className="text-sm font-black text-slate-600 hidden sm:block">{fmt(impact)}</span>
                          <button onClick={() => removeCost(cost.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add new */}
                <div className="p-5 border-t border-slate-100 bg-slate-50">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">+ Add Cost Item</div>
                  <div className="flex flex-wrap gap-3">
                    <input placeholder="Description" value={newCost.label}
                      onChange={e => setNewCost({ ...newCost, label: e.target.value })}
                      className="flex-1 min-w-[150px] px-4 py-3 bg-white rounded-xl border-2 border-slate-100 outline-none focus:border-coral-400 font-bold text-sm text-slate-900" />
                    <input type="number" placeholder="₹ Amount" value={newCost.amount}
                      onChange={e => setNewCost({ ...newCost, amount: e.target.value })}
                      className="w-32 px-4 py-3 bg-white rounded-xl border-2 border-slate-100 outline-none focus:border-coral-400 font-bold text-sm text-slate-900" />
                    <select value={newCost.category} onChange={e => setNewCost({ ...newCost, category: e.target.value })}
                      className="px-4 py-3 bg-white rounded-xl border-2 border-slate-100 outline-none font-bold text-sm text-slate-900">
                      {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button onClick={() => setNewCost({ ...newCost, perPerson: !newCost.perPerson })}
                      className={`px-4 py-3 rounded-xl border-2 font-black text-xs transition-all ${newCost.perPerson ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                      {newCost.perPerson ? '👤 Per Person' : '📦 Fixed'}
                    </button>
                    <button onClick={addCost}
                      className="flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white px-5 py-3 rounded-xl font-black text-sm transition-all">
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── What-If Scenarios ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button onClick={() => setShowScenarios(!showScenarios)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
            <div className="font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" /> What-If Scenarios
            </div>
            {showScenarios ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          <AnimatePresence>
            {showScenarios && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-100">
                        {['Travelers', 'Revenue', 'Total Cost', 'Profit', 'Margin', '/ Person Profit'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[6, 8, 10, 12, 15].map(n => {
                        const roomsNeeded = Math.ceil(n / roomSharing)
                        const scootsNeeded = scootyEnabled ? Math.ceil(n / travelersPerScooty) : 0
                        const scootyTotal = scootyEnabled ? (scootyRentPerDay * scootyDays + petrolLitersPerDay * petrolPricePerLitre * scootyDays) * scootsNeeded : 0
                        const roomTotal = (roomCostPerNight / roomSharing) * nights * n
                        const perP = costs.filter(c => c.perPerson).reduce((s, c) => s + Number(c.amount), 0)
                        const fixed = costs.filter(c => !c.perPerson).reduce((s, c) => s + Number(c.amount), 0)
                        const cost = perP * n + roomTotal + scootyTotal + fixed
                        const rev = n * sellingPrice
                        const profit = rev - cost
                        const margin = rev > 0 ? (profit / rev) * 100 : 0
                        const isRow = n === travelers
                        return (
                          <tr key={n} onClick={() => setTravelers(n)}
                            className={`cursor-pointer transition-colors ${isRow ? 'bg-coral-50 border-l-4 border-coral-500' : 'hover:bg-slate-50'}`}>
                            <td className="px-5 py-4 font-black text-slate-900">
                              {n} {isRow && <span className="text-[10px] bg-coral-500 text-white px-2 py-0.5 rounded-full ml-1">now</span>}
                            </td>
                            <td className="px-5 py-4 font-bold text-slate-700">{fmt(rev)}</td>
                            <td className="px-5 py-4 font-bold text-slate-700">{fmt(cost)}</td>
                            <td className={`px-5 py-4 font-black ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>{fmt(profit)}</td>
                            <td className={`px-5 py-4 font-black ${margin >= 15 ? 'text-green-600' : margin >= 0 ? 'text-amber-600' : 'text-red-500'}`}>{margin.toFixed(1)}%</td>
                            <td className={`px-5 py-4 font-black ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>{fmt(profit / n)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Final summary ── */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Final Trip Summary</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Travelers',          val: travelers                   },
              { label: 'Selling Price',       val: fmt(sellingPrice)          },
              { label: 'Total Revenue',       val: fmt(calc.totalRevenue)     },
              { label: 'Room Sharing',        val: `${roomSharing}-sharing`   },
              { label: 'Cost / Person',       val: fmt(calc.totalCostPerPerson) },
              { label: isProfit ? 'Net Profit' : 'Net Loss', val: fmt(Math.abs(calc.profitTotal)) },
                  { label: 'Team Members',        val: teamMembers                },
              { label: 'Team Contribution',   val: fmt(teamContribution)      },
              { label: 'Total Team Cost',     val: fmt(teamTotalCost)         },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</div>
                <div className="text-xl sm:text-2xl font-black text-white">{item.val}</div>
              </div>
            ))}
          </div>
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-sm ${isProfit ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {isProfit ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {isProfit
              ? `Profit ${fmt(calc.profitTotal)} · ${calc.marginPct.toFixed(1)}% margin · ${fmt(calc.profitPerPerson)}/person`
              : `Loss of ${fmt(Math.abs(calc.profitTotal))} — not viable at current settings`
            }
          </div>
        </div>

      </div>
    </div>
  )
}
