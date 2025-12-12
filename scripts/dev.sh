#!/bin/bash

# ANAMNESIS Development Script
# Starts the development environment

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              ANAMNESIS v3.0 Development Mode              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server..."
echo ""

# Start the development server
npm run dev
