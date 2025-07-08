#!/bin/bash

# TixApp iOS Device Deployment Script
# This script builds and deploys to a physical iOS device

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to detect connected iOS devices
detect_ios_devices() {
    print_status "Detecting connected iOS devices..."
    
    # Try iOS 17+ devicectl first
    if command -v xcrun &> /dev/null && xcrun devicectl list devices 2>/dev/null | grep -q "available"; then
        print_status "Found devices via devicectl (iOS 17+):"
        xcrun devicectl list devices | grep -E "(Name|iPad|iPhone)" | grep -v "Identifier"
        
        # Get device identifier
        local device_id=$(xcrun devicectl list devices | grep "available" | head -n 1 | awk '{print $3}')
        echo "$device_id"
        return 0
    fi
    
    # Fallback to ios-deploy
    if command -v ios-deploy &> /dev/null; then
        print_status "Found devices via ios-deploy:"
        ios-deploy --detect
        
        # Get device identifier
        local device_id=$(ios-deploy --detect | grep "Found" | head -n 1 | sed 's/.*(\([^)]*\)).*/\1/')
        echo "$device_id"
        return 0
    fi
    
    print_error "No iOS device detection tools available"
    return 1
}

# Function to build iOS app for device
build_ios_for_device() {
    print_status "Building iOS app for device deployment..."
    
    # Use device build script
    if npm run ios:build-device; then
        print_success "iOS app built successfully for device"
    else
        print_error "Failed to build iOS app for device"
        exit 1
    fi
}

# Function to deploy to device using ios-deploy
deploy_with_ios_deploy() {
    local device_id=$1
    
    print_status "Deploying to device using ios-deploy..."
    
    # Find the built app
    local app_path=$(find ~/Library/Developer/Xcode/DerivedData -name "App.app" -path "*/Debug-iphoneos/*" | head -n 1)
    
    if [ -z "$app_path" ]; then
        print_error "Could not find built app for device. Make sure to build for iOS device first."
        exit 1
    fi
    
    print_status "Found app at: $app_path"
    
    # Deploy and launch
    if [ -n "$device_id" ]; then
        print_status "Deploying to device: $device_id"
        ios-deploy --id "$device_id" --bundle "$app_path" --debug --no-wifi
    else
        print_status "Deploying to first available device"
        ios-deploy --bundle "$app_path" --debug --no-wifi
    fi
}

# Function to deploy using devicectl (iOS 17+)
deploy_with_devicectl() {
    local device_id=$1
    
    print_status "Deploying to device using devicectl (iOS 17+)..."
    
    # Find the built app
    local app_path=$(find ~/Library/Developer/Xcode/DerivedData -name "App.app" -path "*/Debug-iphoneos/*" | head -n 1)
    
    if [ -z "$app_path" ]; then
        print_error "Could not find built app for device. Make sure to build for iOS device first."
        exit 1
    fi
    
    print_status "Found app at: $app_path"
    
    # Install the app
    if xcrun devicectl device install app --device "$device_id" "$app_path"; then
        print_success "App installed successfully"
        
        # Launch the app
        print_status "Launching TixApp..."
        xcrun devicectl device process launch --device "$device_id" com.tixapp.appeal || {
            print_warning "Failed to launch automatically. Please tap the TixApp icon on your device."
        }
    else
        print_error "Failed to install app"
        exit 1
    fi
}

# Main function
main() {
    echo "==================================================="
    echo "        TixApp iOS Device Deployment"
    echo "==================================================="
    
    # Check if device is connected
    print_status "Checking for connected iOS devices..."
    local device_id=$(detect_ios_devices)
    
    if [ -z "$device_id" ]; then
        print_error "No iOS device detected. Please connect your device and trust this computer."
        exit 1
    fi
    
    print_success "Device detected: $device_id"
    
    # Build the app
    build_ios_for_device
    
    # Deploy using appropriate method
    if command -v xcrun &> /dev/null && xcrun devicectl list devices 2>/dev/null | grep -q "available"; then
        deploy_with_devicectl "$device_id"
    else
        deploy_with_ios_deploy "$device_id"
    fi
    
    echo ""
    print_success "iOS app deployed successfully!"
    print_status "The TixApp should now be running on your device."
}

# Show help
show_help() {
    echo "TixApp iOS Device Deployment Script"
    echo ""
    echo "Usage:"
    echo "  $0                    # Deploy to first available device"
    echo "  $0 --help             # Show this help"
    echo ""
    echo "Prerequisites:"
    echo "  - iOS device connected via USB"
    echo "  - Device trusted in Xcode"
    echo "  - Valid development certificate"
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