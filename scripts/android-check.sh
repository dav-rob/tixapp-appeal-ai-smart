#!/bin/bash

# TixApp Android Environment Checker
# This script comprehensively checks Android development environment and identifies issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
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

print_action() {
    echo -e "${MAGENTA}[ACTION]${NC} $1"
}

# Check Java/JDK installation
check_java() {
    print_header "Java Development Kit (JDK)"
    
    if command -v java &> /dev/null; then
        local java_version=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}')
        print_success "Java found: $java_version"
        
        # Check if it's a supported version (JDK 11 or 17)
        local major_version=$(echo "$java_version" | cut -d'.' -f1)
        if [[ "$major_version" == "11" || "$major_version" == "17" || "$major_version" == "21" ]]; then
            print_success "Java version is compatible with Android development"
        else
            print_warning "Java version may not be optimal for Android (recommended: JDK 11, 17, or 21)"
        fi
        
        # Check JAVA_HOME
        if [ -n "$JAVA_HOME" ]; then
            print_success "JAVA_HOME set: $JAVA_HOME"
        else
            print_warning "JAVA_HOME environment variable not set"
            print_action "Set JAVA_HOME in your shell profile (.zshrc or .bash_profile)"
        fi
    else
        print_error "Java not found"
        print_action "Install JDK 11, 17, or 21 from https://adoptium.net/"
        return 1
    fi
}

# Check Android Studio installation
check_android_studio() {
    print_header "Android Studio"
    
    local android_studio_paths=(
        "/Applications/Android Studio.app"
        "/Applications/Android Studio Preview.app"
        "$HOME/Applications/Android Studio.app"
    )
    
    local found_studio=false
    for path in "${android_studio_paths[@]}"; do
        if [ -d "$path" ]; then
            print_success "Android Studio found: $path"
            found_studio=true
            
            # Try to get version info
            local version_file="$path/Contents/Resources/product-info.json"
            if [ -f "$version_file" ]; then
                local version=$(grep -o '"version":"[^"]*' "$version_file" | cut -d'"' -f4)
                if [ -n "$version" ]; then
                    print_info "Version: $version"
                fi
            fi
            break
        fi
    done
    
    if [ "$found_studio" = false ]; then
        print_error "Android Studio not found"
        print_action "Download and install Android Studio from https://developer.android.com/studio"
        return 1
    fi
}

# Check Android SDK
check_android_sdk() {
    print_header "Android SDK"
    
    # Check ANDROID_HOME
    if [ -n "$ANDROID_HOME" ]; then
        print_success "ANDROID_HOME set: $ANDROID_HOME"
        
        if [ -d "$ANDROID_HOME" ]; then
            print_success "Android SDK directory exists"
            
            # Check for important SDK components
            local sdk_tools_path="$ANDROID_HOME/tools"
            local platform_tools_path="$ANDROID_HOME/platform-tools"
            local platforms_path="$ANDROID_HOME/platforms"
            local build_tools_path="$ANDROID_HOME/build-tools"
            
            if [ -d "$platform_tools_path" ]; then
                print_success "Platform tools found"
                
                # Check adb
                if [ -f "$platform_tools_path/adb" ]; then
                    local adb_version=$("$platform_tools_path/adb" version 2>/dev/null | head -n 1)
                    print_success "ADB available: $adb_version"
                else
                    print_warning "ADB not found in platform-tools"
                fi
            else
                print_warning "Platform tools not found"
            fi
            
            if [ -d "$build_tools_path" ]; then
                print_success "Build tools found"
                local build_tools_versions=$(ls "$build_tools_path" 2>/dev/null | sort -V | tail -5)
                if [ -n "$build_tools_versions" ]; then
                    echo "$build_tools_versions" | while read -r version; do
                        print_info "  Build tools version: $version"
                    done
                fi
            else
                print_warning "Build tools not found"
                print_action "Install build tools via Android Studio SDK Manager"
            fi
            
            if [ -d "$platforms_path" ]; then
                print_success "Android platforms found"
                local platforms=$(ls "$platforms_path" 2>/dev/null | sort -V | tail -5)
                if [ -n "$platforms" ]; then
                    echo "$platforms" | while read -r platform; do
                        print_info "  Platform: $platform"
                    done
                fi
            else
                print_warning "Android platforms not found"
                print_action "Install Android platforms via Android Studio SDK Manager"
            fi
        else
            print_error "ANDROID_HOME directory does not exist: $ANDROID_HOME"
        fi
    else
        print_error "ANDROID_HOME not set"
        print_action "Set ANDROID_HOME to your Android SDK path"
        print_action "Common locations:"
        print_action "  ~/Library/Android/sdk"
        print_action "  ~/Android/Sdk"
        return 1
    fi
}

