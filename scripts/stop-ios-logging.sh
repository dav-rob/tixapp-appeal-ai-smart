#!/bin/bash

# TixApp iOS Device Logging Stop Script
# This script stops iOS device logging and provides analysis

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

LOG_DIR="logs/ios"

# Function to stop logging processes
stop_logging() {
    print_status "Stopping iOS logging processes..."
    
    # Stop devicectl logging
    if [ -f "$LOG_DIR/devicectl.pid" ]; then
        local pid=$(cat "$LOG_DIR/devicectl.pid")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            print_success "Stopped devicectl logging (PID: $pid)"
        fi
        rm -f "$LOG_DIR/devicectl.pid"
    fi
    
    # Stop TixApp-specific logging
    if [ -f "$LOG_DIR/tixapp.pid" ]; then
        local pid=$(cat "$LOG_DIR/tixapp.pid")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            print_success "Stopped TixApp logging (PID: $pid)"
        fi
        rm -f "$LOG_DIR/tixapp.pid"
    fi
    
    # Stop console logging
    if [ -f "$LOG_DIR/console.pid" ]; then
        local pid=$(cat "$LOG_DIR/console.pid")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            print_success "Stopped console logging (PID: $pid)"
        fi
        rm -f "$LOG_DIR/console.pid"
    fi
    
    # Kill any remaining logging processes
    pkill -f "xcrun devicectl device log stream" 2>/dev/null || true
    pkill -f "xcrun console" 2>/dev/null || true
    
    print_success "All iOS logging processes stopped"
}

# Function to analyze logs
analyze_logs() {
    print_status "Analyzing iOS logs..."
    
    # Find most recent log files
    local latest_full_log=$(ls -t "$LOG_DIR"/full-*.log 2>/dev/null | head -n 1)
    local latest_tixapp_log=$(ls -t "$LOG_DIR"/tixapp-*.log 2>/dev/null | head -n 1)
    
    if [ -n "$latest_full_log" ]; then
        print_success "Latest full log: $latest_full_log"
        
        # Basic analysis
        local total_lines=$(wc -l < "$latest_full_log" 2>/dev/null || echo "0")
        print_status "Total log lines: $total_lines"
        
        # TixApp-specific analysis
        local tixapp_lines=$(grep -c "TixApp" "$latest_full_log" 2>/dev/null || echo "0")
        print_status "TixApp-related lines: $tixapp_lines"
        
        # API call analysis
        local api_calls=$(grep -c "extract_ticket\|CapacitorHttp" "$latest_full_log" 2>/dev/null || echo "0")
        print_status "API-related lines: $api_calls"
        
        # Error analysis
        local errors=$(grep -c -i "error\|exception\|crash" "$latest_full_log" 2>/dev/null || echo "0")
        print_status "Error-related lines: $errors"
        
        echo ""
        print_status "Quick analysis commands:"
        echo "  - View TixApp logs: grep 'TixApp' '$latest_full_log'"
        echo "  - View API calls: grep 'extract_ticket\\|CapacitorHttp' '$latest_full_log'"
        echo "  - View errors: grep -i 'error\\|exception' '$latest_full_log'"
        echo "  - View console logs: grep 'Console' '$latest_full_log'"
        echo ""
    fi
    
    if [ -n "$latest_tixapp_log" ]; then
        print_success "Latest TixApp log: $latest_tixapp_log"
        
        local tixapp_lines=$(wc -l < "$latest_tixapp_log" 2>/dev/null || echo "0")
        print_status "TixApp-specific lines: $tixapp_lines"
        
        if [ "$tixapp_lines" -gt "0" ]; then
            print_status "Recent TixApp activity:"
            tail -n 10 "$latest_tixapp_log" | while read -r line; do
                echo "  $line"
            done
        fi
        echo ""
    fi
}

# Function to list available log files
list_logs() {
    print_status "Available iOS log files:"
    
    if [ -d "$LOG_DIR" ]; then
        ls -la "$LOG_DIR"/*.log 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        print_warning "No log directory found at $LOG_DIR"
    fi
}

# Main function
main() {
    echo "==================================================="
    echo "        TixApp iOS Logging Stop & Analysis"
    echo "==================================================="
    
    # Stop logging processes
    stop_logging
    
    # Wait a moment for processes to fully stop
    sleep 2
    
    # Analyze logs
    analyze_logs
    
    # List available logs
    list_logs
    
    echo ""
    print_success "iOS logging session ended successfully!"
    print_status "Log files are preserved in: $LOG_DIR"
    echo ""
}

# Show help
show_help() {
    echo "TixApp iOS Logging Stop & Analysis Script"
    echo ""
    echo "Usage:"
    echo "  $0                    # Stop logging and analyze results"
    echo "  $0 --help             # Show this help"
    echo ""
    echo "This script:"
    echo "  - Stops all iOS logging processes"
    echo "  - Provides basic log analysis"
    echo "  - Lists available log files"
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