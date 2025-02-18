---
'@equinor/fusion-framework-module-msal': major
---

Rework of the MSAL module to support module hoisting. This means that sub modules instances will proxy the parent module instance. This means that the module instance will be shared between all instances of the module.

**Highlights:**

- Versioning module, config and provider.
- Interfaces for MSAL versions
- Proxy provider instances for sub modules.
- Transpile provider implementation to requested version.
- Configurator using `BaseConfigBuilder` (aligned with other modules)

**BREAKING CHANGES:**

- `configureMsal` has changed parameter signature to `configureMsal(msalConfigurator: MsalConfigurator): void`
- Added `enableMsal` with parameter signature to `enableMsal(configurator: IModulesConfigurator, configureMsal: (msalConfigurator: MsalConfigurator) => void): void`

**How to migrate:**

> **As an application no changes are required, the module will work as before.**

```diff
import { configureMsal } from '@equinor/fusion-framework-module-msal';

-  configureMsal(
-    {
-        tenantId: '{TENANT_ID}',
-        clientId: '{CLIENT_ID}',
-        redirectUri: '/authentication/login-callback',
-    },
-    { requiresAuth: true }
- );
+ enableMsal(configurator, (msalConfigurator) => {
+    msalConfigurator.setClientConfig({
+       tenantId: '{TENANT_ID}',
+       clientId: '{CLIENT_ID}',
+       redirectUri: '/authentication/login-callback',
+    });
+    msalConfigurator.requiresAuth(true);
+})
```
