---
"@equinor/fusion-framework-react-app": minor
---

Add `requireRoles` to the existing `@equinor/fusion-framework-react-app/roles` entry point. Applications can declare all/any role requirements in route middleware without implementing guards. The helper uses the existing Roles provider, preserves denial and service errors, and respects cancellation. The generic router and core Roles module gain no new dependencies.
