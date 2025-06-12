#!/bin/bash

# TixApp Android Docutain SDK Setup Script
# This script applies necessary configuration changes for Docutain SDK compatibility
# Run this after 'npx cap add android' or when setting up a fresh clone
#
# CONFIGURATION CHANGES APPLIED:
# ===============================
# 1. build.gradle (main):
#    - Adds Kotlin Android plugin (version 1.8.10)
#    - Sets global Kotlin JVM target to 17 (compatible with Java 22)
#
# 2. gradle.properties:
#    - Enables android.enableJetifier=true (required for Docutain SDK)
#    - Sets kotlin.jvm.target.validation.mode=warning (prevents JVM target errors)
#
# 3. app/build.gradle:
#    - Sets Java source/target compatibility to VERSION_17
#    - Ensures compatibility between Java 22 runtime and Kotlin compilation
#
# 4. AndroidManifest.xml:
#    - Adds camera permission: android.permission.CAMERA
#    - Adds camera feature requirement: android.hardware.camera
#    - Enables android:largeHeap="true" (prevents OutOfMemoryError with high-res images)
#
# These changes are required because:
# - Docutain SDK is written in Kotlin and needs specific JVM target settings
# - SDK processes high-resolution images requiring increased heap size
# - Camera access is needed for document scanning functionality
# - Jetifier is required for AndroidX compatibility with Docutain dependencies

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

print_status "Setting up Android configuration for Docutain SDK..."

# Check if Android platform exists
if [ ! -d "android" ]; then
    print_error "Android platform not found!"
    print_status "Run 'npx cap add android' first, then run this script"
    exit 1
fi

# 1. Update build.gradle (main) - Add Kotlin plugin and JVM target
print_status "Configuring main build.gradle..."

BUILD_GRADLE="android/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
    # Add Kotlin version and plugin to buildscript
    if ! grep -q "kotlin_version" "$BUILD_GRADLE"; then
        print_status "Adding Kotlin configuration to build.gradle..."
        # Create backup
        cp "$BUILD_GRADLE" "$BUILD_GRADLE.backup"
        
        # Use sed to insert Kotlin configuration
        sed -i.tmp '/buildscript {/a\
    ext {\
        kotlin_version = '\''1.8.10'\''\
    }' "$BUILD_GRADLE"
        
        sed -i.tmp '/classpath.*google-services/a\
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"' "$BUILD_GRADLE"
        
        # Add Kotlin JVM target configuration to allprojects
        sed -i.tmp '/allprojects {/,/}/ {
            /}/ i\
    \
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {\
        kotlinOptions {\
            jvmTarget = "17"\
        }\
    }
        }' "$BUILD_GRADLE"
        
        rm "$BUILD_GRADLE.tmp"
        print_success "Updated build.gradle with Kotlin configuration"
    else
        print_success "Kotlin configuration already present in build.gradle"
    fi
else
    print_error "build.gradle not found at $BUILD_GRADLE"
    exit 1
fi

# 2. Update gradle.properties - Add Jetifier and Kotlin settings
print_status "Configuring gradle.properties..."

GRADLE_PROPS="android/gradle.properties"
if [ -f "$GRADLE_PROPS" ]; then
    if ! grep -q "android.enableJetifier" "$GRADLE_PROPS"; then
        echo "" >> "$GRADLE_PROPS"
        echo "# Required for Docutain SDK compatibility" >> "$GRADLE_PROPS"
        echo "android.enableJetifier=true" >> "$GRADLE_PROPS"
        echo "" >> "$GRADLE_PROPS"
        echo "# Force Kotlin JVM target to 17 (compatible with Java 22)" >> "$GRADLE_PROPS"
        echo "kotlin.jvm.target.validation.mode = warning" >> "$GRADLE_PROPS"
        print_success "Updated gradle.properties with Docutain settings"
    else
        print_success "Docutain settings already present in gradle.properties"
    fi
else
    print_error "gradle.properties not found at $GRADLE_PROPS"
    exit 1
fi

# 3. Update app/build.gradle - Add Java compatibility
print_status "Configuring app/build.gradle..."

APP_BUILD_GRADLE="android/app/build.gradle"
if [ -f "$APP_BUILD_GRADLE" ]; then
    if ! grep -q "compileOptions" "$APP_BUILD_GRADLE"; then
        # Create backup
        cp "$APP_BUILD_GRADLE" "$APP_BUILD_GRADLE.backup"
        
        # Add compileOptions after buildTypes
        sed -i.tmp '/buildTypes {/,/}/ {
            /}/a\
    \
    compileOptions {\
        sourceCompatibility JavaVersion.VERSION_17\
        targetCompatibility JavaVersion.VERSION_17\
    }
        }' "$APP_BUILD_GRADLE"
        
        rm "$APP_BUILD_GRADLE.tmp"
        print_success "Updated app/build.gradle with Java 17 compatibility"
    else
        print_success "Java compatibility already present in app/build.gradle"
    fi
else
    print_error "app/build.gradle not found at $APP_BUILD_GRADLE"
    exit 1
fi

# 4. Verify AndroidManifest.xml has our camera permissions
print_status "Verifying AndroidManifest.xml permissions..."

MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
    if ! grep -q "android.permission.CAMERA" "$MANIFEST"; then
        print_warning "Camera permissions not found in AndroidManifest.xml"
        print_status "Adding camera permissions..."
        
        # Add permissions before the closing </manifest> tag
        sed -i.tmp '/<\/manifest>/i\
    <uses-permission android:name="android.permission.CAMERA" />\
    <uses-feature android:name="android.hardware.camera" />' "$MANIFEST"
        
        rm "$MANIFEST.tmp"
        print_success "Added camera permissions to AndroidManifest.xml"
    else
        print_success "Camera permissions already present in AndroidManifest.xml"
    fi
    
    # Check for largeHeap setting
    if ! grep -q "android:largeHeap" "$MANIFEST"; then
        print_status "Adding largeHeap setting to AndroidManifest.xml..."
        sed -i.tmp 's/<application/<application android:largeHeap="true"/' "$MANIFEST"
        rm "$MANIFEST.tmp"
        print_success "Added largeHeap setting to AndroidManifest.xml"
    else
        print_success "largeHeap setting already present in AndroidManifest.xml"
    fi
else
    print_error "AndroidManifest.xml not found at $MANIFEST"
    exit 1
fi

echo ""
echo "==========================================="
echo "    Docutain Android Setup Complete!"
echo "==========================================="
echo ""
print_success "All Android configuration changes applied successfully!"
echo ""
print_status "Next steps:"
echo "  1. Run 'npm run android:build' to build APK for side-loading"
echo "  2. Or run 'npm run android' to build and run on emulator"
echo ""
print_status "Note: These changes are automatically applied and don't need to be committed to git."