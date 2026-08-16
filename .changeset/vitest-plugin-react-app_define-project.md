---
"@equinor/fusion-framework-vitest-plugin-react-app": minor
---

Add a `/config` entry-point exporting `defineProject`: a drop-in for Vitest's own `defineProject`, pre-wired with `appTestVitePlugin` and the `@vitest/browser-playwright`/`chromium` browser provider, so a consuming app's own `vitest.config.ts` needs no browser-provider boilerplate.

```ts
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';
import { name, version } from './package.json' with { type: 'json' };

export default defineProject({ test: { name: `${name}@${version}` } });
```

`override` is deep-merged onto the default config via Vite's own `mergeConfig` (a plain object), or applied to the default config outright (a function receiving it) — for changes `mergeConfig` can't express, such as swapping `test.browser.provider` for a different `@vitest/browser-*` provider.

`@vitest/browser-playwright` and `playwright` are now explicit peer dependencies of the package.

Also fixes `appTestVitePlugin`'s `entrypoint` inference: when no `entrypoint` option is given, it now resolves from the Vitest project's own root (via `configResolved`) instead of `process.cwd()`, so each cookbook's `vitest.config.ts` no longer needs to pass `entrypoint` explicitly when run as part of a multi-project Vitest run.
