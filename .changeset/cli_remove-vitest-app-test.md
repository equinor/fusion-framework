---
"@equinor/fusion-framework-cli": major
---

Remove the `ffc app test` command and the `./vitest` entry-point (`testApplication`,
`resolveAppTestEnv`).

The Vitest integration for testing an application has moved to a standalone package,
`@equinor/fusion-framework-vitest-plugin-react-app`, built on `vitest-browser-react`. Instead
of running tests through the CLI, register `appTestVitePlugin` directly in your project's
`vitest.config.ts`:

```typescript
// Before
// "test": "ffc app test"

// After
import { defineConfig } from 'vitest/config';
import { appTestVitePlugin } from '@equinor/fusion-framework-vitest-plugin-react-app';

export default defineConfig({
  plugins: [appTestVitePlugin()],
});
```

`resolveAppTestEnv` is now exported from `@equinor/fusion-framework-vitest-plugin-react-app`
instead of this package's `./vitest` entry-point.
