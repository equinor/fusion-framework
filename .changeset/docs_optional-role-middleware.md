---
"@equinor/fusion-framework-docs": patch
---

Document `requireRoles` from the existing React App Roles integration, including all/any middleware checks, cancellation and errors. Applications declare their requirements without implementing a guard, while the router remains independent of role policy.

Document the router-owned `createMiddleware` factory for typed route middleware definitions and its React App routing re-export.
