---
"@equinor/fusion-framework-module-msal": minor
---

Allow resetting backend-issued auth code in `MsalConfigurator` by passing `undefined` to `setAuthCode`.

`setAuthCode` now trims input and treats empty or whitespace-only values as absent auth code, so no auth-code exchange is attempted during initialization when auth code is cleared or missing.

Closes #4137