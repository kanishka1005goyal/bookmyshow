# BookMyShow Clone

A full-stack movie ticket booking application, split into two independent projects:

- **frontend/** — React + TypeScript + Vite app
- **backend/** — Node.js + TypeScript + Express API (MongoDB, JWT/Clerk auth, Razorpay payments, Redis seat locking)

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env   # fill in your own MongoDB URI, JWT secret, etc.
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Notes on this cleaned copy

This copy was reorganized from the original upload, which contained the entire
project (including `node_modules`) accidentally nested inside itself three
times (`backend/backend/backend/...`). The most complete/up-to-date copies of
the frontend and backend source were extracted and de-duplicated here.

Real credentials (MongoDB URI, JWT secret, Clerk secret key) that were
committed in the original `.env` files have been removed and replaced with
`.env.example` placeholders. **Since those credentials were exposed in a
zip you shared, please rotate them (change the MongoDB password, JWT secret,
and Clerk key) if they're still in use.**
