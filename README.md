# TreeMatch

A directory of every student in Stanford Summer Session. Students create a profile with their skills, courses and socials, then find each other by search and filters.

Live: https://treematch.vercel.app

Built in summer 2025 by Joel, Leonard, Simon and Nicholas during Stanford Summer Session.

## Features

- Sign up with a Stanford email, magic link or password
- Onboarding flow: name, university, courses, skills, interests, socials, avatar
- Student directory with search and filters for country, skills, courses and social links
- Like students and filter for the ones you liked
- Referral links with a leaderboard
- Contact card export and share button

## Stack

- Next.js 14 App Router, TypeScript
- Supabase for auth, Postgres, storage and row level security
- Tailwind CSS and shadcn/ui
- React Query
- PostHog for analytics, optional
- Jest and React Testing Library

## Run it locally

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run `supabase-migrations.sql` in the SQL editor. It creates the tables, RLS policies, storage buckets and seed skills and courses. If avatar uploads fail, run `fix-storage.sql` too.

   Existing project from before September 2026: run `supabase-hardening.sql` once. It locks the old temp-avatars bucket and adds the server-side Stanford email check.

3. Copy the env file and fill in your Supabase URL and anon key from Settings > API:

```bash
cp env.example .env.local
```

4. Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host, defaults to EU |
| `SUPABASE_PROJECT_ID` | No | Only for `npm run update-types` |

Never commit `.env.local`. The anon key is safe to ship to the browser, but all data access must stay behind the RLS policies in `supabase-migrations.sql`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Jest |
| `npm run update-types` | Regenerate `src/integrations/supabase/types.ts` from your Supabase schema |

## Project structure

```
src/
  app/            Next.js routes: auth, welcome (onboarding), edit, meet, referrals, invite
  components/     UI, onboarding steps, student cards, referral leaderboard
  integrations/   Supabase clients and React Query hooks
  hooks/          Shared hooks
  lib/            Utilities and validation
  types/          Shared types
supabase-migrations.sql   Schema, RLS policies, buckets, seed data
fix-storage.sql           Storage bucket policies for avatar uploads
supabase-hardening.sql    One-time security fixes for existing projects
middleware.ts             Route protection
```

## Deploying

The app runs on Vercel. Set the environment variables above in the Vercel project. The GitHub workflow in `.github/workflows/deploy-vercel.yml` triggers a deploy hook for pushes from non-admin collaborators; store the hook URL as a repository secret before enabling it.

## Security

See [SECURITY.md](./SECURITY.md) for the measures in place and how to report a vulnerability.

## License

MIT, see [LICENSE](./LICENSE).
