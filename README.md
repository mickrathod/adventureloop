# AdventureLoop

A group travel booking platform for small-group trips, built for travelers from Gujarat, India. Features a public-facing trip browser with booking/enquiry flows, and a full admin dashboard for managing bookings, trips, pricing, and site configuration.

## Features

### Public Site
- **Trip Listings** — Browse upcoming trips with destinations, dates, pricing, and batch sizes
- **Trip Detail Pages** — Full itineraries with day-by-day timelines, inclusions, live countdown to departure
- **Booking & Enquiry** — Submit booking forms; get WhatsApp-linked confirmation with pre-filled messages
- **Notify Me** — Join a waitlist for coming-soon trips via WhatsApp
- **Live Activity Feed** — Real-time booking notifications as social proof
- **SEO Optimized** — Dynamic meta tags, OG tags, structured data, and canonical URLs per page
- **Fully Responsive** — Designed for mobile, tablet, and desktop

### Admin Dashboard (`/admin`)
- **Bookings Inbox** — View all bookings and notify-me submissions; filter by type and status
- **Status Tracking** — Move bookings through: New → Contacted → Confirmed → Cancelled
- **Trips Manager** — Create, edit, and delete trips with images, dates, pricing, and day-by-day itineraries
- **Site Config Editor** — Live-edit site name, phone, email, social links, and admin credentials — no redeploy needed
- **Pricing Calculator** — Compute per-seat profitability from costs vs. selling price
- **Email Templates** — Manage transactional message templates

### Integrations
- **Supabase** — PostgreSQL database for trips, bookings, and site config
- **Slack Webhooks** — Instant booking notifications posted to a Slack channel

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, Vite 8, Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Build | Vite + PostCSS + Autoprefixer |
| Linting | ESLint 10 |

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project with the required tables (see below)

### Installation

```bash
git clone https://github.com/your-username/adventureloop.git
cd adventureloop
npm install
```

### Development

```bash
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build
npm run preview   # preview production build
npm run lint      # run ESLint
```

## Project Structure

```
src/
├── App.jsx                # Landing page (hero, trips grid, FAQs, gallery, CTA)
├── TripPage.jsx           # Individual trip detail page
├── PoliciesPage.jsx       # Policies, T&Cs, cancellation & refund info
├── AdminLayout.jsx        # Admin sidebar + nav shell
├── AdminLogin.jsx         # Admin authentication
├── AdminBookings.jsx      # Bookings & notify-me inbox
├── AdminTrips.jsx         # Trip CRUD with itinerary editor
├── AdminSiteConfig.jsx    # Live site settings editor
├── AdminCalculator.jsx    # Pricing & profitability calculator
├── AdminTemplates.jsx     # Email/message template manager
├── supabaseClient.js      # Supabase client initialisation
├── siteConfig.js          # Site config with lazy-load proxy
├── useTrips.js            # Custom hook for fetching trips
├── useSEO.js              # Dynamic SEO meta tag injection
├── Skeleton.jsx           # Loading screen
└── main.jsx               # React + Router entry point
```

## Design System

| Token | Value |
|---|---|
| Primary (navy) | `#082F49` |
| Secondary (teal) | `#0F766E` |
| Accent (orange) | `#F97316` |
| Background (cream) | `#FFF7ED` |

## License

MIT
