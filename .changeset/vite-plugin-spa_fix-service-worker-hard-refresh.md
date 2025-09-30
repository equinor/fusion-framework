---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Fixed service worker not intercepting requests during hard refresh in development mode.

**Problem**: During hard refresh, the service worker would not intercept fetch requests, causing authenticated API requests to fail. The service worker could be stuck in "waiting" state or already active but not controlling the page (`navigator.serviceWorker.controller` was `undefined`).

**Root Cause**: Two related issues in the service worker lifecycle during hard refresh:
1. **Waiting state**: When code changes, the new service worker enters "waiting" state, but `skipWaiting()` only runs in the `install` event (which already fired)
2. **No controller**: Even when active, `clients.claim()` only runs in the `activate` event, which doesn't fire again if the service worker is already active

**Solution**:
- **Force activation on config receipt**: When receiving `INIT_CONFIG`, immediately call both `skipWaiting()` and `clients.claim()` to ensure the service worker activates and takes control regardless of its current state
- **Wait for controller**: Registration now waits for `navigator.serviceWorker.controller` to be set before proceeding, ensuring fetch interception is ready
- **Disable service worker caching**: Added `updateViaCache: 'none'` to always fetch fresh service worker code during development
- **Comprehensive state handling**: Handle service workers in installing, waiting, and active states

**Changes**:
1. **sw.ts**: Call `skipWaiting()` and `clients.claim()` when receiving `INIT_CONFIG` message
2. **register-service-worker.ts**: Wait for controller with polling and timeout fallback; disable service worker HTTP caching

This ensures service workers always activate and take control during hard refresh, properly intercepting and authenticating requests in development mode.

reporter: [v3gard](https://github.com/v3gard)

resolves: [Force refresh (CTRL+Shift+R) causes app to throw #679
](https://github.com/equinor/fusion/issues/679)
