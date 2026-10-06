# @equinor/fusion-framework-cli-plugin-mock-server

## 0.3.0

### Minor Changes

- efdf820: `ffc mock-server` now receives and records the analytics your app sends.
  
  By default the command serves a mock `monitor` service that receives analytics and reads them the way Fusion's analytics pipeline does. It also answers the Apps service's `POST /apps/feature-events/query` with them, so analytics pages show your own local usage. Every batch is appended to `.fusion-mock/analytics.jsonl`; the folder gets a `.gitignore` so recordings are not committed by accident.
  
  New options, also available as `mockServer.analytics` in `dev-server.config.ts` and as `analytics` in `mockServerPlugin()`:
  
  - `--analytics-record <file>` or `--no-analytics-record`: choose the recording file, or keep events in memory only.
  - `--analytics-seed <path>` (repeatable): load earlier recordings, `logs_*.json.gz` landing-zone files, or folders of them at start.
  - `--no-analytics`: turn analytics off.
  
  The startup log shows where analytics are recorded and how many seeded events were loaded. A seed path that cannot be read stops startup.
  
  Refs: equinor/fusion-core-tasks#2181
- 9258fb1: `ffc mock-server` now serves local help articles and FAQs as a `help` service, so the dev portal can open the article an app requests with `useHelpCenter().openArticle(slug)`. The help docs folder is set with `--help-docs <dir>` or `mockServer.helpDocs` in `dev-server.config.ts` (relative to the project root), and otherwise auto-detected from `./docs` or `docs/<appKey>` in parent folders up to the repository root. The server logs how many articles and FAQs it serves and from where. Auto-detection is best effort: a detected folder that cannot be read is skipped with a warning. Projects without help articles or FAQs are unchanged, and a local `help.mock.ts` that defines the `help` service takes precedence (a `serviceDiscovery: 'merge'` module layers onto the help docs instead). `helpDocs: false` or `--no-help-docs` turns the feature off.
  
  ```typescript
  export default defineDevServerConfig(() => ({
    mockServer: { helpDocs: '../docs/my-app' },
  }));
  ```
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2153

### Patch Changes

- efdf820: Link the analytics documentation to the new "Test analytics locally" guide, which explains how to check tracked features end-to-end with `ffc mock-server` and Playwright.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2184
- Updated dependencies [efdf820]
- Updated dependencies [efdf820]
- Updated dependencies [efdf820]
- Updated dependencies [efdf820]
- Updated dependencies [efdf820]
- Updated dependencies [9258fb1]
- Updated dependencies [9258fb1]
  - @equinor/fusion-openapi-mock-server@0.5.0

## 0.2.1

### Patch Changes

- Updated dependencies [43bc1f0]
- Updated dependencies [4b3a9a0]
- Updated dependencies [e6b881a]
- Updated dependencies [e6b881a]
  - @equinor/fusion-openapi-mock-server@0.4.0

## 0.2.0

### Minor Changes

- c1924f9: Add repeatable `--allow-origin` and `mockServer.allowedOrigins` configuration for credentialed mock-auth browser requests from non-loopback origins. Canonical localhost and loopback-IP origins are allowed on every port without configuration.
  
  Relates to equinor/fusion-core-tasks#2096

### Patch Changes

- Updated dependencies [c1924f9]
  - @equinor/fusion-openapi-mock-server@0.3.0

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
