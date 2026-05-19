import { ArrowLeft, AlertCircle, RefreshCw, FileText, Lock, ChevronRight } from 'lucide-react'
import { site, waLink } from './siteConfig'

const N = site.name

const sections = [
  {
    id: 'cancellation',
    icon: <AlertCircle className="h-6 w-6" />,
    color: 'bg-red-500',
    lightColor: 'bg-red-50 border-red-100',
    textColor: 'text-red-600',
    title: 'Cancellation Policy',
    content: [
      {
        heading: 'Cancellation by Traveler',
        points: [
          '30+ days before trip: Full refund minus ₹200 processing fee.',
          '15–29 days before trip: 50% refund of the total amount paid.',
          '7–14 days before trip: 25% refund of the total amount paid.',
          'Less than 7 days before trip: No refund. Amount forfeited.',
          'No-show on departure day: No refund.',
        ]
      },
      {
        heading: `Cancellation by ${N}`,
        points: [
          'If we cancel due to insufficient group size (less than 6 confirmed travelers), you will receive a full refund within 5–7 business days.',
          'If we cancel due to natural disasters, government restrictions, or force majeure events, a full refund or trip credit will be offered.',
          'We reserve the right to cancel any trip at our discretion with a full refund to all participants.',
        ]
      },
      {
        heading: 'How to Cancel',
        points: [
          'Send a cancellation request via WhatsApp with your booking reference.',
          'Cancellations are only valid once confirmed by our team via WhatsApp.',
          'Verbal or WhatsApp cancellations are not accepted as official cancellations.',
        ]
      }
    ]
  },
  {
    id: 'refund',
    icon: <RefreshCw className="h-6 w-6" />,
    color: 'bg-green-500',
    lightColor: 'bg-green-50 border-green-100',
    textColor: 'text-green-600',
    title: 'Refund Policy',
    content: [
      {
        heading: 'Refund Processing',
        points: [
          'Approved refunds are processed within 5–7 business days.',
          'Refunds are credited to the original payment method used at the time of booking.',
          'Bank transfer refunds may take an additional 2–3 business days depending on your bank.',
          'Processing fees (if any) are non-refundable.',
        ]
      },
      {
        heading: 'Partial Refunds',
        points: [
          'Partial refunds apply when cancellation is made within the 15–29 day or 7–14 day window.',
          'If you have paid a partial advance, refund eligibility is calculated on the total trip cost, not just the amount paid.',
        ]
      },
      {
        heading: 'Non-Refundable Items',
        points: [
          'Booking/processing fees are non-refundable under any circumstance.',
          'Any third-party bookings made on your behalf (special hotel upgrades, activity add-ons) are non-refundable once confirmed.',
          'Travel insurance premiums, if purchased through us, are non-refundable.',
        ]
      }
    ]
  },
  {
    id: 'terms',
    icon: <FileText className="h-6 w-6" />,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 border-blue-100',
    textColor: 'text-blue-600',
    title: 'Terms & Conditions',
    content: [
      {
        heading: 'Booking & Payment',
        points: [
          `A booking is confirmed only after receipt of the advance payment and written confirmation from ${N}.`,
          'Full payment must be completed at least 7 days before the trip departure date.',
          'Prices are per person and inclusive of all items listed under "What\'s Included" on the trip page.',
          `${N} reserves the right to revise prices due to unforeseen cost increases, with prior notice to confirmed travelers.`,
        ]
      },
      {
        heading: 'Traveler Responsibilities',
        points: [
          'Travelers must carry a valid government-issued photo ID at all times during the trip.',
          'Travelers are responsible for their own travel insurance. We strongly recommend purchasing one.',
          'Any medical conditions, dietary restrictions, or special needs must be disclosed at the time of booking.',
          'Travelers must follow the instructions of the trip coordinator and local guides at all times.',
          `Consumption of alcohol is at the traveler's own discretion and risk. ${N} is not liable for any incidents arising from alcohol consumption.`,
        ]
      },
      {
        heading: 'Itinerary Changes',
        points: [
          `${N} reserves the right to modify the itinerary due to weather, safety concerns, or operational reasons.`,
          'Alternate arrangements of equal or better value will be provided wherever possible.',
          'No refund will be issued for itinerary changes caused by factors beyond our control.',
        ]
      },
      {
        heading: 'Liability',
        points: [
          `${N} acts as an organizer and is not liable for personal injury, loss, or damage to property during the trip.`,
          'We are not responsible for delays, cancellations, or changes caused by third-party service providers (hotels, transport operators, etc.).',
          'Participation in adventure activities (water sports, trekking, etc.) is at the traveler\'s own risk.',
        ]
      },
      {
        heading: 'Code of Conduct',
        points: [
          'Travelers are expected to behave respectfully towards fellow travelers, guides, and locals.',
          'Any traveler found engaging in illegal activity, harassment, or disruptive behavior will be removed from the trip without refund.',
          'Damage to property (hotel, vehicle, etc.) caused by a traveler will be charged to that individual.',
        ]
      }
    ]
  },
  {
    id: 'privacy',
    icon: <Lock className="h-6 w-6" />,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50 border-purple-100',
    textColor: 'text-purple-600',
    title: 'Privacy Policy',
    content: [
      {
        heading: 'Information We Collect',
        points: [
          'Name, email address, phone number, and travel preferences provided during booking.',
          'Payment information (processed securely — we do not store card details).',
          'Usage data when you browse our website (pages visited, time spent, device type).',
        ]
      },
      {
        heading: 'How We Use Your Information',
        points: [
          'To process your booking and send trip-related communications.',
          'To send updates about upcoming trips, offers, and travel tips (you can unsubscribe anytime).',
          'To improve our website and services based on usage patterns.',
          'We never sell or share your personal data with third parties for marketing purposes.',
        ]
      },
      {
        heading: 'Data Security',
        points: [
          'All data is stored securely and access is restricted to authorized personnel only.',
          'We use industry-standard encryption for all data transmissions.',
          'You may request deletion of your personal data at any time by contacting us on WhatsApp.',
        ]
      },
      {
        heading: 'Cookies',
        points: [
          'Our website uses cookies to enhance your browsing experience.',
          'You can disable cookies in your browser settings, though some features may not function correctly.',
        ]
      }
    ]
  }
]

