# TixApp Frontend

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript  
- React
- shadcn/ui components
- Tailwind CSS
- Capacitor (mobile apps)

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
- `npm run ios:build` - Build iOS app for simulator (build-only mode)
- `npm run ios:build-device` - **Build iOS app for physical device deployment**
- `npm run ios:device` - **Deploy iOS app to connected physical device**
- `npm run ios:device-deploy` - **Manual device deployment (reliable ios-deploy method)** this script deploys to the first connected device it finds.
- `npm run ios:pre-build` - **Prepare project for Xcode manual build (web assets + sync + pod install)**
- `npm run ios:check` - Check iOS development environment and available simulators
- `npm run ios:list` - List all available iOS simulators and runtimes
- `npm run ios:sync` - Sync Capacitor iOS project with latest web build
- `npm run ios:open` - Open iOS project in Xcode
- `./scripts/ios-build-run.sh [SIMULATOR_ID]` - Run with specific simulator ID
- `./scripts/ios-check.sh` - Detailed iOS environment diagnostics

**iOS Recommended Development Workflow:**
```sh
# For Simulator Testing:
npm run ios           # Initial build + simulator, short time after simulator started

# For Physical Device Testing:
npm run ios:build-device && npm run ios:device-deploy    # Build + deploy to device
# Then use Safari Web Inspector for debugging
```

**Android Development:**
- `npm run android` - Build and run app in Android emulator (auto-selects best AVD)
- `npm run android:build` - **Build APK for side-loading to real devices (no emulator required)** use adb install -r android/app/build/outputs/apk/debug/app-debug.apk to deploy after the build.
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
- **Native Header Implementation:** Hybrid solution using native-optimized touch handling with React-based popups

**iOS Development Workflow:**
```bash
# For Simulator Testing:
npm run ios                    # Full build + simulator launch (~5+ min first time)

# For Device Testing (Command Line):
npm run ios:build-device       # Build for physical device (generic/platform=iOS)
npm run ios:device             # Deploy to connected device (or manual deployment)

# For Device Testing (Manual Xcode Build):
npm run ios:pre-build          # Prepare project for Xcode (web assets + sync + pod install)
npx cap open ios               # Open in Xcode, then build/deploy to device manually

```

**iOS Device Testing & Debugging Workflow:**

```bash
# 1. Build for device (not simulator)
npm run ios:build-device

# 2a. Deploy via script (may have devicectl issues)
npm run ios:device

# 2b. Manual deployment (reliable fallback)
npm run ios:device-deploy

# 3. Debug using Safari Web Inspector
# - Enable Web Inspector on iPad: Settings → Safari → Advanced → Web Inspector ON
# - Enable Develop menu on Mac: Safari → Preferences → Advanced → Show Develop menu
# - Connect iPad, open TixApp, then Safari → Develop → David's iPad → TixApp
# - Copy console logs to logs/ios/safari-console-logs.log for analysis

# 4. Test app functionality and analyze logs
# Safari Web Inspector shows all JavaScript console.log, API calls, and errors in real-time
```

**iOS Development Notes:**
- **Device vs Simulator**: Always use `npm run ios:build-device` for physical device deployment
- **Deployment Options**: 
  - `npm run ios:device` - Full deployment script (may have devicectl issues on iOS 17+)
  - `npm run ios:device-deploy` - Reliable manual deployment using ios-deploy (recommended)
- **Debugging**: Safari Web Inspector is the standard tool for iOS Capacitor app debugging
- **Logging**: JavaScript logs don't appear in system console - use Safari Web Inspector
- devicectl logging issues are common with iOS 17+ - Safari Web Inspector is preferred method

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

## Native Header Implementation

**Problem Solved:** Android header buttons (hamburger menu, title, profile) had poor touch responsiveness and status bar overlap issues.

**Solution Components:**
- `src/components/NativeButton.tsx` - Touch-optimized button component for mobile platforms
- `src/hooks/useNativeHeader.ts` - React hook for native platform detection and status bar configuration
- `src/components/Header.tsx` - Updated to use hybrid native/web approach
- `src/index.css` - Added CSS safe area support for Android/iOS status bars
- `capacitor.config.ts` - Enhanced Android touch capture and status bar configuration

**Key Features:**
- **Platform Detection:** Automatically uses native-optimized buttons on iOS/Android, falls back to web buttons on desktop
- **Touch Responsiveness:** Uses `onTouchStart/End` events for immediate response on mobile
- **Status Bar Support:** Proper safe area handling prevents header overlap with system UI
- **Visual Feedback:** Immediate press animations and state management
- **No Custom Native Code:** Pure web solution using Capacitor's standard APIs

