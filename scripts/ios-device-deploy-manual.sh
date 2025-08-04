#!/bin/bash

# TixApp iOS Manual Device Deployment Script
# Simple, reliable deployment using ios-deploy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Function to find the built app
find_built_app() {
    print_status "Looking for built iOS device app..."
    
    local app_path=$(find ~/Library/Developer/Xcode/DerivedData -name "App.app" -path "*/Debug-iphoneos/*" | head -n 1)
    
    if [ -z "$app_path" ]; then
        print_error "Could not find built app for device."
        print_status "Make sure to run: npm run ios:build-device"
        exit 1
    fi
    
    print_success "Found app at: $app_path"
    echo "$app_path"
}

# Main deployment function
deploy_to_device() {
    local app_path=$(find_built_app)
    
    print_status "Deploying to iOS device using ios-deploy..."
    print_status "This will install and launch the app on your connected device"
    
    # Deploy with timeout and no WiFi (USB only)
    if ios-deploy --bundle "$app_path" --debug --no-wifi --timeout 60; then
        print_success "App deployed successfully!"
    else
        print_error "Deployment failed. Make sure:"
        echo "  - Your device is connected via USB"
        echo "  - Your device is unlocked and trusted"
        echo "  - You have a valid development certificate"
        exit 1
    fi
}

# Main function
main() {
    echo "==================================================="
    echo "      TixApp iOS Manual Device Deployment"
    echo "==================================================="
    
    deploy_to_device
    
    echo ""
    print_success "TixApp is now running on your device!"
    print_status "Use Safari Web Inspector for debugging:"
    print_status "Safari → Develop → [Your Device] → TixApp"
}

# Show help
show_help() {
    echo "TixApp iOS Manual Device Deployment"
    echo ""
    echo "Usage:"
    echo "  $0                    # Deploy to connected device"
    echo "  $0 --help             # Show this help"
    echo ""
    echo "Prerequisites:"
    echo "  - Run 'npm run ios:build-device' first"
    echo "  - iOS device connected via USB"
    echo "  - Device trusted and unlocked"
    echo ""
    echo "This script automatically finds the built app and deploys it"
    echo "using ios-deploy with reliable settings."
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