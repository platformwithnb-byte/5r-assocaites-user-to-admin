# Development Files

This folder contains all development, testing, and temporary files that should **NOT** be deployed to production.

## Structure

### test-scripts/
All test and utility scripts for development:
- `test-*.js` - API and endpoint testing scripts
- `debug-*.js` - Debug utilities
- `setup-*.js` - Test environment setup
- `*-seed.js` - Database seeding scripts
- `make-eligible.js`, `reset-passwords.js` - Database utility scripts

### docs/
Development and test mode documentation:
- `QUICK_START_TEST_MODE.md` - Quick start guide for test mode
- `TEST_MODE_DOCUMENTATION.md` - Comprehensive test mode documentation
- `TEST_MODE_SUMMARY.md` - Summary of test mode features

### temp/
Temporary files and scratch workspace for development

### data/
Development data folders:
- `database/` - Local database dumps and schema artifacts
- `uploads/` - Test file uploads
- `generated_pdfs/` - Test PDF outputs

## Important Notes

⚠️ **DO NOT deploy this folder to production servers**

**Why?**
- Files may contain test credentials and hard-coded passwords
- Scripts may modify database state destructively
- Documentation reveals internal implementation details
- Contains mock/dummy data not suitable for production

## Usage During Development

### Running Test Scripts
```bash
cd _development/test-scripts
node test-api-login.js
node test-eligible.js
```

### Seeding Test Data
```bash
node _development/test-scripts/backend-seed.js
node _development/test-scripts/prisma-seed.js
```

### Resetting Test Environment
```bash
node _development/test-scripts/reset-passwords.js
node _development/test-scripts/make-eligible.js
```

## Before Production Deployment

1. ✅ Run `npm run deploy-prep` to scan for production issues
2. ✅ Run `npm run build-production` to create clean production build
3. ✅ Verify `_development/` is excluded from deployment
4. ✅ Check `.gitignore` includes `_development/*` patterns
5. ✅ Ensure no production code imports from `_development/`

## Maintenance

- Keep this folder organized by category
- Document new test scripts added here
- Regularly clean up obsolete test files
- Update this README when structure changes

## Quick Reference

| Script | Purpose |
|--------|---------|
| test-api-login.js | Test authentication endpoints |
| test-eligible.js | Test service request eligibility |
| backend-seed.js | Seed test data (users, requests, quotations) |
| reset-passwords.js | Reset test user passwords |
| make-eligible.js | Set request status to PAYMENT for testing |
| setup-test-mode.js | Configure TEST_MODE settings |

---

**Last Updated:** January 7, 2026  
**Purpose:** Development and testing artifacts isolation