**Plugins Added:**
- `@capacitor/app@7.0.1` - App lifecycle and back button handling
- `@capacitor/status-bar@7.0.1` - Native status bar styling and configuration
- `@capacitor/action-sheet@7.0.1` - Future native menu options

**Implementation Notes:**
- Web-based solution requires no native Swift/Kotlin code
- Platform directories (`ios/`, `android/`) remain auto-generated
- All customizations are in committed TypeScript/CSS files
- Solution is fully portable across development environments

## Android Testing & Debugging Workflow

**Standard procedure for testing Android changes with comprehensive logging:**

```bash
# 1. Start logging session in background (automatically continues)
./scripts/start-android-logging.sh &
# Script runs in background, Claude proceeds immediately to build

# 2a. Build APK (Claude reports completion)
npm run android:build
# ✅ Claude confirms: "BUILD COMPLETE! APK ready for installation."

# 2b. Install APK to device (Claude reports completion)  
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
# ✅ Claude confirms: "INSTALL COMPLETE! Launch the app on your device."

# 3. Test the app functionality on device
# (Perform scanning, API calls, modal interactions, etc.)
# User performs testing and reports results

# 4. Stop logging and analyze results
./scripts/stop-android-logging.sh

# 5. Analyze logs for specific issues
grep -E 'Console.*TixApp|extract-ticket|CapacitorHttp|ERROR' logs/android/full-[TIMESTAMP].log
```

**Key Analysis Commands:**
- `grep 'extract-ticket' logs/android/full-[TIMESTAMP].log` - Find API calls
- `grep -A 20 'Capacitor/Console.*TixApp' logs/android/full-[TIMESTAMP].log` - Find app console logs
- `grep 'formatTicketDataForDisplay\|Setting ticket data\|Opening modal' logs/android/full-[TIMESTAMP].log` - Find modal data flow

**Important Notes:**
- DO NOT use `tail -f` during testing - analyze logs after testing is complete
- Logs capture all console.log, API calls, and system events
- Each logging session creates timestamped files in `logs/android/`
- This workflow provides systematic debugging for mobile-specific issues

## Structured Logging with AppLogger

**AppLogger Class (`src/utils/logger.ts`)** provides consistent, structured logging across the application with proper JSON serialization for complex objects.

**Import and Usage:**
```typescript
import { AppLogger } from '@/utils/logger';

// In any component or service
```

**Available Methods:**

**General Logging:**
```typescript
AppLogger.debug('ComponentName', 'Debug message', optionalData);
AppLogger.info('ComponentName', 'Info message', optionalData);
AppLogger.warn('ComponentName', 'Warning message', optionalData);
AppLogger.error('ComponentName', 'Error message', errorObject);
```

**Specialized Logging:**
```typescript
// API calls - tracks request/response
AppLogger.api('TicketScanner', 'extract-ticket', requestData, responseData);

// Modal operations
AppLogger.modal('TicketModal', 'Opening modal with API data', modalData);
AppLogger.modal('TicketModal', 'useEffect triggered', { itemCount: data.length });

// State changes - tracks before/after values
AppLogger.state('TicketScanner', 'Setting ticket data', oldState, newState);
AppLogger.state('TicketModal', 'Updating modal data', currentData, newData);
```

**Examples from Components:**
```typescript
// TicketScanner.tsx
const apiResponse = await ticketExtractionService.extractTicketData(text);
AppLogger.api('TicketScanner', 'extract-ticket', { ocrTextLength: text.length }, apiResponse);

const formattedData = ticketExtractionService.formatTicketDataForDisplay(apiResponse);
AppLogger.state('TicketScanner', 'Formatted data for modal', undefined, {
  formattedDataLength: formattedData.length,
  fields: formattedData.map(f => ({ key: f.key, hasValue: !!f.value }))
});

// TicketModal.tsx
useEffect(() => {
  AppLogger.modal('TicketModal', `useEffect triggered - initialTicketData: ${initialTicketData?.length || 0} items`);
  
  if (initialTicketData && initialTicketData.length > 0) {
    AppLogger.state('TicketModal', 'Updating modal with new API data', 
      { currentLength: ticketData.length }, 
      { newLength: initialTicketData.length, fields: initialTicketData.map(f => f.key) }
    );
    setTicketData(initialTicketData);
  }
}, [initialTicketData]);
```

**Benefits:**
- **Structured Format:** `[LEVEL][TIMESTAMP][CONTEXT] message`
- **Safe Serialization:** Handles circular references and complex objects
- **Searchable Logs:** Easy to grep for specific components or operations
- **Consistent Timestamps:** ISO format for precise timing analysis
- **Context Aware:** Component/service name helps track data flow

## Development Guidelines

**When looking up Capacitor functionality, always search the context7 mcp "capacitorjs_com-docs" first.**


