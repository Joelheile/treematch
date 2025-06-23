# TreeMatch

A Stanford student matching platform built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Migration from Vite to Next.js

This project has been migrated from Vite + React Router to Next.js App Router for better performance and simpler routing. Key changes include:

- **Replaced Vite with Next.js App Router**: Simplified build process and better performance
- **Removed React Router DOM**: Uses Next.js file-based routing instead
- **Updated directory structure**: Moved from `src/pages/` to Next.js `app/` directory
- **Fixed component imports**: Resolved client/server component boundaries
- **Updated build scripts**: New Next.js build and development commands

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Query + React Context
- **Backend**: Supabase

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

- Student onboarding flow
- Profile creation and management
- Skill-based matching system
- Project collaboration tools
- Real-time notifications

## Project Structure

```
treematch/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── not-found.tsx      # 404 page
│   ├── providers.tsx      # Client-side providers
│   └── globals.css        # Global styles
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript types
│   └── integrations/     # External service integrations
└── public/               # Static assets
```
