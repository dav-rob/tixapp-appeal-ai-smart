#!/bin/bash

# TixApp Android Build-Only Wrapper Script
# This script handles the interactive bash requirement for environment variables

# Check if we're already in an interactive shell with proper environment
if [ -n "$ANDROID_HOME" ] && command -v java &> /dev/null; then
    # Environment is already set up, run the main script directly
    exec "$(dirname "$0")/android-build-only.sh" "$@"
else
    # Need to run in interactive mode to load .bashrc/.zshrc
    echo "Loading environment variables from shell profile..."
    
    # Determine the user's shell
    USER_SHELL=$(basename "$SHELL")
    
    # Run the main script in interactive mode
    exec bash -i -c "source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true; $(dirname "$0")/android-build-only.sh $*"
fi