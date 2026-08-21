# Deployment checklist

## MongoDB Atlas

Create a database user with `readWrite` access to the `washwise` database and allow Render to connect. Store the SRV URI only in Render as `MONGODB_URI`; never commit it.

## Accounts and Google sign-in

1. Generate a random secret of at least 32 characters and add it to Render as `AUTH_JWT_SECRET`.
2. Set Render `DEMO_MODE=false`.
3. Add administrator email addresses to Render `ADMIN_EMAILS` as a comma-separated list.
4. For Google sign-in, create a Web OAuth client in Google Cloud and add the Vercel production origin under Authorized JavaScript origins.
5. Set its client ID as `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on Vercel and `GOOGLE_CLIENT_ID` on Render.

Clerk remains optional. If used, add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to Vercel and `CLERK_JWKS_URL`, `CLERK_ISSUER`, and `ADMIN_CLERK_USER_IDS` to Render.

## Render API

Use `render.yaml` from the repository or create a Node web service with root directory `apps/api`.

- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: `/api/health`

Required: `MONGODB_URI`, `FRONTEND_URL`, `AUTH_JWT_SECRET`, and `DEMO_MODE=false`.

## Vercel web app

Import the repository, set root directory to `apps/web`, and add:

- `NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com/api`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-web-client-id>` (optional until Google OAuth is configured)

After deployment, update Render `FRONTEND_URL` to the final Vercel origin.
