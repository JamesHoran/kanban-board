# Kanban Board Project - Claude Instructions

## Important Constraints

**DO NOT modify:**
- `.env` file - Contains production credentials
- Any secret files or environment configuration files
- `nhost.toml` secrets section

## PM2 Process Management

**ALL development and testing MUST use PM2 for process management.**

### Dev Server
```bash
pnpm pm2:start    # Start dev server on port 3000
pnpm pm2:stop     # Stop dev server
pnpm pm2:restart  # Restart dev server
pnpm pm2:logs     # View logs
pnpm pm2:status   # Check status
pnpm pm2:kill     # Kill all PM2 processes
```

### Testing
```bash
# Start dev server first
pnpm pm2:start

# Run tests (requires dev server running)
pnpm test                    # Run tests
pnpm test:headed             # Run with visible browser
pnpm test:debug              # Debug mode with inspector

# After testing, stop the server
pnpm pm2:stop
```

**Before running tests, ensure:**
1. Dev server is running: `pnpm pm2:start`
2. Check status: `pnpm pm2:status`
3. If issues: `pnpm pm2:kill && pnpm pm2:start`

**DO NOT use:**
- Direct `pnpm dev` command (use PM2 instead)
- Background processes without PM2
- Manual port management

## Feedback Loops & Debugging Strategy

**CRITICAL: Always establish feedback loops when investigating issues.** Use multiple methods to gather evidence and verify hypotheses.

### Primary Feedback Methods:

1. **PM2 Logs (Most Important)**
   - **Command:** `pnpm pm2:logs`
   - **Files:** `logs/dev.log`, `logs/dev-error.log`
   - **What to look for:** Server startup messages, API requests/responses, authentication flow details, errors
   - **Best practice:** Tail logs during testing: `pnpm pm2:logs --lines 50`

2. **Playwright Test Output**
   - **Location:** `tests/anonymous-auth.spec.ts`
   - **Screenshots:** `tests/screenshots/`, `test-results/`
   - **Debug mode:** `pnpm test:debug` (runs tests in headed mode with inspector)
   - **Evidence collection:** Screenshots capture exact state, test output shows request/response details

3. **Browser Developer Tools**
   - **Network tab:** Inspect API requests, headers, cookies, response codes
   - **Console tab:** Check for JavaScript errors
   - **Application tab:** Inspect localStorage, sessionStorage, cookies
   - **Security tab:** Verify CORS policies and mixed content issues

4. **Console Logging (Code-Based)**
   - Add strategic `console.log()` statements in authentication flow
   - Focus on: auth state changes, cookie operations, API call parameters
   - Remove or comment out after debugging

### Effective Feedback Loop Process:

1. **Hypothesize** the root cause
2. **Add logging** to test the hypothesis
3. **Run targeted tests** to gather evidence
4. **Analyze logs/output** to confirm/refute
5. **Iterate** with refined hypotheses

### Common Investigation Patterns:

- **Cookie Issues:** Check `document.cookie` in browser console, verify domain/path attributes
- **API Failures:** Look for 401/403 status codes, missing auth headers
- **Silent Failures:** Add logging at each step of authentication flow
- **CORS Problems:** Check browser console for CORS errors, verify request origins

## Current Investigation

### Anonymous Auth Issue (Active)

**Problem:** Anonymous sign-in (`signInAnonymous()`) completes successfully but NO COOKIES are set, causing the seed API to return 401 Unauthorized.

**Evidence from Playwright tests:**
- `signInAnonymous()` is called and returns
- Seed API is called but gets 401
- Cookies remain empty: `[]` before and after sign-in

**Suspected causes:**
1. CORS/Cookie domain mismatch - Production Nhost server (`eu-central-1.nhost.run`) sets cookies with domain that doesn't work on `localhost:3000`
2. Cookie attributes (`Secure`, `SameSite`) blocking cookies on localhost
3. Silent sign-in failure with misleading success response

**Tests location:** `tests/anonymous-auth.spec.ts`
**Screenshots:** `tests/screenshots/` and `test-results/`
**Logs:** `logs/dev.log`, `logs/dev-error.log` (PRIMARY SOURCE OF TRUTH)