#!/bin/bash

# TixApp Android Build and Run Script
# This script checks available Android emulators, builds the app, and runs it

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java not found. Please install JDK 11, 17, or 21"
        exit 1
    fi
    
    # Check Android SDK (try common locations if ANDROID_HOME not set)
    if [ -z "$ANDROID_HOME" ]; then
        # Try to find Android SDK in common locations
        local android_sdk_paths=(
            "$HOME/Library/Android/sdk"
            "$HOME/Android/Sdk"
            "/opt/android-sdk"
        )
        
        for sdk_path in "${android_sdk_paths[@]}"; do
            if [ -d "$sdk_path" ]; then
                export ANDROID_HOME="$sdk_path"
                export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"
                print_success "Found Android SDK at: $ANDROID_HOME"
                break
            fi
        done
        
        if [ -z "$ANDROID_HOME" ]; then
            print_error "Android SDK not found. Please set ANDROID_HOME or run: npm run android:check"
            exit 1
        fi
    fi
    
    # Check ADB
    if ! command -v adb &> /dev/null; then
        print_error "ADB not found in PATH"
        print_status "Add \$ANDROID_HOME/platform-tools to PATH"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to list available AVDs
list_android_avds() {
    print_status "Available Android Virtual Devices:"
    
    # Try emulator command first (most reliable)
    if command -v emulator &> /dev/null; then
        local avds=$(emulator -list-avds 2>/dev/null)
        if [ -n "$avds" ]; then
            echo "$avds" | while read -r avd; do
                if [ -n "$avd" ]; then
                    echo "  $avd"
                fi
            done
            return 0
        fi
    fi
    
    # Fallback to avdmanager
    if command -v avdmanager &> /dev/null; then
        local avds=$(avdmanager list avd 2>/dev/null | grep "Name:" | cut -d: -f2 | xargs)
        if [ -n "$avds" ]; then
            echo "$avds" | tr ' ' '\n' | while read -r avd; do
                if [ -n "$avd" ]; then
                    echo "  $avd"
                fi
            done
            return 0
        fi
    elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" ]; then
        local avds=$("$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" list avd 2>/dev/null | grep "Name:" | cut -d: -f2 | xargs)
        if [ -n "$avds" ]; then
            echo "$avds" | tr ' ' '\n' | while read -r avd; do
                if [ -n "$avd" ]; then
                    echo "  $avd"
                fi
            done
            return 0
        fi
    fi
    
    print_warning "No AVDs found or AVD Manager not accessible"
    print_status "Create AVDs using Android Studio AVD Manager"
    return 1
}

# Function to get the best available AVD
get_best_android_avd() {
    local avd_name=""
    
    # Try emulator command first (most reliable)
    if command -v emulator &> /dev/null; then
        avd_name=$(emulator -list-avds 2>/dev/null | head -n 1)
    fi
    
    # Fallback to avdmanager if emulator didn't work
    if [ -z "$avd_name" ]; then
        if command -v avdmanager &> /dev/null; then
            avd_name=$(avdmanager list avd 2>/dev/null | grep "Name:" | head -n 1 | cut -d: -f2 | xargs)
        elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" ]; then
            avd_name=$("$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" list avd 2>/dev/null | grep "Name:" | head -n 1 | cut -d: -f2 | xargs)
        fi
    fi
    
    echo "$avd_name"
}

# Function to check if an emulator is running
is_emulator_running() {
    local running_devices=$(adb devices 2>/dev/null | grep -E "emulator-[0-9]+" | wc -l)
    [ "$running_devices" -gt 0 ]
}

