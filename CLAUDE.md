# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server (runs on port 8080)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm test` - Run Playwright navigation tests
- `npm run test:ui` - Run Playwright tests with UI

**iOS Development:**
- `npm run ios` - Build and run app in iOS simulator (auto-selects best device, ~5+ min first time)
- `npm run ios:redeploy` - **Quick rebuild and redeploy to running simulator (~10-15 sec)**
- `npm run ios:check` - Check iOS development environment and available simulators
- `npm run ios:list` - List all available iOS simulators and runtimes
- `npm run ios:sync` - Sync Capacitor iOS project with latest web build
- `npm run ios:open` - Open iOS project in Xcode
- `./scripts/ios-build-run.sh [SIMULATOR_ID]` - Run with specific simulator ID
- `./scripts/ios-check.sh` - Detailed iOS environment diagnostics

**Recommended Development Flow:**
1. **First time:** `npm run ios` (slow, starts everything)
2. **Development:** Make React code changes → `npm run ios:redeploy` (fast!)
3. **Keep simulator running** for best performance

## Architecture

This is a React-based parking ticket appeal application built with modern TypeScript tooling:

**Tech Stack:**
- Vite + React 18 + TypeScript
- shadcn/ui components with Radix UI primitives
- TanStack Query for data fetching
- React Router for navigation
- Tailwind CSS with custom TixApp branding
- Capacitor for mobile app development (iOS/Android)

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

**Mobile App Development:**
- iOS app configured with Capacitor 7.3.0 
- Camera permissions configured for ticket scanning
- iOS project located in `ios/App/App.xcworkspace`
- Supports iOS 17.4+ and iOS 18.5+ simulators
- Auto-detects best available iPhone simulator for testing

**iOS Development Workflow:**
```bash
# Initial setup (once per session - ~5+ minutes)
npm run ios                    # Starts simulator + full build

# Development cycle (super fast - ~10-15 seconds)
# 1. Make changes to React code in src/
# 2. Quick redeploy:
npm run ios:redeploy          # Build + install + launch

# Repeat steps 1-2 as needed
```

**Performance Notes:**
- First run: ~5+ minutes (simulator startup is slowest part)
- Redeploy: ~10-15 seconds (simulator already running)
- Keep simulator running during development for best speed
- Script auto-detects running simulators and handles installation

**Development Notes:**
- Lovable.dev integration with component tagging in development mode
- Project uses npm (has both package-lock.json and bun.lockb, prefer npm)
- ESLint configured with React hooks and TypeScript rules
- Playwright tests verify navigation functionality works correctly