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
- `npm run ios:build` - Build iOS app without running simulator (build-only mode)
- `npm run ios:pre-build` - **Prepare project for Xcode manual build (web assets + sync + pod install)**
- `npm run ios:check` - Check iOS development environment and available simulators
- `npm run ios:list` - List all available iOS simulators and runtimes
- `npm run ios:sync` - Sync Capacitor iOS project with latest web build
- `npm run ios:open` - Open iOS project in Xcode
- `./scripts/ios-build-run.sh [SIMULATOR_ID]` - Run with specific simulator ID
- `./scripts/ios-check.sh` - Detailed iOS environment diagnostics

**iOS Recommended Development Workflow:**
```sh
npm run ios           # Initial build + simulator, short time after simulator started
```

**Android Development:**
- `npm run android` - Build and run app in Android emulator (auto-selects best AVD)
- `npm run android:build` - **Build APK for side-loading to real devices (no emulator required)**
- `npm run android:setup` - **Apply Docutain SDK configuration (automatic in build commands)**
- `npm run android:check` - **Check Android development environment (run this first!)**
- `npm run android:list` - List all available Android Virtual Devices
- `npm run android:sync` - Sync Capacitor Android project with latest web build
- `npm run android:open` - Open Android project in Android Studio
- `./scripts/android-build-run.sh [AVD_NAME]` - Run with specific AVD
- `./scripts/android-check.sh` - Comprehensive Android environment diagnostics

**Android Recommended Development Flow:**
```sh
# For Emulator Testing:
# Recommended: Start emulator manually first
emulator -avd Pixel_7 &
npm run android           # Full build + install

# For Real Device Testing (Side-loading):
npm run android:build     # Build APK only, no emulator needed
# Then transfer APK to device and install
```

**Docutain SDK Configuration Management:**
- The Android platform folder (`android/`) is excluded from git but requires special configuration for Docutain SDK
- **Automatic Setup:** Build commands automatically apply Docutain configuration when needed
- **Manual Setup:** Run `npm run android:setup` if you need to apply configuration manually
- **Fresh Clone Setup:** After `git clone`, just run any build command - configuration is applied automatically
- **No Git Commits Required:** All Android configuration changes are applied via scripts, not committed files

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
- Android app configured with Capacitor 7.3.0
- Camera permissions configured for ticket scanning
- Platform directories (`ios/`, `android/`) are auto-generated when needed
- Scripts automatically run `npx cap add ios/android` if platforms missing
- Supports iOS 17.4+ and iOS 18.5+ simulators
- Supports Android API 21+ (Android 5.0+)
- Auto-detects best available simulators/emulators for testing

**iOS Development Workflow:**
```bash
# For Simulator Testing:
npm run ios                    # Full build + simulator launch (~5+ min first time)

# For Device Testing (Manual Xcode Build):
npm run ios:pre-build          # Prepare project for Xcode (web assets + sync + pod install)
npx cap open ios               # Open in Xcode, then build/deploy to device manually

```

**Android Development Workflow:**
```bash
# Environment check (first time setup)
npm run android:check         # Verify Android development environment

# RECOMMENDED: Manual emulator start for best reliability
emulator -avd Pixel_7 &       # Or use Android Studio AVD Manager

# Initial setup with pre-started emulator
npm run android               # Full build + install (auto-loads .bashrc)

# Development cycle (quick redeploy - works great!)
# 1. Make changes to React code in src/
# 2. Quick redeploy:
npm run android:redeploy      # Build + install + launch (auto-loads .bashrc)

# Repeat steps 1-2 as needed (keep emulator running)
```

**Android Environment Notes:**
- Scripts automatically load `.bashrc` environment variables (ANDROID_HOME, PATH)
- Auto-detects Android SDK in common locations if ANDROID_HOME not set
- Uses `emulator -list-avds` as primary AVD detection method
- Includes 10-minute timeout for Gradle builds to handle slower machines
- Wrapper scripts handle interactive bash requirements seamlessly
- **Best practice:** Start emulator manually first, then use scripts for build/deploy
- Emulator auto-start works but can timeout during long build processes

**Performance Notes:**
- iOS first run: ~5+ minutes (simulator startup is slowest part)
- iOS redeploy: ~10-15 seconds (simulator already running)
- Android first run: varies (emulator startup can be slow, recommend manual start)
- Android redeploy: ~10-15 seconds (when emulator already running)
- Keep simulators/emulators running during development for best speed
- Scripts auto-detect running devices and handle installation
- Android scripts work perfectly for build/deploy, manual emulator start recommended

**Development Notes:**
- Lovable.dev integration with component tagging in development mode
- Project uses npm (has both package-lock.json and bun.lockb, prefer npm)
- ESLint configured with React hooks and TypeScript rules
- Playwright tests verify navigation functionality works correctly