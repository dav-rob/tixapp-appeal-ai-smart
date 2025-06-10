#!/bin/bash

# TixApp iOS Quick Redeploy Script
# This script quickly rebuilds and redeploys to an already running simulator

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

# Function to find running simulators
find_running_simulator() {
    local running_sim=$(xcrun simctl list devices | grep "Booted" | grep "iPhone" | head -n 1)
    if [ -n "$running_sim" ]; then
        # Extract simulator ID
        echo "$running_sim" | sed -n 's/.*(\([A-F0-9-]*\)).*/\1/p'
    fi
}

# Function to get simulator info by ID
get_simulator_info() {
    local sim_id=$1
    xcrun simctl list devices | grep "$sim_id" | head -n 1
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

# Function to install and launch app
install_and_launch() {
    local sim_id=$1
    
    print_status "Finding built app..."
    local app_path=$(find ~/Library/Developer/Xcode/DerivedData -name "App.app" -path "*/Debug-iphonesimulator/*" | head -n 1)
    
    if [ -n "$app_path" ]; then
        print_status "Installing app: $(basename "$app_path")"
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
            exit 1
        fi
    else
        print_error "Could not find built app bundle"
        print_warning "You may need to run a full build first: npm run ios"
        exit 1
    fi
}

# Main function
main() {
    print_header "TixApp iOS Quick Redeploy"
    
    # Check if a simulator is running
    local sim_id=$(find_running_simulator)
    
    if [ -z "$sim_id" ]; then
        print_error "No iPhone simulator is currently running"
        print_status "Please start a simulator first:"
        print_status "  npm run ios              # Full build and run"
        print_status "  open -a Simulator        # Just open Simulator app"
        exit 1
    fi
    
    local sim_info=$(get_simulator_info "$sim_id")
    print_success "Found running simulator: $sim_info"
    
    # Build web assets
    build_web_assets
    
    # Sync Capacitor
    sync_capacitor
    
    # Install and launch
    install_and_launch "$sim_id"
    
    echo ""
    print_success "Quick redeploy completed!"
    print_status "Your changes should now be visible in the simulator."
    echo ""
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "TixApp iOS Quick Redeploy Script"
        echo ""
        echo "This script quickly rebuilds and redeploys your app to an already running iOS simulator."
        echo ""
        echo "Prerequisites:"
        echo "  - iOS Simulator must already be running"
        echo "  - App must have been built at least once before"
        echo ""
        echo "Usage:"
        echo "  $0                    # Quick redeploy to running simulator"
        echo "  $0 --help            # Show this help"
        echo ""
        echo "What this script does:"
        echo "  1. Finds the running iPhone simulator"
        echo "  2. Builds web assets (npm run build)"
        echo "  3. Syncs Capacitor iOS project"
        echo "  4. Installs and launches updated app"
        echo ""
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac