#!/bin/bash

# TixApp iOS Environment Checker
# This script checks iOS development environment and available simulators

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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check Xcode installation
check_xcode() {
    print_header "Xcode Environment"
    
    if command -v xcodebuild &> /dev/null; then
        local xcode_version=$(xcodebuild -version | head -n 1)
        local xcode_path=$(xcode-select -p)
        print_success "Xcode found: $xcode_version"
        print_info "Xcode path: $xcode_path"
        
        # Check if command line tools are installed
        if xcode-select -p &> /dev/null; then
            print_success "Command Line Tools installed"
        else
            print_warning "Command Line Tools may not be installed"
        fi
    else
        print_error "Xcode not found or xcodebuild not in PATH"
        return 1
    fi
}

# Check iOS Runtimes
check_ios_runtimes() {
    print_header "iOS Runtimes"
    
    local runtimes=$(xcrun simctl list runtimes | grep iOS)
    if [ -n "$runtimes" ]; then
        echo "$runtimes" | while read -r line; do
            if echo "$line" | grep -q "unavailable"; then
                print_warning "$line"
            else
                print_success "$line"
            fi
        done
    else
        print_error "No iOS runtimes found"
    fi
}

# Check iOS Simulators
check_ios_simulators() {
    print_header "iOS Simulators"
    
    # Group by iOS version
    xcrun simctl list devices | grep -E "== iOS|iPhone|iPad" | while read -r line; do
        if echo "$line" | grep -q "== iOS"; then
            echo ""
            print_info "$line"
        elif echo "$line" | grep -q "unavailable"; then
            print_warning "  $line"
        else
            if echo "$line" | grep -q "Booted"; then
                print_success "  $line (Currently Running)"
            else
                print_info "  $line"
            fi
        fi
    done
}

# Check Capacitor setup
check_capacitor() {
    print_header "Capacitor Setup"
    
    if [ -f "capacitor.config.ts" ]; then
        print_success "Capacitor config found"
        
        if [ -d "ios" ]; then
            print_success "iOS platform added"
            
            if [ -d "ios/App/App.xcworkspace" ]; then
                print_success "Xcode workspace exists"
            else
                print_warning "Xcode workspace not found"
            fi
        else
            print_warning "iOS platform not added"
        fi
    else
        print_error "Capacitor not initialized"
    fi
}

# Check Node.js and npm
check_node() {
    print_header "Node.js Environment"
    
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        print_success "Node.js: $node_version"
    else
        print_error "Node.js not found"
    fi
    
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        print_success "npm: $npm_version"
    else
        print_error "npm not found"
    fi
}

# Get recommended simulators
get_recommendations() {
    print_header "Recommendations"
    
    # Find best iPhone simulators
    local iphone_sims=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -3)
    if [ -n "$iphone_sims" ]; then
        print_info "Recommended iPhone simulators:"
        echo "$iphone_sims" | while read -r line; do
            local sim_id=$(echo "$line" | sed -n 's/.*(\([A-F0-9-]*\)).*/\1/p')
            if [ -n "$sim_id" ]; then
                echo "  ID: $sim_id"
                echo "    $line"
            fi
        done
    fi
    
    echo ""
    print_info "To run the app:"
    print_info "  npm run ios              # Auto-select best simulator"
    print_info "  npm run ios:check        # Run this check again"
    print_info "  ./scripts/ios-build-run.sh --list  # List all simulators"
    print_info "  ./scripts/ios-build-run.sh [ID]    # Use specific simulator"
}

# Main function
main() {
    echo "==================================================="
    echo "       TixApp iOS Environment Checker"
    echo "==================================================="
    echo ""
    
    check_node
    echo ""
    check_xcode
    echo ""
    check_capacitor
    echo ""
    check_ios_runtimes
    echo ""
    check_ios_simulators
    echo ""
    get_recommendations
    echo ""
}

main "$@"