# Deployment checklist

## MongoDB Atlas

Create a database user with `readWrite` access to the `washwise` database and allow Render to connect. Store the SRV URI only in Render as `MONGODB_URI`; never commit it.

## Clerk and Google sign-in

1. Create a Clerk application and enable email/password plus Google.
2. Add the Vercel production URL to Clerk's allowed origins and redirect URLs.
3. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to Vercel.
4. Add `CLERK_JWKS_URL`, `CLERK_ISSUER`, and optionally `CLERK_SECRET_KEY` to Render.
5. Add the Clerk user IDs of administrators to `ADMIN_CLERK_USER_IDS` as a comma-separated list.
6. Set Render `DEMO_MODE=false` after real authentication is configured.

## Render API

Use `render.yaml` from the repository or create a Node web service with root directory `apps/api`.

- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: `/api/health`

Required: `MONGODB_URI`, `FRONTEND_URL`. Authentication variables are required when `DEMO_MODE=false`.

## Vercel web app

Import the repository, set root directory to `apps/web`, and add:

- `NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com/api`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>`

After deployment, update Render `FRONTEND_URL` to the final Vercel origin.
