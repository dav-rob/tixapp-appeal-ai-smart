#!/bin/bash

# TixApp Android Quick Redeploy Script
# This script quickly rebuilds and redeploys to an already running Android emulator

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}=== $1 ===${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Android emulator is running
is_emulator_running() {
    # Ensure ADB is available
    if ! command -v adb &> /dev/null; then
        # Try to find Android SDK if not in PATH
        if [ -z "$ANDROID_HOME" ]; then
            local android_sdk_paths=(
                "$HOME/Library/Android/sdk"
                "$HOME/Android/Sdk"
            )
            for sdk_path in "${android_sdk_paths[@]}"; do
                if [ -d "$sdk_path" ]; then
                    export ANDROID_HOME="$sdk_path"
                    export PATH="$PATH:$ANDROID_HOME/platform-tools"
                    break
                fi
            done
        fi
    fi
    
    if command -v adb &> /dev/null; then
        local running_devices=$(adb devices 2>/dev/null | grep -E "emulator-[0-9]+" | wc -l)
        [ "$running_devices" -gt 0 ]
    else
        false
    fi
}

# Function to get running emulator info
get_running_emulator_info() {
    if command -v adb &> /dev/null; then
        adb devices 2>/dev/null | grep -E "emulator-[0-9]+" | head -n 1
    fi
}

# Function to build web assets
build_web_assets() {
    print_status "Building web assets..."
    if npm run build; then
        print_success "Web assets built successfully"
    else
        print_error "Failed to build web assets"
        exit 1
    fi
}

# Function to sync Capacitor
sync_capacitor() {
    print_status "Syncing Capacitor Android project..."
    if npx cap sync android; then
        print_success "Capacitor sync completed"
    else
        print_error "Failed to sync Capacitor"
        exit 1
    fi
}

# Function to install and launch app
install_and_launch() {
    print_status "Finding built APK..."
    local apk_path="android/app/build/outputs/apk/debug/app-debug.apk"
    
    if [ -f "$apk_path" ]; then
        print_status "Installing app: $(basename "$apk_path")"
        if adb install -r "$apk_path"; then
            print_success "App installed successfully"
            
            # Launch the app
            print_status "Launching TixApp..."
            if adb shell am start -n "com.tixapp.appeal/.MainActivity"; then
                print_success "TixApp launched successfully!"
            else
                print_warning "App installed but failed to launch automatically"
                print_status "You can manually tap the TixApp icon on the emulator"
            fi
        else
            print_error "Failed to install app"
            exit 1
        fi
    else
        print_error "APK not found at: $apk_path"
        print_warning "You may need to run a full build first: npm run android"
        exit 1
    fi
}

# Main function
main() {
    print_header "TixApp Android Quick Redeploy"
    
    # Check if Android emulator is running
    if ! is_emulator_running; then
        print_error "No Android emulator is currently running"
        print_status "Please start an emulator first:"
        print_status "  npm run android             # Full build and run"
        print_status "  emulator -avd [AVD_NAME]    # Just start emulator"
        exit 1
    fi
    
    local emulator_info=$(get_running_emulator_info)
    print_success "Found running emulator: $emulator_info"
    
    # Check if Android platform exists
    if [ ! -d "android" ]; then
        print_error "Android platform not found"
        print_status "Add Android platform first: npx cap add android"
        exit 1
    fi
    
    # Build web assets
    build_web_assets
    
    # Sync Capacitor
    sync_capacitor
    
    # Install and launch
    install_and_launch
    
    echo ""
    print_success "Quick redeploy completed!"
    print_status "Your changes should now be visible in the emulator."
    echo ""
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "TixApp Android Quick Redeploy Script"
        echo ""
        echo "This script quickly rebuilds and redeploys your app to an already running Android emulator."
        echo ""
        echo "Prerequisites:"
        echo "  - Android emulator must already be running"
        echo "  - App must have been built at least once before"
        echo "  - Android platform must be added to project"
        echo ""
        echo "Usage:"
        echo "  $0                    # Quick redeploy to running emulator"
        echo "  $0 --help            # Show this help"
        echo ""
        echo "What this script does:"
        echo "  1. Checks for running Android emulator"
        echo "  2. Builds web assets (npm run build)"
        echo "  3. Syncs Capacitor Android project"
        echo "  4. Installs and launches updated app"
        echo ""
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac