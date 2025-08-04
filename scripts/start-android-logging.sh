#!/bin/bash

# TixApp Android Logging Script
# Starts comprehensive Android log monitoring for debugging

LOG_DIR="logs/android"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "==============================================="
echo "     TixApp Android Logging Session"
echo "==============================================="
echo "Starting Android logging session: $TIMESTAMP"

# Clear existing logs
echo "Clearing Android logs..."
adb logcat -c

# Start comprehensive logging to file
echo "Starting comprehensive logging..."
adb logcat -v threadtime > "$LOG_DIR/full-$TIMESTAMP.log" &
LOGCAT_PID=$!

# Save PID for cleanup
echo "$LOGCAT_PID" > "$LOG_DIR/logcat.pid"

echo ""
echo "✅ Logging started successfully!"
echo "📁 Log file: $LOG_DIR/full-$TIMESTAMP.log"
echo "🔧 Process ID: $LOGCAT_PID"
echo ""
echo "To monitor in real-time:"
echo "   tail -f $LOG_DIR/full-$TIMESTAMP.log | grep -E '(TixApp|Console|ERROR)'"
echo ""
echo "To stop logging:"
echo "   ./scripts/stop-android-logging.sh"
echo ""
echo "Useful monitoring commands:"
echo "   # TixApp specific logs"
echo "   tail -f $LOG_DIR/full-$TIMESTAMP.log | grep -E 'Console.*TixApp'"
echo ""
echo "   # API related logs"  
echo "   tail -f $LOG_DIR/full-$TIMESTAMP.log | grep -E 'extract-ticket|CapacitorHttp'"
echo ""
echo "   # Error logs"
echo "   tail -f $LOG_DIR/full-$TIMESTAMP.log | grep -E 'ERROR|Error|error'"
echo ""
echo "==============================================="