export default function PoliciesPage({ onBack, activePolicy }) {
  const active = sections.find(s => s.id === activePolicy) || sections[0]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Policies & Terms</h1>
          <p className="text-slate-400 text-sm">Last updated: May {site.year} · {site.name}</p>
        </div>

        {/* Tab nav */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                  active.id === s.id
                    ? 'border-coral-400 text-coral-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {sections.map(section => (
          <div key={section.id} id={section.id} className="scroll-mt-8">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`${section.color} text-white p-3 rounded-2xl shadow-md`}>
                {section.icon}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">{section.title}</h2>
            </div>

            {/* Sub-sections */}
            <div className="space-y-6">
              {section.content.map((sub, si) => (
                <div key={si} className={`rounded-2xl border p-6 ${section.lightColor}`}>
                  <h3 className={`font-black text-base mb-4 ${section.textColor}`}>{sub.heading}</h3>
                  <ul className="space-y-2.5">
                    {sub.points.map((point, pi) => (
                      <li key={pi} className="flex items-start gap-3 text-gray-700 text-sm leading-relaxed">
                        <ChevronRight className={`h-4 w-4 mt-0.5 shrink-0 ${section.textColor}`} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact note */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white text-center">
          <h3 className="text-xl font-black mb-2">Questions about our policies?</h3>
          <p className="text-slate-400 text-sm mb-5">We're happy to clarify anything before you book.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition hover:scale-105">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
