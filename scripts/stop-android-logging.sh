#!/bin/bash

# TixApp Android Logging Stop Script
# Stops Android log monitoring and provides analysis summary

LOG_DIR="logs/android"
PID_FILE="$LOG_DIR/logcat.pid"

echo "==============================================="
echo "     Stopping TixApp Android Logging"
echo "==============================================="

if [ -f "$PID_FILE" ]; then
    LOGCAT_PID=$(cat "$PID_FILE")
    echo "Stopping logcat process: $LOGCAT_PID"
    
    if kill $LOGCAT_PID 2>/dev/null; then
        echo "✅ Logcat process stopped successfully"
    else
        echo "⚠️  Process already stopped or not found"
    fi
    
    rm "$PID_FILE"
else
    echo "⚠️  No PID file found. Attempting to kill all logcat processes..."
    pkill -f "adb logcat" || echo "No logcat processes found"
fi

# Find the most recent log file
LATEST_LOG=$(ls -t "$LOG_DIR"/full-*.log 2>/dev/null | head -1)

if [ -f "$LATEST_LOG" ]; then
    echo ""
    echo "📊 Log Analysis Summary:"
    echo "📁 Latest log file: $LATEST_LOG"
    echo "📏 Log file size: $(du -h "$LATEST_LOG" | cut -f1)"
    echo "📝 Total lines: $(wc -l < "$LATEST_LOG")"
    echo ""
    
    # Quick analysis
    echo "🔍 Quick Analysis:"
    TIXAPP_LOGS=$(grep -c "TixApp\|Console" "$LATEST_LOG" 2>/dev/null || echo "0")
    API_LOGS=$(grep -c "extract-ticket\|CapacitorHttp" "$LATEST_LOG" 2>/dev/null || echo "0") 
    ERROR_LOGS=$(grep -c "ERROR\|Error" "$LATEST_LOG" 2>/dev/null || echo "0")
    
    echo "   • TixApp related logs: $TIXAPP_LOGS"
    echo "   • API related logs: $API_LOGS"
    echo "   • Error logs: $ERROR_LOGS"
    echo ""
    
    echo "📋 Useful analysis commands:"
    echo "   # View TixApp logs only"
    echo "   grep -E '(TixApp|Console)' \"$LATEST_LOG\""
    echo ""
    echo "   # View API logs only"
    echo "   grep -E '(extract-ticket|CapacitorHttp)' \"$LATEST_LOG\""
    echo ""
    echo "   # View errors only"
    echo "   grep -E '(ERROR|Error)' \"$LATEST_LOG\""
    echo ""
    echo "   # View recent logs (last 50 lines)"
    echo "   tail -50 \"$LATEST_LOG\""
else
    echo "⚠️  No log files found in $LOG_DIR"
fi

echo "==============================================="