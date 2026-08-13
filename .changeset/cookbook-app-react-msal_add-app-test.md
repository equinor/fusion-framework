---
"@equinor/fusion-framework-cookbook-app-react-msal": patch
---

Internal: add Vitest coverage for the `App` component, covering the default signed-in mock user, overriding `configure` with a custom mock account, and resolving/rendering an access token for the portal service scopes; wire the cookbook into the root Vitest project list. Also removes the unused demo `src/config.ts` (dev-only console logging, no functional impact).
