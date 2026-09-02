# Fusion Framework Code Map

Machine-readable orientation file. **Read this before searching the repository.**
Its purpose is to remove the "look around to find where things live" phase that
burns the most tokens in review and agent sessions.

If the answer you need is in this file, do **not** run `grep`, `find`, or semantic
search to rediscover it.

---

## Repository topology

| Path | Contains | Published? |
| --- | --- | --- |
| `packages/*` | Framework libraries (65 packages) | Yes, via Changesets |
| `cookbooks/*` | Runnable example apps and portals | Yes (versioned, but examples) |
| `eds-content/`, `eds/` | EDS design-system content and token tooling | No |
| `vue-press/` | Documentation site | Partly |
| `eval/index/` | Domain eval files for MCP retrieval quality | No |
| `contributing/` | Human-facing contributor docs | No |
| `.github/instructions/` | Rule files consumed by AI agents (`applyTo` globs) | No |
| `.agents/skills/` | Repository-local agent skills | No |
| `patches/` | `pnpm` patch files | No |

Every `packages/*` project is a **published library**. Every `cookbooks/*` project is a
**published example** that still needs a changeset when changed.

---

## Package map

Format: `package name` → path → role.

### Core

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework` | `packages/framework` | Framework composition root and configurator |
| `@equinor/fusion-framework-app` | `packages/app` | Application host runtime |
| `@equinor/fusion-framework-widget` | `packages/widget` | Widget host runtime |
| `@equinor/fusion-framework-module` | `packages/modules/module` | Module system primitives (`ModuleType`, initialization) |

### Modules (`packages/modules/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-module-ag-grid` | `packages/modules/ag-grid` | AG Grid integration |
| `@equinor/fusion-framework-module-ai` | `packages/modules/ai` | AI/LLM integration |
| `@equinor/fusion-framework-module-analytics` | `packages/modules/analytics` | OpenTelemetry analytics |
| `@equinor/fusion-framework-module-app` | `packages/modules/app` | App loading and manifests |
| `@equinor/fusion-framework-module-azure-identity` | `packages/modules/azure-identity` | Azure Identity auth (ambient, interactive, static token) |
| `@equinor/fusion-framework-module-bookmark` | `packages/modules/bookmark` | Bookmark state and payload resolution |
| `@equinor/fusion-framework-module-context` | `packages/modules/context` | Context selection and resolution |
| `@equinor/fusion-framework-module-event` | `packages/modules/event` | Framework event bus |
| `@equinor/fusion-framework-module-feature-flag` | `packages/modules/feature-flag` | Feature flags |
| `@equinor/fusion-framework-module-http` | `packages/modules/http` | HTTP clients, selectors, handlers |
| `@equinor/fusion-framework-module-msal` | `packages/modules/msal` | MSAL browser auth |
| `@equinor/fusion-framework-module-msal-node` | `packages/modules/msal-node` | MSAL Node auth with encrypted token storage |
| `@equinor/fusion-framework-module-navigation` | `packages/modules/navigation` | Navigation on React Router 7 |
| `@equinor/fusion-framework-module-service-discovery` | `packages/modules/service-discovery` | Service discovery |
| `@equinor/fusion-framework-module-services` | `packages/modules/services` | Typed Fusion service clients |
| `@equinor/fusion-framework-module-signalr` | `packages/modules/signalr` | SignalR transport |
| `@equinor/fusion-framework-module-state` | `packages/modules/state` | Replicated/persisted app state (PouchDB-backed sync) |
| `@equinor/fusion-framework-module-telemetry` | `packages/modules/telemetry` | Microsoft telemetry |
| `@equinor/fusion-framework-module-widget` | `packages/modules/widget` | Widget loading |

### Services (`packages/services`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-services` | `packages/services` | Tree-shakeable function-based API clients (Roles V2), version-scoped Zod schemas |

> Endpoints are standalone functions, not client classes, and reusable schemas are
> version-scoped (`src/roles/v1/schemas/*`, exported as `…V1`). The Zod schemas are the single
> source of truth: model types such as `ApiRoleV1` are `z.infer` of their schema, and no
> handwritten API interfaces exist. A version key (`'v1'`) and
> its concrete value (`'1.0'`) resolve identically; an unsupported version throws before
> the HTTP client is invoked.
>
> The complete published contract is snapshotted in `packages/services/src/roles/v1/openapi.json`
> and published as the `roles/v1/openapi.json` subpath of `@equinor/fusion-services`.
> The subpath is versioned by the API version, independent of the package version.
> `check:openapi roles` diffs it against the live service; snapshot updates are reviewed and applied manually
> it — both need network access and are deliberately outside `pnpm test`/`build`/`lint`.
> Consumer service guides live in `packages/services/docs/`; package extension and manual
> synchronization procedures live in `packages/services/CONTRIBUTING.md`.

