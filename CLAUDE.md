# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server (runs on port 8080)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture

This is a React-based parking ticket appeal application built with modern TypeScript tooling:

**Tech Stack:**
- Vite + React 18 + TypeScript
- shadcn/ui components with Radix UI primitives
- TanStack Query for data fetching
- React Router for navigation
- Tailwind CSS with custom TixApp branding

**Project Structure:**
- Multi-page application with URL-based routing via React Router
- Four main routes: `/` (home), `/scan`, `/dashboard`, `/details` 
- Components use shadcn/ui pattern with `@/` path aliases
- Custom color scheme: tixapp-navy (primary), tixapp-teal (accent), tixapp-gray

**Routing & Navigation:**
- React Router handles URL-based navigation with routes: `/`, `/scan`, `/dashboard`, `/details`
- Each view has its own page component in `/pages/`
- Back navigation uses `useNavigate(-1)` for proper browser history
- Header TixApp logo and SideNav Home button navigate to `/`

**Key Components:**
- `Index.tsx` - Home page with CTA buttons for scan and dashboard
- `ScanPage.tsx` - Ticket upload/photo capture page
- `DashboardPage.tsx` - Lists user's tickets
- `DetailsPage.tsx` - Shows individual ticket information
- UI components in `/components/ui/` follow shadcn patterns

**Styling Notes:**
- Custom TixApp colors defined in `tailwind.config.ts`
- Accessibility focus rings and touch targets (44px minimum)
- Responsive design with mobile-first approach
- Uses CSS variables for theming

**Development Notes:**
- Lovable.dev integration with component tagging in development mode
- Project uses npm (has both package-lock.json and bun.lockb, prefer npm)
- ESLint configured with React hooks and TypeScript rules