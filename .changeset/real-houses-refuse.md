---
"@equinor/fusion-framework-module-msal": minor
---

Changed `handleRedirect` to check the state of `handleRedirectPromise`, since login threw popup should not trigger redirect.

Added flag in login state

- `internal` [_default_] when login was triggered from same frame
- `external` login was triggered by a iframe
