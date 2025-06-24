# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TreeMatch is a Stanford student matching platform built with Next.js 14, TypeScript, and Supabase. The application helps students find project collaborators based on skills and interests.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Supabase Type Generation
- `npm run update-types` - Generate TypeScript types from Supabase schema
  - Updates `src/integrations/supabase/types.ts`
  - Uses project ID: zlggajmzyjrwojzhidlo

## Application Architecture

### Authentication & Authorization
- Uses Supabase Auth with custom AuthProvider (`src/app/auth/AuthProvider.tsx`)
- Authentication state is managed globally via React Context
- Protected routes use AuthGuard component
- Post-auth onboarding flow handled by PostAuthOnboardingProcessor

### Data Layer
- **Supabase Integration**: All database operations in `src/integrations/supabase/`
- **React Query**: Used for state management and caching
- **Custom Hooks**: Business logic abstracted into reusable hooks
- **Type Safety**: Auto-generated TypeScript types from Supabase schema

### Key Data Entities
- **Students**: Core user profiles with skills, projects, and social links
- **Skills**: Global and user-specific skills with many-to-many relationship
- **Student Skills**: Junction table linking students to their skills

### UI Architecture
- **Shadcn/ui**: Complete UI component library in `src/components/ui/`
- **Tailwind CSS**: Utility-first styling with custom configuration
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Dark Mode**: Supported via next-themes

### Routing Structure
- **App Router**: Next.js 14 app directory structure
- **File-based Routing**: Pages defined in `src/app/` directory
- **Nested Layouts**: Authentication layout for auth pages
- **Middleware**: Route protection at `middleware.ts`

### State Management Patterns
- **Server State**: React Query for API calls and caching
- **Client State**: React Context for global state (auth, theme)
- **Form State**: React Hook Form with Zod validation
- **Persistent State**: OnboardingStorage for multi-step forms

## Important Integrations

### PostHog Analytics
- Configured in `src/app/providers.tsx` and `src/lib/posthog.ts`
- **Important**: Never hardcode API keys - always use environment variables
- **Feature Flags**: Use enums/const objects for flag names (UPPERCASE_WITH_UNDERSCORE)
- **Custom Properties**: Use enums/const objects when referenced in multiple places
- **Naming**: Maintain consistency and consult developer for naming conventions

### Supabase Configuration
- Client-side: `src/integrations/supabase/client.ts`
- Server-side: `src/integrations/supabase/server.ts`
- SSR support: `src/integrations/supabase/client-ssr.ts`

## Code Conventions

### TypeScript Configuration
- Strict mode disabled (`"strict": false`)
- Path aliases: `@/*` maps to `./src/*`
- Modern module resolution with bundler strategy

### Component Patterns
- **Client Components**: Marked with `"use client"` directive
- **Server Components**: Default for app directory
- **Custom Hooks**: Prefix with `use`, located in `src/hooks/`
- **Supabase Hooks**: Located in `src/integrations/supabase/`

### File Organization
- **Pages**: `src/app/` (Next.js App Router)
- **Components**: `src/components/` (business logic) and `src/components/ui/` (reusable UI)
- **Hooks**: `src/hooks/` (business logic) and `src/integrations/supabase/` (data fetching)
- **Types**: `src/types/` for domain types
- **Utilities**: `src/lib/` for shared utilities

## Development Workflow

### Onboarding Flow
- Multi-step form with persistent storage
- Image upload to Supabase storage
- Skills management with autocomplete
- Profile completion validation

### Student Management
- CRUD operations via custom hooks
- Real-time updates with React Query
- Avatar management with image compression
- Social media profile integration

## Key Dependencies
- **Next.js 14**: App Router, SSR, middleware
- **React Query**: Server state management
- **Supabase**: Database, auth, storage
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Zod**: Runtime type validation
- **React Hook Form**: Form management