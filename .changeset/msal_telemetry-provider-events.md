---
"@equinor/fusion-framework-module-msal": minor
---

Add optional provider-level telemetry for MSAL flows (login, token acquisition, redirect handling).

- Emits telemetry events and measurements via an injected telemetry provider when available
- Includes basic metadata (framework module version, clientId, tenantId) and authentication context
- Does not introduce a hard dependency on telemetry; works unchanged without telemetry

Why: Improves observability of authentication behavior and failures without breaking existing apps. Related to `Add Telemetry Integration to MSAL Module` [#3634](https://github.com/equinor/fusion-framework/issues/3634).

Migration: No action required. Telemetry is optional. To enable, ensure a telemetry provider is configured in your framework setup.