### React (`packages/react/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-react` | `packages/react/framework` | React framework provider and root hooks |
| `@equinor/fusion-framework-react-app` | `packages/react/app` | React application host |
| `@equinor/fusion-framework-react-module` | `packages/react/modules/module` | Hooks for consuming modules |
| `@equinor/fusion-framework-react-module-bookmark` | `packages/react/modules/bookmark` | Bookmark hooks |
| `@equinor/fusion-framework-react-module-context` | `packages/react/modules/context` | Context hooks |
| `@equinor/fusion-framework-react-module-event` | `packages/react/modules/event` | Event hooks |
| `@equinor/fusion-framework-react-module-http` | `packages/react/modules/http` | HTTP hooks |
| `@equinor/fusion-framework-react-module-signalr` | `packages/react/modules/signalr` | SignalR hooks |
| `@equinor/fusion-framework-react-router` | `packages/react/router` | Type-safe route DSL for React Router v7 |
| `@equinor/fusion-framework-react-ag-grid` | `packages/react/ag-grid` | AG Grid React bindings |
| `@equinor/fusion-framework-react-ag-charts` | `packages/react/ag-charts` | AG Charts React bindings |
| `@equinor/fusion-framework-react-components-bookmark` | `packages/react/components/bookmark` | Bookmark UI components |
| `@equinor/fusion-framework-react-components-people-provider` | `packages/react/components/people-resolver` | People resolver components |

### Plugins (`packages/plugins/*`)i

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-plugin-context-navigation` | `packages/plugins/context-navigation` | Plugin for context-based navigation handling |

## Utils (`packages/utils/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-observable` | `packages/utils/observable` | RxJS-based observable primitives and state |
| `@equinor/fusion-query` | `packages/utils/query` | Reactive fetching and caching |
| `@equinor/fusion-log` | `packages/utils/log` | Logging utilities |
| `@equinor/fusion-imports` | `packages/utils/imports` | Import resolution helpers |
| `@equinor/fusion-load-env` | `packages/utils/load-env` | `.env` loading |
| `@equinor/fusion-openapi-mock` | `packages/utils/openapi-mock` | Fakes OpenAPI 3 responses from a parsed spec document |
| `@equinor/fusion-openapi-mock-server` | `packages/utils/openapi-mock-server` | Standalone HTTP server for `@equinor/fusion-openapi-mock`, addressable by tests (e.g. Playwright) |

### CLI and tooling

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-cli` | `packages/cli` | `ffc` CLI (build, dev, ai index, app tooling) |
| `@equinor/fusion-framework-dev-server` | `packages/dev-server` | Local dev server |
| `@equinor/fusion-framework-dev-portal` | `packages/dev-portal` | Local portal shell for app development |
| `@equinor/fusion-framework-cli-plugin-ai-base` | `packages/cli-plugins/ai-base` | Shared AI plugin base |
| `@equinor/fusion-framework-cli-plugin-ai-chat` | `packages/cli-plugins/ai-chat` | Interactive AI chat command |
| `@equinor/fusion-framework-cli-plugin-ai-index` | `packages/cli-plugins/ai-index` | Embedding and chunking for the retrieval index |
| `@equinor/fusion-framework-cli-plugin-copilot` | `packages/cli-plugins/copilot` | Copilot SDK evaluation plugin |
| `@equinor/fusion-framework-cli-plugin-mock-server` | `packages/cli-plugins/mock-server` | Adds `ffc mock-server`, wrapping `@equinor/fusion-openapi-mock-server` |

### Vite plugins (`packages/vite-plugins/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-vite-plugin-spa` | `packages/vite-plugins/spa` | SPA build/dev plugin |
| `@equinor/fusion-framework-vite-plugin-api-service` | `packages/vite-plugins/api-service` | Service-discovery proxy and mocking |
| `@equinor/fusion-framework-vite-plugin-markdown` | `packages/vite-plugins/markdown` | Markdown `?raw` imports |
| `@equinor/fusion-framework-vite-plugin-raw-imports` | `packages/vite-plugins/raw-imports` | Generic `?raw` imports |
| `@equinor/fusion-framework-vite-plugin-routes-dsl` | `packages/vite-plugins/routes-dsl` | `import.meta.resolve()` transform for route DSL |

### Linting (`packages/linting/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-lint` | `packages/linting/cli` | `fusion-lint` CLI |
| `@equinor/fusion-framework-lint-core` | `packages/linting/core` | Rule engine and diagnostic types |
| `@equinor/fusion-framework-lint-rules` | `packages/linting/rules` | tree-sitter powered Fusion rules |
| `@equinor/fusion-framework-lint-config` | `packages/linting/config` | Recommended presets |
| `@equinor/fusion-framework-lint-lsp` | `packages/linting/lsp` | Language server |
| `fusion-ts-lint-vscode` | `packages/linting/vscode` | VS Code extension |

