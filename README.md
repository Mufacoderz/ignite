# DailyFit — Next.js Stack

**Tech:** Next.js 14 App Router · TypeScript · Tailwind CSS · Prisma · MySQL · Framer Motion · JWT

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup .env
cp .env.example .env
# Edit .env with your MySQL credentials

# 3. Push database schema
npx prisma generate
npx prisma db push

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## .env Setup

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/dailyfit_next"
JWT_SECRET="change-this-to-a-random-secret"
```

## Database Commands

```bash
npx prisma db push        # sync schema to DB
npx prisma generate       # regenerate client
npx prisma studio         # visual DB editor
```

## Features
- Dashboard with streak, stats, weekly chart
- Exercise library with CRUD + categories
- Workout Plans with exercise assignment
- Daily Checklist with progress tracking
- Statistics with charts (bar, line, pie)
- Responsive: Sidebar (desktop) + BottomNav (mobile)
- JWT auth with httpOnly cookie + localStorage
