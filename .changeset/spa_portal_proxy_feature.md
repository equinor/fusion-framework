---
"@equinor/fusion-framework-vite-plugin-spa": minor
---

Enhanced SPA plugin with portal proxy support for testing apps in real portal environments ([Issue #3546](https://github.com/equinor/fusion-framework/issues/3546)).

- Added `proxy` option to portal configuration to enable `/portal-proxy` routing
- Added `FUSION_SPA_PORTAL_PROXY` environment variable support
- Updated TypeScript types to include portal proxy configuration
- Updated documentation with portal proxy usage examples

This feature enables developers to load real portal implementations instead of the default developer portal, supporting configuration of portal ID and version tags for targeted testing scenarios.

**Migration:**
No migration required - the `proxy` option defaults to `false`, maintaining existing behavior.

**Example usage:**
```ts
portal: {
  id: 'my-portal',
  tag: 'latest',
  proxy: true, // Routes through /portal-proxy/
}
```
