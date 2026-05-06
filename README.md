# EventHub Pro 🎟️

World-class event ticketing marketplace built with Next.js 15, PostgreSQL, Prisma, Redis, and Stripe.

## Features

- **Public Marketplace**: High-performance event discovery with search, categories, and trending filters.
- **Smart Checkout**: Multi-step checkout with Stripe integration, promo codes, and service fees.
- **Digital Tickets**: HMAC-signed QR codes with anti-screenshot watermarks and PDF generation.
- **Organizer Portal**: Full-stack dashboard for managing events, sales analytics, and payouts.
- **Admin Panel**: Global marketplace control, fraud prevention alerts, and event moderation.
- **Staff Scanner**: Mobile-first portal for real-time ticket validation at event entrances.
- **Advanced Engine**: Dynamic pricing rules and Redis-backed waiting room for high-demand drops.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Zustand, ShadCN UI.
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL.
- **Infrastructure**: Redis (Cache/Queue), Resend (Email), Stripe (Payments).
- **Security**: RBAC (Customer, Organizer, Staff, Admin), HMAC QR signing, Rate limiting.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env.local` and fill in your credentials.
   ```bash
   cp .env.example .env.local
   ```

3. **Database Setup**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Deployment (Render)

This project is pre-configured for Render using the `render.yaml` file. It includes:
- Web Service (Next.js)
- Worker Service (Background jobs)
- Cron Jobs (Dynamic pricing & Payouts)
- Managed PostgreSQL
- Managed Redis

## User Roles

- **Customer**: Browse events, buy tickets, download/transfer QR codes.
- **Organizer**: Create events, manage ticket tiers, track revenue, request payouts.
- **Staff Scanner**: Use the scanner portal to validate entries.
- **Admin**: Approve organizers, moderate events, handle fraud alerts.

## License

MIT
