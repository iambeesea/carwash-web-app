# WashWise Car Wash Platform

WashWise is a responsive full-stack booking, queue, loyalty, and operations platform for a car-wash business. The customer experience runs on Next.js and Vercel; the Express API runs on Render; operational data is stored in MongoDB Atlas; and Clerk provides email/password plus Google authentication.

## Main features

- Customer sign-up/sign-in, including Google through Clerk
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

If no Clerk publishable key is configured, the web app exposes local demo customer/admin accounts. Set `DEMO_MODE=true` on the API for the same demo workflow. Disable demo mode before production use.

## Production architecture

- `apps/web`: Vercel project, root directory `apps/web`
- `apps/api`: Render web service, root directory `apps/api`
- Database: MongoDB Atlas database `washwise`
- Authentication: Clerk; set Google as a social connection in the Clerk Dashboard

See [DEPLOYMENT.md](DEPLOYMENT.md) for the environment-variable and launch checklist.
