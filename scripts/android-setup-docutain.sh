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
    # Check if already configured
    if grep -q "kotlin_version" "$BUILD_GRADLE"; then
        print_success "Kotlin configuration already present in build.gradle"
    else
        print_status "Adding Kotlin configuration to build.gradle..."
        
        # Create completely new build.gradle with proper structure
        cat > "$BUILD_GRADLE" << 'EOF'
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    ext {
        kotlin_version = '1.8.10'
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.7.2'
        classpath 'com.google.gms:google-services:4.4.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
    
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            jvmTarget = "17"
        }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
EOF
        
        print_success "Updated build.gradle with Kotlin configuration"
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
        # Read the original file
        TEMP_FILE=$(mktemp)
        
        # Create new app/build.gradle with compileOptions in the right place
        awk '
        /^android {/ { print; in_android=1; next }
        in_android && /^    buildTypes {/ { 
            # Add compileOptions before buildTypes
            print "    compileOptions {"
            print "        sourceCompatibility JavaVersion.VERSION_17"
            print "        targetCompatibility JavaVersion.VERSION_17"
            print "    }"
            print ""
            print
            next
        }
        { print }
        ' "$APP_BUILD_GRADLE" > "$TEMP_FILE"
        
        mv "$TEMP_FILE" "$APP_BUILD_GRADLE"
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
        sed -i.tmp 's|</manifest>|    <uses-permission android:name="android.permission.CAMERA" />\
    <uses-feature android:name="android.hardware.camera" />\
</manifest>|' "$MANIFEST"
        
        rm "$MANIFEST.tmp"
        print_success "Added camera permissions to AndroidManifest.xml"
    else
        print_success "Camera permissions already present in AndroidManifest.xml"
    fi
    
    # Check for largeHeap setting
    if ! grep -q "android:largeHeap" "$MANIFEST"; then
        print_status "Adding largeHeap setting to AndroidManifest.xml..."
        sed -i.tmp 's|<application|<application android:largeHeap="true"|' "$MANIFEST"
        rm "$MANIFEST.tmp"
        print_success "Added largeHeap setting to AndroidManifest.xml"
    else
        print_success "largeHeap setting already present in AndroidManifest.xml"
    fi
else
    print_error "AndroidManifest.xml not found at $MANIFEST"
    exit 1
fi

# 5. Copy custom icons and assets to drawable folder
print_status "Copying custom icons and assets..."

DRAWABLE_DIR="android/app/src/main/res/drawable"
ASSETS_DIR="scripts/assets/drawable"

if [ -d "$ASSETS_DIR" ]; then
    if [ -f "$ASSETS_DIR/done-blue-icon.png" ]; then
        cp "$ASSETS_DIR/done-blue-icon.png" "$DRAWABLE_DIR/"
        print_success "Copied done-blue-icon.png to drawable folder"
    else
        print_warning "done-blue-icon.png not found in assets folder"
    fi
else
    print_warning "Assets folder not found at $ASSETS_DIR"
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