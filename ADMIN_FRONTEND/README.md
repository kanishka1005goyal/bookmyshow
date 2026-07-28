# BookMyShow — Admin Frontend

A separate React (Vite + TypeScript + Tailwind v4) app for managing the BookMyShow
platform. It talks to the **same backend and database** as the user-facing app —
nothing on the server was duplicated, only extended.

## Stack
Same as the user frontend, for consistency: React 19, TypeScript, Tailwind CSS v4,
`react-router-dom`, `lucide-react`.

## Setup
```bash
npm install
npm run dev        # runs on http://localhost:5174
```

Set `VITE_API_URL` in `.env` to point at the backend (default `http://localhost:5000/api`).

## Auth
Uses the existing `/api/auth/login` endpoint. Login only succeeds in this app if the
returned user has `role: "admin"` (promote a user via the backend's
`src/scripts/makeAdmin.ts` script). The JWT is stored in `localStorage` and attached
to every request via `Authorization: Bearer <token>`.

## Pages
- **/login** — admin sign-in
- **/** — Dashboard: total movies, today's shows, bookings, revenue, recent bookings,
  recent movies
- **/movies** — movie catalog: search, add, deactivate

## Backend addition
One new endpoint was added to the shared backend to power the dashboard:

```
GET /api/admin/dashboard   (protect + requireAdmin)
```

It returns real counts for movies (`totalMovies`, `recentMovies`) from the existing
`Movie` model. `todaysShows`, `totalBookings`, `revenue`, and `recentBookings` are
returned as `0` / `[]` placeholders — the `Show`, `Booking`, and `Payment` models in
this codebase are currently empty files, so there's no data to aggregate yet. Once
those models are implemented, only `backend/src/controllers/admin.controller.ts`
needs to change — the response shape (and this UI) already expects the real fields.
