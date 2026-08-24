---
"@equinor/fusion-framework-cli-plugin-mock-server": minor
---

Add a CLI plugin for running the standalone OpenAPI mock server through `ffc mock-server`.

The command layers bundled presets and local mock directories, supports configurable host and
port defaults, and accepts `--seed` for reproducible generated responses.

```ts
// fusion-cli.config.ts
import { defineFusionCli } from '@equinor/fusion-framework-cli';
import mockServerPlugin from '@equinor/fusion-framework-cli-plugin-mock-server';

export default defineFusionCli(() => ({
  plugins: [mockServerPlugin()],
}));
```

```sh
ffc mock-server ./mocks --port 4010
```
