#!/bin/bash

echo "🔍 Running verification checks..."

# Run TypeScript type checking
echo "\n📝 Running type check..."
npm run typecheck || { echo "❌ Type check failed"; exit 1; }

# Run ESLint
echo "\n🔍 Running ESLint..."
npm run lint || { echo "❌ Linting failed"; exit 1; }

# Run production build
echo "\n🏗️ Running production build..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "\n✅ All checks passed! Safe to deploy." 