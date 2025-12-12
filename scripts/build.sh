#!/bin/bash

# ANAMNESIS Production Build Script
# Builds the application for distribution

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              ANAMNESIS v3.0 Production Build              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist dist-electron release

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Type checking..."
npm run typecheck

# Build
echo "🔨 Building application..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Output locations:"
echo "   - Web assets: ./dist/"
echo "   - Electron: ./dist-electron/"
echo "   - Installers: ./release/"
