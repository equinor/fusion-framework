---
"@equinor/fusion-framework-module-msal-node": minor
---

Add `device_code` authentication mode for interactive CLI login.

The new `AuthProviderDeviceCode` class prompts the user to visit a URL and enter a code, then exchanges it for tokens. This enables CLI tools to authenticate without a client secret, using the standard MSAL device code flow.

Ref: https://github.com/equinor/fusion-framework/issues/1008
