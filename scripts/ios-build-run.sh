#!/bin/bash

# TixApp iOS Build and Run Script
# This script checks available iOS simulators, builds the app, and runs it

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

# Function to check if Xcode is installed
check_xcode() {
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed or xcodebuild is not in PATH"
        exit 1
    fi
    
    local xcode_version=$(xcodebuild -version | head -n 1)
    print_status "Found: $xcode_version"
}

# Function to list available iOS runtimes
list_ios_runtimes() {
    print_status "Available iOS Runtimes:"
    xcrun simctl list runtimes | grep iOS | while read -r line; do
        echo "  $line"
    done
}

# Function to list available iOS simulators
list_ios_simulators() {
    print_status "Available iOS Simulators:"
    xcrun simctl list devices | grep -E "(iPhone|iPad)" | grep -v "unavailable" | while read -r line; do
        echo "  $line"
    done
}

# Function to get the best available iPhone simulator
get_best_iphone_simulator() {
    # Try to find iPhone 16, then iPhone 15, then iPhone 14, then any iPhone
    local simulator_id=""
    
    # First try iPhone 16 (latest)
    simulator_id=$(xcrun simctl list devices | grep "iPhone 16 (" | grep -v "unavailable" | head -n 1 | sed -n 's/.*(\([A-F0-9-]*\)).*/\1/p')
    
    # If not found, try iPhone 15
    if [ -z "$simulator_id" ]; then
        simulator_id=$(xcrun simctl list devices | grep "iPhone 15 (" | grep -v "unavailable" | head -n 1 | sed -n 's/.*(\([A-F0-9-]*\)).*/\1/p')
    fi
    
    # If not found, try iPhone 14
    if [ -z "$simulator_id" ]; then
        simulator_id=$(xcrun simctl list devices | grep "iPhone 14 (" | grep -v "unavailable" | head -n 1 | sed -n 's/.*(\([A-F0-9-]*\)).*/\1/p')
    fi
    
    # If still not found, try any iPhone
    if [ -z "$simulator_id" ]; then
        simulator_id=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -n 1 | sed -n 's/.*(\([A-F0-9-]*\)).*/\1/p')
    fi
    
    echo "$simulator_id"
}

# Function to get simulator info by ID
get_simulator_info() {
    local sim_id=$1
    xcrun simctl list devices | grep "$sim_id" | head -n 1
}

# Function to boot simulator if not already booted
boot_simulator() {
    local sim_id=$1
    local sim_info=$(get_simulator_info "$sim_id")
    
    if echo "$sim_info" | grep -q "Booted"; then
        print_status "Simulator already booted: $sim_info"
    else
        print_status "Booting simulator: $sim_info"
        xcrun simctl boot "$sim_id"
        print_success "Simulator booted successfully"
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
    print_status "Syncing Capacitor iOS project..."
    if npx cap sync ios; then
        print_success "Capacitor sync completed"
    else
        print_error "Failed to sync Capacitor"
        exit 1
    fi
}

# Function to build iOS app only
build_ios_only() {
    print_status "Building iOS app for generic iOS simulator..."
    
    # Change to iOS directory
    cd ios/App
    
    # Build the app for generic iOS simulator
    print_status "Building iOS app..."
    if xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination "generic/platform=iOS Simulator" build; then
        print_success "iOS app built successfully"
    else
        print_error "Failed to build iOS app"
        cd ../..
        exit 1
    fi
    
    cd ../..
}

# Function to build and run iOS app
build_and_run_ios() {
    local sim_id=$1
    local sim_info=$(get_simulator_info "$sim_id")
    
    print_status "Building and running iOS app on: $sim_info"
    
    # Change to iOS directory
    cd ios/App
    
    # Build the app
    print_status "Building iOS app..."
    if xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination "id=$sim_id" build; then
        print_success "iOS app built successfully"
    else
        print_error "Failed to build iOS app"
        cd ../..
        exit 1
    fi
    
    # Install and run the app
    print_status "Installing and launching app on simulator..."
    
    # Find the built app
    local app_path=$(find ~/Library/Developer/Xcode/DerivedData -name "App.app" -path "*/Debug-iphonesimulator/*" | head -n 1)
    
    if [ -n "$app_path" ]; then
        print_status "Installing app: $app_path"
        if xcrun simctl install "$sim_id" "$app_path"; then
            print_success "App installed successfully"
            
            # Launch the app
            print_status "Launching TixApp..."
            if xcrun simctl launch "$sim_id" com.tixapp.appeal; then
                print_success "TixApp launched successfully!"
            else
                print_warning "App installed but failed to launch automatically"
                print_status "You can manually tap the TixApp icon on the simulator"
            fi
        else
            print_error "Failed to install app"
            cd ../..
            exit 1
        fi
    else
        print_error "Could not find built app bundle"
        cd ../..
        exit 1
    fi
    
    cd ../..
}

