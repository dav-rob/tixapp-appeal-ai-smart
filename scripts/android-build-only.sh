#!/bin/bash

# TixApp Android Build-Only Script
# This script builds the APK without running it on an emulator
# Perfect for side-loading onto real devices

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
    
    print_success "Prerequisites check passed"
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
    print_status "Building Android APK..."
    
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
                print_success "Android APK built successfully"
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
                print_success "Android APK built successfully"
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
    
    # Check if Docutain configuration is applied
    if [ -f "android/gradle.properties" ]; then
        if ! grep -q "android.enableJetifier" "android/gradle.properties"; then
            print_status "Applying Docutain SDK configuration..."
            if ./scripts/android-setup-docutain.sh; then
                print_success "Docutain configuration applied successfully"
            else
                print_error "Failed to apply Docutain configuration"
                exit 1
            fi
        fi
    fi
}

# Function to show APK location and next steps
show_build_results() {
    local apk_path="android/app/build/outputs/apk/debug/app-debug.apk"
    
    if [ -f "$apk_path" ]; then
        echo ""
        echo "==========================================="
        echo "           BUILD SUCCESSFUL!"
        echo "==========================================="
        echo ""
        print_success "APK built and ready for side-loading!"
        echo ""
        echo "📱 APK Location:"
        echo "   $(pwd)/$apk_path"
        echo ""
        echo "📲 To side-load on your Android device:"
        echo "   1. Enable 'Developer Options' on your phone"
        echo "   2. Enable 'USB Debugging' in Developer Options"
        echo "   3. Connect your phone via USB"
        echo "   4. Transfer the APK file to your phone"
        echo "   5. Install the APK using your phone's file manager"
        echo ""
        echo "🔧 Alternative: Use ADB to install directly:"
        echo "   adb install -r $apk_path"
        echo ""
        echo "💡 Note: You may need to allow 'Install from Unknown Sources'"
        echo "   for your file manager or enable 'Install Unknown Apps'"
        echo ""
        
        # Show file size
        if command -v ls &> /dev/null; then
            local file_size=$(ls -lh "$apk_path" | awk '{print $5}')
            echo "📊 APK Size: $file_size"
        fi
        
        echo ""
    else
        print_error "APK not found at: $apk_path"
        print_error "Build may have failed"
        exit 1
    fi
}

# Main function
main() {
    echo "==================================================="
    echo "        TixApp Android Build-Only Script"
    echo "        (For Side-loading to Real Devices)"
    echo "==================================================="
    
    # Check prerequisites
    check_prerequisites
    
    # Ensure Android platform exists
    ensure_android_platform
    
    # Build web assets
    build_web_assets
    
    # Sync Capacitor
    sync_capacitor_android
    
    # Build Android app
    build_android_app
    
    # Show results and instructions
    show_build_results
}

# Help function
show_help() {
    echo "TixApp Android Build-Only Script"
    echo ""
    echo "This script builds an APK file for side-loading onto real Android devices."
    echo "It does NOT start or require an Android emulator."
    echo ""
    echo "Usage:"
    echo "  $0                    # Build APK for side-loading"
    echo "  $0 --help             # Show this help"
    echo ""
    echo "Output:"
    echo "  - APK file: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "Prerequisites:"
    echo "  - Android Studio with SDK installed"
    echo "  - ANDROID_HOME environment variable set"
    echo "  - Java JDK 11, 17, or 21"
    echo ""
    echo "For side-loading instructions, run the script to see detailed steps."
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac