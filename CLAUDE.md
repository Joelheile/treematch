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
  - Needs `SUPABASE_PROJECT_ID` set in the shell

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

## Claude Code Rules

### Meta Rules
- **95% Confidence Rule**: Do not make any changes until you have 95% confidence that you know what to build. Ask follow-up questions until you have that confidence.
- **Senior Engineer Task Execution**: You are a senior engineer responsible for high-leverage, production-safe changes. Follow this procedure without exception:
  1. **Clarify Scope First**: Map out exactly how you will approach the task. Confirm your interpretation of the objective. Write a clear plan showing what functions, modules, or components will be touched and why.
  2. **Locate Exact Code Insertion Point**: Identify the precise file(s) and line(s) where the change will live. Never make sweeping edits across unrelated files.
  3. **Minimal, Contained Changes**: Only write code directly required to satisfy the task. Avoid adding logging, comments, tests, TODOs, cleanup, or error handling unless directly necessary.
  4. **Double Check Everything**: Review for correctness, scope adherence, and side effects. Ensure your code is aligned with the existing codebase patterns.
  5. **Deliver Clearly**: Summarize what was changed and why. List every file modified and what was done in each.

### Task Management Rules
- ALWAYS use the TodoWrite tool to plan and track tasks throughout the conversation
- Mark todos as completed immediately when tasks are finished
- Only have ONE task in_progress at any time
- Create specific, actionable todo items
- Use the todo list for any multi-step or complex tasks

### General Principles
- Keep code simple and reduce complexity
- Leave code better than you found it (Boy Scout rule)
- Always identify and address root causes of problems
- Write concise, technical JavaScript code with accurate examples

### Programming Paradigm
- Use functional and declarative programming patterns
- Avoid classes and object-oriented approaches
- Prefer iteration and modularization over code duplication
- Use declarative TSX for React components

### Design Best Practices
- Keep configuration data at high levels
- Use polymorphism instead of conditional logic
- Isolate multi-threading code
- Avoid excessive configurability
- Implement dependency injection
- Follow Law of Demeter (classes should only know direct dependencies)
- Create beautiful, production-worthy designs that aren't cookie-cutter
- Use Shadcn and Tailwind CSS for components and styling
- Keep Tailwind classes concise
- Implement responsive design with a mobile-first approach

### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for components and component files
- Prefix component names with their type (e.g., ButtonAccount.jsx, CardAnalyticsMain.jsx)
- Choose clear, unambiguous names
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Create meaningful distinctions between similar elements
- Ensure names are searchable
- Replace magic numbers with named constants
- Avoid prefixes and type encodings

### Code Structure
- Structure files: exported component, subcomponents, helpers, static content
- Separate concepts vertically
- Keep related code vertically dense
- Declare variables close to usage
- Position dependent functions near each other
- Group similar functions together
- Arrange functions in downward direction
- Keep lines short and avoid horizontal alignment
- Use whitespace strategically
- Maintain consistent indentation

### Function Guidelines
- Use the "function" keyword for pure functions
- Keep functions small and focused
- Design functions to do exactly one thing
- Use descriptive function names
- Minimize function arguments
- Avoid side effects
- Split flag-based methods into independent methods
- Avoid unnecessary curly braces in conditionals; use concise syntax

### Performance Optimization
- Minimize 'use client', 'useState', and 'useEffect'
- Favor React Server Components (RSC)
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Optimize images: use WebP format, include size data, implement lazy loading
- Optimize Web Vitals (LCP, CLS, FID)
- Follow Next.js docs for Data Fetching, Rendering, and Routing
- If client-side data fetching is necessary, use the 'swr' library

### Client/Server Component Rules
- Limit 'use client' directive usage:
  - Favor server components and Next.js SSR
  - Use only for Web API access in small components
  - Avoid for data fetching or state management
- When using client-side hooks (useState, useEffect) in a component, always add "use client" directive at the top

### Error Handling
- Explicit Error Types: Define clear, specific error cases
- Graceful Degradation: Handle errors without crashing
- User-Friendly Messages: Provide meaningful error feedback
- Logging and Monitoring: Track errors for debugging and improvement
- Recovery Strategies: Implement fallback mechanisms where appropriate

### Testing Principles
- One assertion per test
- Write readable tests
- Ensure tests run quickly
- Make tests independent
- Design tests to be repeatable
- Test code should be as clean as production code

### Code Quality
- Express intent in code rather than comments
- Avoid redundant or obvious comments
- Don't use closing brace comments
- Remove commented-out code completely
- Use comments to explain intent, clarify code, or warn of consequences
- Most important: don't write comments unless absolutely necessary

### Code Smells to Avoid
- Rigidity (difficult to change)
- Fragility (breaks easily with changes)
- Immobility (hard to reuse)
- Needless complexity
- Unnecessary repetition
- Opacity (hard to understand)

### Package Management
- Do not install additional packages for UI themes, icons, etc. unless absolutely necessary or specifically requested