# Trading Simulator (Full Stack)

## Features
- Landing page: hero/about/skills, sticky navbar, smooth scroll, dark mode, scroll animations.
- Stock dashboard: search, detail view (price, day high/low, volume), loading/error/empty states.
- Auth: JWT login/signup, bcrypt password hashing.
- Favorites (watchlist): add/remove/list; persists locally and syncs to backend when logged in.
- Realtime: price updates via Socket.io (fallback polling), price flash green/red on changes.
- Trading simulation: virtual cash ($10,000), buy/sell, holdings, average price, P/L; no negative balance / no overselling; idempotent orders via `requestId`.

## Tech
- Frontend: Vite + React + TypeScript + Tailwind
- Backend: Node.js + Express + MongoDB (Mongoose) + Socket.io

## Local setup
### Prereqs
- Node 18+ (you have Node 22)
- MongoDB running locally (or MongoDB Atlas)

### 1) Backend
Copy env:
- `server/.env.example` → `server/.env`

Set:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN` (default `http://localhost:5173`)

Run:
```bash
cd server
npm install
npm run dev
```

### 2) Frontend
Copy env:
- `client/.env.example` → `client/.env`

Run:
```bash
cd client
npm install
npm run dev
```

### 3) Run both together
```bash
npm run dev
```

## API overview
- `GET /api/stocks` — list stocks (mock price engine)
- `GET /api/stocks/:symbol` — stock detail
- `POST /api/auth/signup` / `POST /api/auth/login`
- `GET /api/favorites` / `POST /api/favorites` / `DELETE /api/favorites/:symbol` (JWT)
- `GET /api/trade/portfolio` (JWT)
- `POST /api/trade/order` (JWT) body: `{ requestId, symbol, side, quantity }`

## Production notes
- Backend includes Helmet, CORS, and rate limiting.
- Use `.env` on backend hosts (Render/Railway), and Vite envs on Vercel/Netlify.
- Add a reverse proxy / CDN cache for `/api/stocks` if you later swap in a real external market API.

## Scaling thoughts
- Move price engine to a dedicated service (or job runner) and persist ticks if you need history/charts.
- Add optimistic UI with server reconciliation for trades at higher throughput.
- Add Redis for pub/sub + rate limit storage in multi-instance deployments.

