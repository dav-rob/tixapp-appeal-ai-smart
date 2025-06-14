#!/bin/bash

# TixApp iOS Docutain SDK Setup Script
# This script copies custom icons and assets to the iOS project
# Run this after 'npx cap add ios' or when setting up a fresh clone

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

print_status "Setting up iOS assets for Docutain SDK..."

# Check if iOS platform exists
if [ ! -d "ios" ]; then
    print_error "iOS platform not found!"
    print_status "Run 'npx cap add ios' first, then run this script"
    exit 1
fi

# Copy custom icons to Assets.xcassets
print_status "Copying custom icons to Assets.xcassets..."

ASSETS_DIR="scripts/assets/drawable"
XCASSETS_DIR="ios/App/App/Assets.xcassets/done_blue_icon.imageset"

if [ -d "$ASSETS_DIR" ]; then
    # Create imageset directory if it doesn't exist
    if [ ! -d "$XCASSETS_DIR" ]; then
        mkdir -p "$XCASSETS_DIR"
        print_status "Created imageset directory: $XCASSETS_DIR"
    fi
    
    # Copy Contents.json if it doesn't exist
    if [ ! -f "$XCASSETS_DIR/Contents.json" ]; then
        cat > "$XCASSETS_DIR/Contents.json" << 'EOF'
{
  "images" : [
    {
      "filename" : "done_blue_icon.png",
      "idiom" : "universal",
      "scale" : "1x"
    },
    {
      "filename" : "done_blue_icon@2x.png",
      "idiom" : "universal",
      "scale" : "2x"
    },
    {
      "filename" : "done_blue_icon@3x.png",
      "idiom" : "universal",
      "scale" : "3x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF
        print_success "Created Contents.json for done_blue_icon imageset"
    fi
    
    # Copy icons if they exist (using the original filename from assets)
    if [ -f "$ASSETS_DIR/done-blue-icon.png" ]; then
        cp "$ASSETS_DIR/done-blue-icon.png" "$XCASSETS_DIR/done_blue_icon.png"
        print_success "Copied done-blue-icon.png as done_blue_icon.png (1x) to iOS assets"
    else
        print_warning "done-blue-icon.png not found in $ASSETS_DIR"
    fi
    
    # For now, use the same icon for all scales until we generate proper 2x and 3x versions
    if [ -f "$ASSETS_DIR/done-blue-icon.png" ]; then
        cp "$ASSETS_DIR/done-blue-icon.png" "$XCASSETS_DIR/done_blue_icon@2x.png"
        cp "$ASSETS_DIR/done-blue-icon.png" "$XCASSETS_DIR/done_blue_icon@3x.png"
        print_success "Copied done-blue-icon.png as 2x and 3x variants to iOS assets"
    fi
else
    print_warning "iOS assets folder not found at $ASSETS_DIR"
fi

echo ""
echo "==========================================="
echo "     iOS Docutain Setup Complete!"
echo "==========================================="
echo ""
print_success "All iOS assets copied successfully!"
echo ""
print_status "Next steps:"
echo "  1. Run 'npm run ios' to build and run on iOS simulator"
echo "  2. Or use 'npx cap open ios' to open in Xcode"
echo ""
print_status "Note: Make sure you have created all three icon scales (1x, 2x, 3x)"
print_status "Use create_ios_icons.html to generate the required icon files"