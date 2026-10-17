# Jadvix Certificate Portal

A secure, SEO-friendly platform to **issue** and **verify** professional certificates, built as two decoupled apps:

| App | Stack | Port | Folder |
|-----|-------|------|--------|
| **Frontend** | Next.js 15 (App Router) · TypeScript · Tailwind v4 | `3000` | [`frontend/`](frontend) |
| **Backend API** | Node.js · Express · TypeScript · Mongoose (MongoDB) | `8000` | [`backend/`](backend) |

The public site verifies a certificate by its **Order ID** (`JX-XXXX-XXXX`). The admin console manages certificates (with CSV import/export), institutes, media, and site branding.

---

## Prerequisites
- Node.js 20+ and npm
- A MongoDB connection string (MongoDB Atlas)

## 1. Backend

```bash
cd backend
cp .env.example .env        # then fill in MONGODB_URI + a strong JWT_SECRET
npm install
npm run migrate             # (one-off) import legacy data from scripts/legacy-data.json
npm run reset-admin         # (one-off) sets admin@jadvix.com / Jadvix@2026 — change after login
npm run dev                 # → http://localhost:8000
```

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Key endpoints
- `GET  /api/health` — service + DB status
- `GET  /api/verify/:orderId` — public certificate lookup (rate-limited)
- `GET  /api/site-settings` — public branding
- `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` · `PATCH /api/auth/profile`
- `GET/POST/PUT/DELETE /api/admin/certificates` (+ `/bulk`)
- `GET/POST/PUT/DELETE /api/admin/institutes`
- `GET/POST/DELETE /api/admin/gallery`
- `GET /api/admin/dashboard/stats` · `PUT /api/admin/settings/site`

## 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # defaults point at http://localhost:8000
npm install
npm run dev                  # → http://localhost:3000
# production:
npm run build && npm start
```

### Default admin login (after `reset-admin`)
- **Email:** `admin@jadvix.com`
- **Password:** `Jadvix@2026`  → change immediately in Settings.

---

## Security highlights
- Validated env config; **no** hardcoded secrets or committed passwords.
- JWT in an **httpOnly** cookie; verified on every `/api/admin/*` route.
- bcrypt (cost 12) + **per-account lockout** on repeated failed logins.
- **zod** validation on every request; `helmet`, CORS lock, `express-mongo-sanitize`, `hpp`.
- Layered **rate limiting** (global, verify, auth) with a leak-proof error handler.

## SEO highlights
- Per-page metadata, canonical URLs, OpenGraph/Twitter cards.
- SSR shareable verify pages at `/verify/JX-XXXX-XXXX`.
- `sitemap.xml`, `robots.txt` (admin disallowed), and JSON-LD
  (`Organization` sitewide, `EducationalOccupationalCredential` per certificate).

## Data migration
`backend/scripts/migrate.ts` imports the legacy SQLite portal's data
(`scripts/legacy-data.json`) into MongoDB — 20 certificates, 2 institutes,
4 gallery assets, 1 admin, 1 settings — remapping institute relations,
converting timestamps, and copying upload assets into `backend/uploads/`.
It is idempotent (upsert by natural keys), so it is safe to re-run.