# Function to start an Android emulator
start_android_emulator() {
    local avd_name=$1
    
    if [ -z "$avd_name" ]; then
        print_error "No AVD name provided"
        return 1
    fi
    
    print_status "Starting Android emulator: $avd_name"
    
    if command -v emulator &> /dev/null; then
        # Start emulator in background
        nohup emulator -avd "$avd_name" > /dev/null 2>&1 &
        local emulator_pid=$!
        
        print_status "Emulator starting (PID: $emulator_pid)..."
        print_status "Waiting for emulator to boot (this may take several minutes)..."
        
        # Wait for emulator to be ready
        local timeout=300 # 5 minutes
        local elapsed=0
        
        while [ $elapsed -lt $timeout ]; do
            if adb devices 2>/dev/null | grep -q "device"; then
                print_success "Emulator is ready!"
                return 0
            fi
            sleep 5
            elapsed=$((elapsed + 5))
            printf "."
        done
        
        echo ""
        print_error "Emulator failed to start within $timeout seconds"
        return 1
    else
        print_error "Emulator command not found"
        return 1
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
sync_capacitor_android() {
    print_status "Syncing Capacitor Android project..."
    if npx cap sync android; then
        print_success "Capacitor sync completed"
    else
        print_error "Failed to sync Capacitor"
        exit 1
    fi
}

# Function to build Android app
build_android_app() {
    print_status "Building Android app..."
    
    cd android
    
    if [ -f "./gradlew" ]; then
        print_status "Running Gradle build (this may take a few minutes on first build)..."
        # Use gtimeout if available (macOS with coreutils), otherwise regular timeout
        local timeout_cmd="timeout"
        if command -v gtimeout &> /dev/null; then
            timeout_cmd="gtimeout"
        elif ! command -v timeout &> /dev/null; then
            # No timeout available, run without timeout
            timeout_cmd=""
        fi
        
        if [ -n "$timeout_cmd" ]; then
            if $timeout_cmd 600 ./gradlew assembleDebug; then
                print_success "Android app built successfully"
            else
                print_warning "Build may have timed out or failed"
                # Check if APK was actually created
                if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
                    print_success "APK found despite timeout - build appears successful"
                else
                    print_error "Failed to build Android app"
                    cd ..
                    exit 1
                fi
            fi
        else
            # Run without timeout
            if ./gradlew assembleDebug; then
                print_success "Android app built successfully"
            else
                print_error "Failed to build Android app"
                cd ..
                exit 1
            fi
        fi
    else
        print_error "Gradle wrapper not found"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Function to install and launch app
install_and_launch_android_app() {
    print_status "Installing and launching app on Android emulator..."
    
    # Check if emulator is still running
    if ! is_emulator_running; then
        print_error "Emulator is no longer running. Starting it again..."
        local target_avd=$(get_best_android_avd)
        start_android_emulator "$target_avd"
    fi
    
    # Find the built APK
    local apk_path="android/app/build/outputs/apk/debug/app-debug.apk"
    
    if [ -f "$apk_path" ]; then
        print_status "Installing APK: $apk_path"
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
        exit 1
    fi
}

# Function to add Android platform if not exists
ensure_android_platform() {
    if [ ! -d "android/app" ] || [ ! -f "android/build.gradle" ]; then
        print_status "Android platform not found or incomplete. Adding Android platform..."
        # Try sync first (in case platform is configured but files missing)
        if npx cap sync android 2>/dev/null || npx cap add android; then
            print_success "Android platform created successfully"
        else
            print_error "Failed to create Android platform"
            exit 1
        fi
    fi
}

# Main function
main() {
    echo "==================================================="
    echo "        TixApp Android Build & Run Script"
    echo "==================================================="
    
    # Check prerequisites
    check_prerequisites
    
    # Ensure Android platform exists
    ensure_android_platform
    
    # Show available AVDs
    echo ""
    list_android_avds
    echo ""
    
    # Get target AVD
    local target_avd=""
    
    if [ -n "$1" ]; then
        # Use provided AVD name
        target_avd="$1"
        print_status "Using provided AVD: $target_avd"
    else
        # Auto-detect best AVD
        target_avd=$(get_best_android_avd)
        if [ -z "$target_avd" ]; then
            print_error "No Android Virtual Devices found"
            print_warning "Please create an AVD using Android Studio"
            print_status "Or specify AVD name: $0 [AVD_NAME]"
            exit 1
        fi
        print_status "Auto-detected AVD: $target_avd"
    fi
    
    # Check if emulator is already running
    if is_emulator_running; then
        print_success "Android emulator is already running"
    else
        # Start emulator
        start_android_emulator "$target_avd"
    fi
    
    # Build web assets
    build_web_assets
    
    # Sync Capacitor
    sync_capacitor_android
    
    # Build Android app
    build_android_app
    
    # Install and launch app
    install_and_launch_android_app
    
    echo ""
    print_success "Android app is now running on the emulator!"
    print_status "The TixApp should appear on the emulator screen."
}

# Help function
show_help() {
    echo "TixApp Android Build & Run Script"
    echo ""
    echo "Usage:"
    echo "  $0                    # Auto-detect and use first available AVD"
    echo "  $0 [AVD_NAME]         # Use specific AVD"
    echo "  $0 --list             # List available AVDs"
    echo "  $0 --help             # Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Auto-run"
    echo "  $0 'Pixel_7_API_34'                  # Specific AVD"
    echo ""
    echo "Prerequisites:"
    echo "  - Android Studio with SDK installed"
    echo "  - ANDROID_HOME environment variable set"
    echo "  - At least one Android Virtual Device (AVD) created"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --list|-l)
        list_android_avds
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac