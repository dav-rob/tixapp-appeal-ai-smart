#!/bin/bash

# TixApp iOS Device Logging Script
# This script starts capturing iOS device logs with timestamps

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

# Create logs directory if it doesn't exist
LOG_DIR="logs/ios"
mkdir -p "$LOG_DIR"

# Generate timestamp for this session
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Function to detect connected iOS devices
detect_ios_device() {
    # Try iOS 17+ devicectl first
    if command -v xcrun &> /dev/null && xcrun devicectl list devices 2>/dev/null | grep -q "available"; then
        local device_id=$(xcrun devicectl list devices | grep "available" | head -n 1 | awk '{print $3}')
        echo "$device_id"
        return 0
    fi
    
    # Fallback to ios-deploy
    if command -v ios-deploy &> /dev/null; then
        local device_id=$(ios-deploy --detect | grep "Found" | head -n 1 | sed 's/.*(\([^)]*\)).*/\1/')
        echo "$device_id"
        return 0
    fi
    
    return 1
}

# Function to start iOS 17+ logging
start_devicectl_logging() {
    local device_id=$1
    
    print_status "Starting iOS device logging (iOS 17+) for device: $device_id"
    
    # Start system log streaming
    xcrun devicectl device log stream --device "$device_id" > "$LOG_DIR/full-$TIMESTAMP.log" &
    local log_pid=$!
    
    # Store the PID for cleanup
    echo "$log_pid" > "$LOG_DIR/devicectl.pid"
    
    print_success "iOS device logging started (PID: $log_pid)"
    print_status "Log file: $LOG_DIR/full-$TIMESTAMP.log"
    
    # Start TixApp-specific log filtering
    xcrun devicectl device log stream --device "$device_id" --predicate 'process == "TixApp" OR subsystem CONTAINS "TixApp"' > "$LOG_DIR/tixapp-$TIMESTAMP.log" &
    local tixapp_pid=$!
    
    echo "$tixapp_pid" > "$LOG_DIR/tixapp.pid"
    
    print_success "TixApp-specific logging started (PID: $tixapp_pid)"
    print_status "TixApp log file: $LOG_DIR/tixapp-$TIMESTAMP.log"
}

# Function to start console log streaming (fallback)
start_console_logging() {
    local device_id=$1
    
    print_status "Starting iOS console logging for device: $device_id"
    
    # Use console tool to stream logs
    xcrun console --device "$device_id" > "$LOG_DIR/full-$TIMESTAMP.log" &
    local log_pid=$!
    
    # Store the PID for cleanup
    echo "$log_pid" > "$LOG_DIR/console.pid"
    
    print_success "iOS console logging started (PID: $log_pid)"
    print_status "Log file: $LOG_DIR/full-$TIMESTAMP.log"
}

# Function to start ios-deploy logging
start_ios_deploy_logging() {
    print_status "Starting iOS logging via ios-deploy..."
    
    # ios-deploy can capture logs during app deployment
    print_warning "ios-deploy logging requires app deployment. Use during deployment process."
    
    # For now, just create a placeholder
    touch "$LOG_DIR/ios-deploy-$TIMESTAMP.log"
    echo "# iOS Deploy logging session started at $(date)" > "$LOG_DIR/ios-deploy-$TIMESTAMP.log"
}

# Main function
main() {
    echo "==================================================="
    echo "        TixApp iOS Device Logging"
    echo "==================================================="
    
    # Check if device is connected
    print_status "Detecting connected iOS device..."
    local device_id=$(detect_ios_device)
    
    if [ -z "$device_id" ]; then
        print_error "No iOS device detected. Please connect your device and trust this computer."
        exit 1
    fi
    
    print_success "Device detected: $device_id"
    
    # Check iOS version and use appropriate logging method
    if command -v xcrun &> /dev/null && xcrun devicectl list devices 2>/dev/null | grep -q "available"; then
        print_status "Using iOS 17+ devicectl logging"
        start_devicectl_logging "$device_id"
    elif command -v xcrun &> /dev/null && xcrun console --help &> /dev/null; then
        print_status "Using console logging"
        start_console_logging "$device_id"
    else
        print_warning "Advanced logging not available, using basic ios-deploy logging"
        start_ios_deploy_logging
    fi
    
    echo ""
    print_success "iOS logging session started successfully!"
    print_status "Session timestamp: $TIMESTAMP"
    print_status "Log directory: $LOG_DIR"
    echo ""
    print_status "To stop logging, run: ./scripts/stop-ios-logging.sh"
    echo ""
    print_status "Key log analysis commands:"
    echo "  - Full logs: tail -f $LOG_DIR/full-$TIMESTAMP.log"
    echo "  - TixApp logs: tail -f $LOG_DIR/tixapp-$TIMESTAMP.log"
    echo "  - Search logs: grep 'TixApp' $LOG_DIR/full-$TIMESTAMP.log"
    echo "  - API calls: grep 'extract-ticket' $LOG_DIR/full-$TIMESTAMP.log"
    echo ""
}

# Show help
show_help() {
    echo "TixApp iOS Device Logging Script"
    echo ""
    echo "Usage:"
    echo "  $0                    # Start logging for connected device"
    echo "  $0 --help             # Show this help"
    echo ""
    echo "Prerequisites:"
    echo "  - iOS device connected via USB"
    echo "  - Device trusted in Xcode"
    echo ""
    echo "Output:"
    echo "  - logs/ios/full-TIMESTAMP.log      # All device logs"
    echo "  - logs/ios/tixapp-TIMESTAMP.log    # TixApp-specific logs"
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