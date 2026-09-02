# @equinor/fusion-framework-cli-plugin-mock-server

## 0.1.2

### Patch Changes

- Updated dependencies [54d0d20]
  - @equinor/fusion-openapi-mock-server@0.2.0

## 0.1.1

### Patch Changes

- d04e564: Internal: restrict published package contents to compiled distribution files and required runtime artifacts so editor tooling does not load workspace TypeScript configurations from dependencies.

## 0.1.0

### Minor Changes

- f663b46: Add a CLI plugin for running the standalone OpenAPI mock server through `ffc mock-server`.
  
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

### Patch Changes

- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
  - @equinor/fusion-framework-dev-server@2.1.0
  - @equinor/fusion-openapi-mock-server@0.1.0
