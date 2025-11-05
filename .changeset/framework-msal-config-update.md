---
"@equinor/fusion-framework": patch
---

Update FrameworkConfigurator.configureMsal to use MsalClientConfig instead of AuthClientConfig.

This change aligns the framework configurator with the updated MSAL module types while maintaining backward compatibility through type aliases.
