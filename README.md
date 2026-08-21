# WashWise Car Wash Platform

WashWise is a responsive full-stack booking, queue, loyalty, and operations platform for a car-wash business. The customer experience runs on Next.js and Vercel; the Express API runs on Render; and accounts, bookings, vehicles, and operational data are stored in MongoDB Atlas.

## Main features

- Database-backed customer sign-up/sign-in with hashed passwords and seven-day sessions
- Google sign-in through Google Identity Services, with Clerk still supported as an optional provider
- Vehicle profiles with normalized plate-number records
- Scheduled appointments and live queue availability
- Past wash history, loyalty stamps, and freebie redemptions
- Admin walk-in intake, bay assignment, and wash-stage tracking
- Weekly, monthly, and yearly revenue reporting
- Capacity controls, status audit trail, and duplicate-booking protection
- Responsive black-and-yellow interface with customer and admin views

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` values into `apps/web/.env.local` and `apps/api/.env`
3. Start the API: `npm run dev:api`
4. Start the web app: `npm run dev:web`

The built-in account flow works without Clerk. Set the same Google OAuth client ID as `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on the web app and `GOOGLE_CLIENT_ID` on the API to enable Google sign-in. Set `ADMIN_EMAILS` on the API to the comma-separated email addresses that should receive administrator access.

## Production architecture

- `apps/web`: Vercel project, root directory `apps/web`
- `apps/api`: Render web service, root directory `apps/api`
- Database: MongoDB Atlas database `washwise`
- Authentication: native email/password and JWT sessions; optional Google Identity Services or Clerk

See [DEPLOYMENT.md](DEPLOYMENT.md) for the environment-variable and launch checklist.
