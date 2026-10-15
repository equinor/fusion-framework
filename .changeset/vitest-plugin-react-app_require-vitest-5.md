---
"@equinor/fusion-framework-vitest-plugin-react-app": major
---

Require Vitest 5 and the matching Vitest browser integrations.

The plugin now declares `vitest@^5.0.0` and `@vitest/browser-playwright@^5.0.0` as peers, and requires `vitest-browser-react@^2.3.0` for Vitest 5 support.

Migration: upgrade your test dependencies together before updating this plugin.

```sh
pnpm add -D vitest@^5 @vitest/browser-playwright@^5 vitest-browser-react@^2.3.0
```

Projects that must remain on Vitest 4 should stay on the previous major version of this plugin.