# Function to add iOS platform if not exists
ensure_ios_platform() {
    if [ ! -d "ios/App" ] || [ ! -f "ios/App/Podfile" ]; then
        print_status "iOS platform not found or incomplete. Adding iOS platform..."
        # Try sync first (in case platform is configured but files missing)
        if npx cap sync ios 2>/dev/null || npx cap add ios; then
            print_success "iOS platform created successfully"
        else
            print_error "Failed to create iOS platform"
            exit 1
        fi
    fi
}

# Main function for build and run
main() {
    echo "==================================================="
    echo "          TixApp iOS Build & Run Script"
    echo "==================================================="
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_xcode
    
    # Ensure iOS platform exists
    ensure_ios_platform
    
    # Apply Docutain iOS configuration
    print_status "Applying Docutain iOS assets configuration..."
    if ./scripts/ios-setup-docutain.sh; then
        print_success "iOS assets configuration applied successfully"
    else
        print_warning "iOS assets configuration failed, continuing anyway..."
    fi
    
    # Show available runtimes and simulators
    echo ""
    list_ios_runtimes
    echo ""
    list_ios_simulators
    echo ""
    
    # Get target simulator
    local target_simulator=""
    
    if [ -n "$1" ]; then
        # Use provided simulator ID
        target_simulator="$1"
        print_status "Using provided simulator ID: $target_simulator"
    else
        # Auto-detect best simulator
        target_simulator=$(get_best_iphone_simulator)
        if [ -z "$target_simulator" ]; then
            print_error "No suitable iPhone simulator found"
            print_warning "Please install iOS simulators through Xcode"
            exit 1
        fi
        print_status "Auto-detected simulator: $(get_simulator_info "$target_simulator")"
    fi
    
    # Boot simulator
    boot_simulator "$target_simulator"
    
    # Open Simulator app
    print_status "Opening Simulator app..."
    open -a Simulator
    
    # Build web assets
    build_web_assets
    
    # Sync Capacitor
    sync_capacitor
    
    # Build and run iOS app
    build_and_run_ios "$target_simulator"
    
    echo ""
    print_success "iOS app is now running on the simulator!"
    print_status "The TixApp should appear on the simulator screen shortly."
}

# Main function for build only
main_build_only() {
    echo "==================================================="
    echo "          TixApp iOS Build-Only Script"
    echo "==================================================="
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_xcode
    
    # Ensure iOS platform exists
    ensure_ios_platform
    
    # Apply Docutain iOS configuration
    print_status "Applying Docutain iOS assets configuration..."
    if ./scripts/ios-setup-docutain.sh; then
        print_success "iOS assets configuration applied successfully"
    else
        print_warning "iOS assets configuration failed, continuing anyway..."
    fi
    
    # Build web assets
    build_web_assets
    
    # Sync Capacitor
    sync_capacitor
    
    # Build iOS app (no simulator needed)
    build_ios_only
    
    echo ""
    echo "==========================================="
    echo "           BUILD SUCCESSFUL!"
    echo "==========================================="
    echo ""
    print_success "iOS app built successfully!"
    print_status "App bundle created in Xcode DerivedData directory"
    print_status "You can now open the project in Xcode or run on a simulator manually"
}

# Help function
show_help() {
    echo "TixApp iOS Build & Run Script"
    echo ""
    echo "Usage:"
    echo "  $0                    # Auto-detect and use best available iPhone simulator"
    echo "  $0 [SIMULATOR_ID]     # Use specific simulator ID"
    echo "  $0 --build-only       # Build app without running simulator"
    echo "  $0 --list             # List available simulators"
    echo "  $0 --help             # Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                                                    # Auto-run on simulator"
    echo "  $0 --build-only                                       # Build only (no simulator)"
    echo "  $0 3B693B92-C655-44B3-933D-568F1BB41C45             # Specific simulator"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --build-only)
        main_build_only
        exit 0
        ;;
    --list|-l)
        list_ios_runtimes
        echo ""
        list_ios_simulators
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac