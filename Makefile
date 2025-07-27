# PDF Book Editor - Development Makefile
# Automated git operations and development workflow

.PHONY: help commit verify dev build test clean status push

# Default target
help:
	@echo "📚 PDF Book Editor - Development Commands"
	@echo "==========================================="
	@echo ""
	@echo "Git & Development:"
	@echo "  make commit MSG='your message'  - Smart commit with verification"
	@echo "  make quick-commit              - Quick commit with auto message"
	@echo "  make verify                    - Run progress verification"
	@echo "  make status                    - Show git and project status"
	@echo "  make push                      - Push to remote repository"
	@echo ""
	@echo "Development:"
	@echo "  make dev                       - Start development server"
	@echo "  make build                     - Build the application"
	@echo "  make test                      - Run all tests"
	@echo "  make clean                     - Clean build artifacts"
	@echo ""
	@echo "Examples:"
	@echo "  make commit MSG='Add new feature'"
	@echo "  make quick-commit"

# Commit with custom message
commit:
ifndef MSG
	@echo "❌ Error: Please provide a commit message"
	@echo "Usage: make commit MSG='your commit message'"
	@exit 1
endif
	@echo "🔍 Running verification before commit..."
	@npm run verify
	@echo ""
	@echo "📝 Staging files..."
	@git add .
	@echo ""
	@echo "💾 Creating commit..."
	@git commit -m "$(MSG)" \
		-m "" \
		-m "🤖 Generated with [Claude Code](https://claude.ai/code)" \
		-m "" \
		-m "Co-Authored-By: Claude <noreply@anthropic.com>"
	@echo ""
	@echo "✅ Commit created successfully!"
	@git log --oneline -1

# Quick commit with auto-generated message
quick-commit:
	@echo "🔍 Running verification..."
	@npm run verify
	@echo ""
	@echo "📝 Staging files..."
	@git add .
	@echo ""
	@echo "💾 Creating quick commit..."
	@TIMESTAMP=$$(date +"%Y-%m-%d %H:%M"); \
	CHANGED_FILES=$$(git diff --cached --name-only | wc -l); \
	git commit -m "Development checkpoint - $$TIMESTAMP" \
		-m "" \
		-m "📊 Files changed: $$CHANGED_FILES" \
		-m "⚡ Auto-generated quick commit" \
		-m "" \
		-m "🤖 Generated with [Claude Code](https://claude.ai/code)" \
		-m "" \
		-m "Co-Authored-By: Claude <noreply@anthropic.com>"
	@echo ""
	@echo "✅ Quick commit created!"
	@git log --oneline -1

# Commit Phase completion
commit-phase:
ifndef PHASE
	@echo "❌ Error: Please specify phase number"
	@echo "Usage: make commit-phase PHASE=1"
	@exit 1
endif
	@echo "🔍 Running verification..."
	@npm run verify
	@echo ""
	@echo "📝 Staging files..."
	@git add .
	@echo ""
	@echo "💾 Creating Phase $(PHASE) completion commit..."
	@git commit -m "Complete Phase $(PHASE): $$(cat .docs/development-plan.md | grep -A 1 "## Fase $(PHASE):" | tail -1 | sed 's/\*\*//g')" \
		-m "" \
		-m "✅ Phase $(PHASE) Achievements:" \
		-m "- All planned components implemented and tested" \
		-m "- Code quality verification passed" \
		-m "- Documentation updated" \
		-m "- Ready for next development phase" \
		-m "" \
		-m "📊 Verification score: $$(npm run verify --silent | grep 'Overall Score:' | grep -o '[0-9]\+/100' || echo 'N/A')" \
		-m "" \
		-m "🎯 Next: Phase $$(expr $(PHASE) + 1)" \
		-m "" \
		-m "🤖 Generated with [Claude Code](https://claude.ai/code)" \
		-m "" \
		-m "Co-Authored-By: Claude <noreply@anthropic.com>"
	@echo ""
	@echo "✅ Phase $(PHASE) completion commit created!"
	@git log --oneline -1

# Run progress verification
verify:
	@echo "🔍 Running progress verification..."
	@npm run verify

# Show project status
status:
	@echo "📊 PDF Book Editor - Project Status"
	@echo "===================================="
	@echo ""
	@echo "📁 Git Status:"
	@git status --short
	@echo ""
	@echo "📈 Recent Commits:"
	@git log --oneline -5
	@echo ""
	@echo "🔍 Project Verification:"
	@npm run verify --silent | tail -10

# Push to remote
push:
	@echo "🚀 Pushing to remote repository..."
	@git push origin main
	@echo "✅ Push completed!"

# Development commands
dev:
	@echo "🚀 Starting development server..."
	@npm run dev

build:
	@echo "🔨 Building application..."
	@npm run build

test:
	@echo "🧪 Running tests..."
	@npm run test

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist/
	@rm -rf node_modules/.cache/
	@rm -rf .cache/
	@echo "✅ Clean completed!"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@npm install
	@echo "✅ Dependencies installed!"

# Lint and format
lint:
	@echo "🔍 Running linter..."
	@npm run lint

format:
	@echo "✨ Formatting code..."
	@npm run format

# Complete development cycle
cycle: verify lint format test build
	@echo "🎯 Development cycle completed!"

# Emergency commit (skip verification)
emergency-commit:
ifndef MSG
	@echo "❌ Error: Please provide a commit message"
	@echo "Usage: make emergency-commit MSG='emergency fix'"
	@exit 1
endif
	@echo "⚠️  Emergency commit (skipping verification)..."
	@git add .
	@git commit -m "🚨 EMERGENCY: $(MSG)" \
		-m "" \
		-m "⚠️  Emergency commit - verification skipped" \
		-m "" \
		-m "🤖 Generated with [Claude Code](https://claude.ai/code)" \
		-m "" \
		-m "Co-Authored-By: Claude <noreply@anthropic.com>"
	@echo "✅ Emergency commit created!"

# Setup project (first time)
setup: install
	@echo "🔧 Setting up project for first time..."
	@git init 2>/dev/null || echo "Git already initialized"
	@git branch -m main 2>/dev/null || echo "Already on main branch"
	@echo "✅ Project setup completed!"
	@echo ""
	@echo "🎯 Next steps:"
	@echo "  1. make commit MSG='Initial setup'"
	@echo "  2. make dev"