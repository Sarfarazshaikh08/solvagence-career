# Deployment Checklist

## Environment

- Create `backend/.env` from `backend/.env.example`
- Set a real `MONGO_URI`
- Set a strong `JWT_SECRET`
- Set `CLIENT_ORIGIN` to your real frontend URL
- Keep `ALLOW_ADMIN_RESET=false` in production unless you intentionally want admin reseeding enabled
- If using S3 in production, set:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_S3_BUCKET`

## Backend Verification

- Run `npm test` in `backend`
- Run `npm run seed` only if you want the demo/default data
- Start the API with `npm start` or your process manager
- Verify:
  - `GET /api/health`
  - admin login
  - jobs CRUD
  - settings save
  - reset behavior is blocked in production unless explicitly enabled

## Frontend Verification

- Run `npm run build` in `frontend`
- Confirm the production build completes without errors
- Serve the frontend and verify:
  - careers page loads
  - jobs list loads
  - application form submits
  - subscriber form submits
  - admin dashboard loads after login

## End-to-End Checks

- Submit a test application with a PDF resume
- Open the application in admin
- Change candidate status
- Save recruiter notes
- Save credit score
- Create and edit a job posting
- Save settings
- Export candidates and subscribers CSV

## Production Safety

- Disable admin reset in production unless absolutely required
- Replace demo seed credentials before real use
- Back up MongoDB before using reset on any shared environment
- Confirm HTTPS, reverse proxy, and process manager are configured
