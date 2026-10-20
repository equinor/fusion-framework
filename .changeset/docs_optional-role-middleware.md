---
"@equinor/fusion-framework-docs": patch
---

Document `requireRoles` from the existing React App Roles integration, including all/any middleware checks, cancellation and errors. Applications declare their requirements without implementing a guard, while the router remains independent of role policy.

Document the router-owned `createMiddleware` factory for typed route middleware definitions and its React App routing re-export.

Keep the typed middleware and role-gate examples in the app routing guide, available through the documentation site, with a short README link.
