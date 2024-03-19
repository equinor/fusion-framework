---
"@equinor/fusion-framework-module-msal": minor
---

Added functionality for setting default authentication behavior (`redirect` or `popup`) when creating authentication client.

```ts
const client = new AuthClient(
  "TENNANT_ID",
  {
    /** auth client options */
  },
  "redirect" || "popup",
);
```
