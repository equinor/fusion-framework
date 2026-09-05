---
"@equinor/fusion-framework-docs": patch
---

Document the Roles V2 module, React components, and host recovery integration. Explain activation,
deactivation, mutation-driven cache invalidation, cold observable clients, and consumer-controlled
async pagination of the access-role registry, including early exit and cancellation.

Cover setup, peers, React context placement, hooks, and API contracts. Distinguish assignment IDs
from access-role names, React and module providers, mutation failures from subsequent refresh
errors, and UI gates from backend authorization.

Move portal flyout adoption into a dedicated migration guide covering host-loader recovery,
refresh-driven expiry prompts, and safe custom mutation/reload handling. Clarify compact Expired
overflow, audit-input preservation, provider replacement, and browser-local date display.

Explain how application hosts combine generic and role-aware error boundaries to recover when
required access blocks initialization.

Related to #5449.
