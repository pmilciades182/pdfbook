# Scripts Directory

This directory contains utility scripts for the PDF Book Editor project.

## Available Scripts

### Progress Verification Agent
**File**: `progress-verification-agent.js`

Automated monitoring system that tracks development progress and code quality.

**Usage**:
```bash
# Run verification
npm run verify

# Show help
npm run verify:help

# Direct execution
node scripts/progress-verification-agent.js
```

**Features**:
- Project structure verification
- Code quality analysis  
- Test coverage tracking
- Build system validation
- Documentation checks
- Git history analysis
- 10-phase development plan tracking
- Automated recommendations

**Reports**: Saved to `.docs/progress-logs/`

### Future Scripts
Additional utility scripts will be added here as the project develops:
- Build optimization scripts
- Deployment automation
- Database migration utilities
- Asset processing tools

## Configuration

Scripts can be configured through:
- `.docs/verification-config.json` - Verification agent settings
- `package.json` - Script definitions and project settings

## Requirements

- Node.js 16+
- Git repository initialized
- Valid package.json with required scripts

For detailed documentation, see `.docs/progress-verification-agent.md`