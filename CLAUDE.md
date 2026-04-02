# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tajna Botanika is a Czech e-commerce web application for botanical/hemp products. Built with React + TypeScript + Vite, styled with Tailwind CSS, and backed by Supabase (auth, database, edge functions). Prices are in CZK.

## Commands

- `npm run dev` — Start dev server (Vite)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (`tsc --noEmit -p tsconfig.app.json`)
- `npm run preview` — Preview production build

No test framework is configured.

## Architecture

### Frontend (React SPA)

**Routing:** React Router v7 in `src/App.tsx`. All routes defined there. Pages are lazy-loaded.

**Context providers** (wrap the entire app in `App.tsx`):
- `PerformanceProvider` — performance monitoring
- `AuthProvider` (`contexts/AuthContext.tsx`) — Supabase auth, user profiles, admin role check via `admin_users` table
- `CartProvider` (`contexts/CartContext.tsx`) — cart state persisted to localStorage, tracks Facebook pixel events

**Key patterns:**
- `useAuth()` hook from AuthContext provides `user`, `profile`, `isAdmin`, auth methods
- `useCart()` hook from CartContext provides cart operations
- Product prices vary by gram amount (1g/3g/5g/10g) with a hardcoded price map in CartContext
- Facebook pixel/CAPI tracking via `useTracking` hook throughout the app
- Heavy use of lazy loading and `<Suspense>` boundaries for code splitting

### Backend (Supabase)

**Database types** defined in `src/lib/supabase.ts` — includes `Product`, `UserProfile`, `Address`, `Order`, `OrderItem`, `CartItem` types.

**Supabase Edge Functions** (`supabase/functions/`):
- `pays-webhook` — payment webhook handler
- `facebook-capi` — Facebook Conversions API server-side events
- `facebook-catalog-sync` — syncs products to Facebook catalog

**Migrations** in `supabase/migrations/` — includes admin users, RLS policies, complete schema.

### Integrations

- **Packeta** (`src/lib/packeta.ts`) — Czech shipping/pickup point service
- **Facebook Pixel + CAPI** — client-side tracking + server-side via edge function
- **Facebook Catalog** — product sync, admin management UI in `components/admin/FacebookCatalogManager.tsx`
- **Stripe** — payment processing, subscription support (see `stripe_user_subscriptions` view)

### Admin

Admin dashboard at `/admin` route (`pages/AdminDashboard.tsx`). Admin components in `src/components/admin/` include product management and Facebook catalog sync. Admin status determined by `admin_users` table lookup.

## Environment Variables

Prefix with `VITE_` for client-side access:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_PACKETA_API_KEY`, `VITE_PACKETA_API_SECRET`

## Styling

Tailwind CSS with custom fonts: Orbitron (display/headings) and Montserrat (body). Dark theme (black background, emerald accent colors). Custom visual effects: particle backgrounds, custom cursor, scroll reveals, flying animations.
