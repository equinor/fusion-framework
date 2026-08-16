---
"@equinor/fusion-framework-react-app": patch
---

Fix documentation accuracy issues found while adding hook test coverage:

- The README and a deprecated `createComponent` example showed `configurator.http.configureClient(...)` for registering an app's HTTP client. That property only exists on the test/mock configurator (`AppMockConfigurator`) — real app configuration must use `configurator.configureHttpClient(...)` from `IAppConfigurator`. Both examples now use the correct API.
- `docs/context.md` and `docs/framework.md` documented `setCurrentContext`/`useFrameworkCurrentContext`'s setter as returning `void`. It actually returns `void | Promise<ContextItem | null>` — `void` when clearing the context, a `Promise` when setting by id or by item — and can be awaited to know when the switch completes.
- `docs/msal.md` documented `AuthenticationResult.account`/`expiresOn` as non-nullable; both are actually nullable (`AccountInfo | null`, `Date | null`), and the `useToken` example has been updated to guard against a `null` `expiresOn`.
- `docs/bookmark.md` now documents `useCurrentBookmark`'s deprecated fallback to the framework-scoped bookmark provider (and the `@deprecation` console warning it logs) when an app hasn't called `enableBookmark`.
