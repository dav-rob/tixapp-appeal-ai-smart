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
- Single-page application with view-based routing handled in `src/pages/Index.tsx`
- Four main views: home, scan, dashboard, details (state-managed, not URL-routed)
- Components use shadcn/ui pattern with `@/` path aliases
- Custom color scheme: tixapp-navy (primary), tixapp-teal (accent), tixapp-gray

**Key Components:**
- `Index.tsx` - Main page with view state management
- `TicketScanner` - Handles ticket upload/photo capture
- `TicketDashboard` - Lists user's tickets
- `TicketDetails` - Shows individual ticket information
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