# Check PATH configuration
check_path_configuration() {
    print_header "PATH Configuration"
    
    # Check if Android tools are in PATH
    if command -v adb &> /dev/null; then
        local adb_path=$(which adb)
        print_success "ADB in PATH: $adb_path"
    else
        print_warning "ADB not in PATH"
        print_action "Add \$ANDROID_HOME/platform-tools to PATH"
    fi
    
    if command -v emulator &> /dev/null; then
        local emulator_path=$(which emulator)
        print_success "Emulator in PATH: $emulator_path"
    else
        print_warning "Emulator not in PATH"
        print_action "Add \$ANDROID_HOME/emulator to PATH"
    fi
    
    if command -v sdkmanager &> /dev/null; then
        print_success "SDK Manager in PATH"
    else
        print_warning "SDK Manager not in PATH"
        print_action "Add \$ANDROID_HOME/cmdline-tools/latest/bin to PATH"
    fi
}

# Check Android Emulators
check_android_emulators() {
    print_header "Android Emulators"
    
    if command -v emulator &> /dev/null; then
        # List available AVDs
        local avd_list=""
        if command -v avdmanager &> /dev/null; then
            avd_list=$(avdmanager list avd 2>/dev/null | grep "Name:" | cut -d: -f2 | xargs)
        elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" ]; then
            avd_list=$("$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" list avd 2>/dev/null | grep "Name:" | cut -d: -f2 | xargs)
        fi
        
        if [ -n "$avd_list" ]; then
            print_success "Android Virtual Devices found:"
            echo "$avd_list" | tr ' ' '\n' | while read -r avd; do
                if [ -n "$avd" ]; then
                    print_info "  AVD: $avd"
                fi
            done
        else
            print_warning "No Android Virtual Devices found"
            print_action "Create AVDs via Android Studio AVD Manager"
        fi
        
        # Check for running emulators
        if command -v adb &> /dev/null; then
            local running_devices=$(adb devices 2>/dev/null | grep -v "List of devices" | grep "device" | wc -l)
            if [ "$running_devices" -gt 0 ]; then
                print_success "$running_devices Android device(s) connected/running"
                adb devices 2>/dev/null | grep "device" | while read -r device; do
                    print_info "  $device"
                done
            else
                print_info "No Android devices currently running"
            fi
        fi
    else
        print_error "Emulator command not found"
        print_action "Ensure Android SDK is properly installed and in PATH"
    fi
}

# Check Gradle
check_gradle() {
    print_header "Gradle Build System"
    
    if command -v gradle &> /dev/null; then
        local gradle_version=$(gradle --version 2>/dev/null | grep "Gradle" | head -n 1)
        print_success "Gradle found: $gradle_version"
    else
        print_info "Gradle not in PATH (this is OK - Capacitor uses Gradle wrapper)"
    fi
    
    # Check if project has Gradle wrapper
    if [ -f "./gradlew" ]; then
        print_success "Gradle wrapper found in project"
    else
        print_info "Gradle wrapper not found (will be created when Android platform is added)"
    fi
}

