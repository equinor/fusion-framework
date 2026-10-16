---
"@equinor/fusion-framework-react-app": minor
---

Add `requireRoles` to the existing `@equinor/fusion-framework-react-app/roles` entry point. Applications can declare all/any role requirements in route middleware without implementing guards. The helper uses the existing Roles provider, preserves denial and service errors, and respects cancellation. The generic router and core Roles module gain no new dependencies.

Add `createMiddleware` to `@equinor/fusion-framework-react-app/routing` for typed middleware definitions. It infers the router arguments and continuation, supports specialized route parameters and context, and preserves the callback's signature and execution. The Roles guard uses this shared contract without requiring the router for Roles-only consumers.
