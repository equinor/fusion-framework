---
"@equinor/fusion-framework-module-msal": patch
---

Fix silent token acquisition hanging ~10–20 s when refresh token is revoked.

When a refresh token is revoked, MSAL's default cache lookup policy (`Default`) falls back to a hidden iframe (`SilentIframeClient`) after the token endpoint returns `invalid_grant`. The iframe loads the app URL, fails to authenticate (no valid session), and times out — throwing `monitor_window_timeout` before eventually triggering an interactive redirect. This causes the visible "iframe crash + page reload" symptom.

The configurator now defaults `cacheLookupPolicy` to `CacheLookupPolicy.AccessTokenAndRefreshToken`, which skips the iframe step entirely. A revoked refresh token now immediately throws `InteractionRequiredAuthError`, and the app falls back to interactive login without the delay.

**Configuration:**

The policy is fully configurable via `MsalConfigurator.setCacheLookupPolicy`. To restore MSAL's original waterfall (cache → refresh token → iframe):

```typescript
import { CacheLookupPolicy } from '@azure/msal-browser';

configurator.setCacheLookupPolicy(CacheLookupPolicy.Default);
```

Per-request `cacheLookupPolicy` on `SilentRequest` still takes precedence over the instance default.

Fixes: https://github.com/equinor/fusion-core-tasks/issues/1234