# Check Capacitor Android setup
check_capacitor_android() {
    print_header "Capacitor Android Setup"
    
    # Check if Capacitor Android is installed
    if npm list @capacitor/android &>/dev/null; then
        local cap_android_version=$(npm list @capacitor/android --depth=0 2>/dev/null | grep @capacitor/android | cut -d@ -f3)
        print_success "Capacitor Android installed: $cap_android_version"
    else
        print_warning "Capacitor Android not installed"
        print_action "Install with: npm install @capacitor/android"
    fi
    
    # Check if Android platform exists
    if [ -d "android" ]; then
        print_success "Android platform directory exists"
        
        if [ -f "android/app/build.gradle" ]; then
            print_success "Android project structure looks correct"
        else
            print_warning "Android project structure incomplete"
        fi
    else
        print_info "Android platform not added yet"
        print_action "Add with: npx cap add android"
    fi
}

# Check system information
check_system_info() {
    print_header "System Information"
    
    local os_version=$(sw_vers -productVersion)
    local chip_info=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "Unknown")
    
    print_info "macOS Version: $os_version"
    print_info "Processor: $chip_info"
    
    # Check if this is Apple Silicon
    if [[ "$chip_info" == *"Apple"* ]]; then
        print_info "Apple Silicon Mac detected"
        print_warning "Ensure Android emulator images are ARM64 compatible"
    fi
}

# Generate recommendations
generate_recommendations() {
    print_header "Recommendations"
    
    print_info "To set up Android development environment:"
    echo ""
    
    if ! command -v java &> /dev/null; then
        print_action "1. Install JDK 17: brew install openjdk@17"
    fi
    
    if [ ! -d "/Applications/Android Studio.app" ]; then
        print_action "2. Install Android Studio from https://developer.android.com/studio"
    fi
    
    if [ -z "$ANDROID_HOME" ]; then
        print_action "3. Set environment variables in ~/.zshrc:"
        echo '   export ANDROID_HOME=$HOME/Library/Android/sdk'
        echo '   export PATH=$PATH:$ANDROID_HOME/emulator'
        echo '   export PATH=$PATH:$ANDROID_HOME/platform-tools'
        echo '   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin'
    fi
    
    print_action "4. Install required SDK components via Android Studio:"
    print_info "   - Latest Android platform (API 34+)"
    print_info "   - Android SDK Build-Tools"
    print_info "   - Android Emulator"
    print_info "   - Android SDK Platform-Tools"
    
    print_action "5. Create Android Virtual Device (AVD) via Android Studio"
    
    if ! npm list @capacitor/android &>/dev/null; then
        print_action "6. Install Capacitor Android: npm install @capacitor/android"
    fi
    
    if [ ! -d "android" ]; then
        print_action "7. Add Android platform: npx cap add android"
    fi
    
    echo ""
    print_info "Useful commands:"
    print_info "  npm run android:check        # Run this check again"
    print_info "  android studio &             # Launch Android Studio"
    print_info "  adb devices                  # List connected devices"
    print_info "  emulator -list-avds          # List available emulators"
}

# Main function
main() {
    echo "==================================================="
    echo "       TixApp Android Environment Checker"
    echo "==================================================="
    echo ""
    
    local checks_passed=0
    local total_checks=7
    
    if check_java; then ((checks_passed++)); fi
    echo ""
    
    if check_android_studio; then ((checks_passed++)); fi
    echo ""
    
    if check_android_sdk; then ((checks_passed++)); fi
    echo ""
    
    if check_path_configuration; then ((checks_passed++)); fi
    echo ""
    
    if check_android_emulators; then ((checks_passed++)); fi
    echo ""
    
    if check_gradle; then ((checks_passed++)); fi
    echo ""
    
    if check_capacitor_android; then ((checks_passed++)); fi
    echo ""
    
    check_system_info
    echo ""
    
    # Summary
    print_header "Summary"
    if [ $checks_passed -eq $total_checks ]; then
        print_success "All checks passed! Android development environment is ready."
    elif [ $checks_passed -ge 4 ]; then
        print_warning "Most checks passed. Minor issues need attention."
    else
        print_error "Several issues detected. Android development environment needs setup."
    fi
    
    echo ""
    generate_recommendations
    echo ""
}

main "$@"