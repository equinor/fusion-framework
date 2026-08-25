---
"@equinor/fusion-framework-cli-plugin-mock-server": minor
---

Add a CLI plugin for running the standalone OpenAPI mock server through `ffc mock-server`.

The command layers bundled presets and local executable mock modules, reads `mockServer` defaults
from `dev-server.config.ts`, and accepts command-line host, port, and seed overrides. The standalone
server resolves only predefined and local mocks; it never fetches remote service discovery.

Installing the plugin augments `DevServerOptions` with typed `mockServer` settings for the module
directory, host, port, and deterministic seed without coupling the base dev-server package to the
optional plugin.

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
