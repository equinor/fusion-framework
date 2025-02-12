---
'@equinor/fusion-framework': minor
---

---

## "@equinor/fusion-framework": minor

**@equinor/fusion-framework:**

Enhanced the `FrameworkConfigurator` class to improve the configuration of MSAL authentication.

- Updated the `configureMsal` method to accept a callback function (`AuthConfigFn`) and an optional `requiresAuth` parameter.
- The `configureMsal` method now adds a configuration object that sets the `requiresAuth` property and invokes the provided callback function with the builder.

```ts
/** Example of using the updated `configureMsal` method */
import { FrameworkConfigurator } from '@equinor/fusion-framework';

const configurator = new FrameworkConfigurator();
// prefered way to configure MSAL
configurator.configureMsal((builder) => {
    builder.setClientConfig({
        tentantId: '...',
        clientId: '...',
        redirectUri: '...',
    });
    builder.setRequiresAuth(true);
});

// backward compatible way to configure MSAL
configurator.configureMsal(
    {
        tentantId: '...',
        clientId: '...',
        redirectUri: '...',
    },
    true,
);
```

This change is **backward compatible** and does not require any changes to existing code, but it is recommended to use the new callback function for better readability and maintainability.
