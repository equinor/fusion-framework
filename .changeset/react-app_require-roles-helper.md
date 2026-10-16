---
"@equinor/fusion-framework-react-app": minor
---

Add `requireRoles` to the existing `@equinor/fusion-framework-react-app/roles` entry point. Applications can declare all/any role requirements in route middleware without implementing guards. The helper uses the existing Roles provider, preserves denial and service errors, and respects cancellation. The generic router and core Roles module gain no new dependencies.

Re-export the router-owned `createMiddleware` through `@equinor/fusion-framework-react-app/routing` for typed middleware definitions. The Roles guard checks the same middleware contract at compile time without requiring the router for Roles-only consumers.