> Linting packages have TypeScript project `references` between them. When adding a
> cross-package import inside `packages/linting/*`, add the matching `references`
> entry to `tsconfig.json` or isolated `prepack` builds will fail during publish.

### Vitest plugins (`packages/vitest-plugin/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-vitest-plugin-react-app` | `packages/vitest-plugin/react-app` | Vite plugin and Vitest helpers (`renderAppComponent`, `renderAppHook`, `testApp`) for testing React apps in a real, mock-backed application module scope |

### Cookbooks (`cookbooks/*`)

`app-react`, `app-react-ag-grid`, `app-react-ai`, `app-react-apploader`, `app-react-assets`,
`app-react-bookmark`, `app-react-bookmark-advanced`, `app-react-charts`, `app-react-context`,
`app-react-context-custom-error`, `app-react-environment-variables`, `app-react-feature-flag`,
`app-react-mock-playwright`, `app-react-module`, `app-react-msal`, `app-react-observable`,
`app-react-people`, `app-react-router`, `app-react-router-legacy`, `app-react-settings`,
`app-react-state`, `app-react-styling`, `app-vanilla`, `poc-portal`, `portal`,
`portal-analytics`.

Package name pattern: `@equinor/fusion-framework-cookbook-<folder>`.

---

## Task routing

Use this table instead of searching. "Start here" is the first file to open.

| Task | Start here |
| --- | --- |
| Add or change an HTTP client | `packages/modules/http/src` |
| Call a Fusion platform API (Roles V2) from an app | `packages/services/src/roles` |
| Add or change a Fusion service endpoint function | `packages/services/src/roles/endpoints`, schemas in `packages/services/src/roles/v1/schemas` |
| Check a Fusion service contract for drift | `packages/services/scripts`, snapshot in `packages/services/src/roles/v1/openapi.json` |
| Change auth behavior | `packages/modules/msal/src`, `packages/modules/azure-identity/src` |
| Change routing or route DSL | `packages/react/router/src`, `packages/modules/navigation/src` |
| Change module registration/init | `packages/modules/module/src` |
| Change React provider or hooks wiring | `packages/react/framework/src`, `packages/react/modules/module/src` |
| Change app loading or manifests | `packages/modules/app/src`, `packages/app/src` |
| Change build/dev CLI behavior | `packages/cli/src`, `packages/vite-plugins/spa/src` |
| Add a lint rule | `packages/linting/rules/src`, register in `packages/linting/config/src` |
| Add an example for a feature | `cookbooks/app-react-*` |
| Change observable/state primitives | `packages/utils/observable/src` |
| Change caching/fetching | `packages/utils/query/src` |

---

## Conventions worth knowing before you read code

- Modules are configured through a **configurator** object and consumed through a
  **module instance**; look for `configurator.ts` and `module.ts` in each module package.
- React packages wrap the framework-agnostic module with providers and hooks; behavior
  changes usually belong in the non-React module, not the React wrapper.
- Cross-package imports always use the scoped package name, never relative paths.
- Workspace dependencies use `workspace:^` in `package.json` only.

---

## Commands

| Goal | Command |
| --- | --- |
| Install | `pnpm install` |
| Build all | `pnpm build` |
| Build only affected | `pnpm build:affected` |
| Test | `pnpm test` |
| Test one project | `pnpm exec vitest run --project '<glob>'` |
| Lint (Biome) | `pnpm lint:biome` |
| Lint (Fusion rules) | `pnpm lint:fusion` |
| Fusion lint on changed files | `pnpm exec fusion-lint changed --against origin/main` |
| Typecheck a package | `pnpm --filter <pkg> exec tsc -b --force` |
| Add changeset | `pnpm changeset` |
| Verify this code map | `pnpm verify:agent-context` |
| Rebuild retrieval index | `pnpm index:packages`, `pnpm index:cookbooks` |

---

## Retrieval before search

This repository is indexed for semantic retrieval (Fusion MCP). When available, query the
index instead of crawling files:

- `fusion-framework` index — implementation details, APIs, modules, examples
- `fusion-docs` index — platform concepts, onboarding, operations
- `eds` index — EDS component docs and props

Escalation order for finding something: **this code map → MCP index → targeted `grep` on a
known path → semantic search**. Do not start at the bottom of that list.

---

## Maintenance

This file is hand-maintained. Update it when:

- a package is added, removed, or renamed
- a task-routing entry becomes wrong
- a root script in `package.json` changes

Run `pnpm verify:agent-context` to check it against the real workspace. CI runs the same
check on any PR that changes a package manifest or an agent-context file.

An inaccurate code map is worse than none — it causes agents to search anyway, and pay twice.
