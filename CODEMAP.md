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
| `packages/*` | Framework libraries (58 packages) | Yes, via Changesets |
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
| `@equinor/fusion-framework-module-ag-grid` | `modules/ag-grid` | AG Grid integration |
| `@equinor/fusion-framework-module-ai` | `modules/ai` | AI/LLM integration |
| `@equinor/fusion-framework-module-analytics` | `modules/analytics` | OpenTelemetry analytics |
| `@equinor/fusion-framework-module-app` | `modules/app` | App loading and manifests |
| `@equinor/fusion-framework-module-azure-identity` | `modules/azure-identity` | Azure Identity auth (ambient, interactive, static token) |
| `@equinor/fusion-framework-module-bookmark` | `modules/bookmark` | Bookmark state and payload resolution |
| `@equinor/fusion-framework-module-context` | `modules/context` | Context selection and resolution |
| `@equinor/fusion-framework-module-event` | `modules/event` | Framework event bus |
| `@equinor/fusion-framework-module-feature-flag` | `modules/feature-flag` | Feature flags |
| `@equinor/fusion-framework-module-http` | `modules/http` | HTTP clients, selectors, handlers |
| `@equinor/fusion-framework-module-msal` | `modules/msal` | MSAL browser auth |
| `@equinor/fusion-framework-module-msal-node` | `modules/msal-node` | MSAL Node auth with encrypted token storage |
| `@equinor/fusion-framework-module-navigation` | `modules/navigation` | Navigation on React Router 7 |
| `@equinor/fusion-framework-module-service-discovery` | `modules/service-discovery` | Service discovery |
| `@equinor/fusion-framework-module-services` | `modules/services` | Typed Fusion service clients |
| `@equinor/fusion-framework-module-signalr` | `modules/signalr` | SignalR transport |
| `@equinor/fusion-framework-module-telemetry` | `modules/telemetry` | Microsoft telemetry |
| `@equinor/fusion-framework-module-widget` | `modules/widget` | Widget loading |

### React (`packages/react/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-react` | `react/framework` | React framework provider and root hooks |
| `@equinor/fusion-framework-react-app` | `react/app` | React application host |
| `@equinor/fusion-framework-react-module` | `react/modules/module` | Hooks for consuming modules |
| `@equinor/fusion-framework-react-module-bookmark` | `react/modules/bookmark` | Bookmark hooks |
| `@equinor/fusion-framework-react-module-context` | `react/modules/context` | Context hooks |
| `@equinor/fusion-framework-react-module-event` | `react/modules/event` | Event hooks |
| `@equinor/fusion-framework-react-module-http` | `react/modules/http` | HTTP hooks |
| `@equinor/fusion-framework-react-module-signalr` | `react/modules/signalr` | SignalR hooks |
| `@equinor/fusion-framework-react-router` | `react/router` | Type-safe route DSL for React Router v7 |
| `@equinor/fusion-framework-react-ag-grid` | `react/ag-grid` | AG Grid React bindings |
| `@equinor/fusion-framework-react-ag-charts` | `react/ag-charts` | AG Charts React bindings |
| `@equinor/fusion-framework-react-components-bookmark` | `react/components/bookmark` | Bookmark UI components |
| `@equinor/fusion-framework-react-components-people-provider` | `react/components/people-resolver` | People resolver components |

### Utils (`packages/utils/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-observable` | `utils/observable` | RxJS-based observable primitives and state |
| `@equinor/fusion-query` | `utils/query` | Reactive fetching and caching |
| `@equinor/fusion-log` | `utils/log` | Logging utilities |
| `@equinor/fusion-imports` | `utils/imports` | Import resolution helpers |
| `@equinor/fusion-load-env` | `utils/load-env` | `.env` loading |

### CLI and tooling

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-cli` | `packages/cli` | `ffc` CLI (build, dev, ai index, app tooling) |
| `@equinor/fusion-framework-dev-server` | `packages/dev-server` | Local dev server |
| `@equinor/fusion-framework-dev-portal` | `packages/dev-portal` | Local portal shell for app development |
| `@equinor/fusion-framework-cli-plugin-ai-base` | `cli-plugins/ai-base` | Shared AI plugin base |
| `@equinor/fusion-framework-cli-plugin-ai-chat` | `cli-plugins/ai-chat` | Interactive AI chat command |
| `@equinor/fusion-framework-cli-plugin-ai-index` | `cli-plugins/ai-index` | Embedding and chunking for the retrieval index |
| `@equinor/fusion-framework-cli-plugin-copilot` | `cli-plugins/copilot` | Copilot SDK evaluation plugin |

### Vite plugins (`packages/vite-plugins/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-framework-vite-plugin-spa` | `vite-plugins/spa` | SPA build/dev plugin |
| `@equinor/fusion-framework-vite-plugin-api-service` | `vite-plugins/api-service` | Service-discovery proxy and mocking |
| `@equinor/fusion-framework-vite-plugin-markdown` | `vite-plugins/markdown` | Markdown `?raw` imports |
| `@equinor/fusion-framework-vite-plugin-raw-imports` | `vite-plugins/raw-imports` | Generic `?raw` imports |
| `@equinor/fusion-framework-vite-plugin-routes-dsl` | `vite-plugins/routes-dsl` | `import.meta.resolve()` transform for route DSL |

### Linting (`packages/linting/*`)

| Package | Path | Role |
| --- | --- | --- |
| `@equinor/fusion-lint` | `linting/cli` | `fusion-lint` CLI |
| `@equinor/fusion-framework-lint-core` | `linting/core` | Rule engine and diagnostic types |
| `@equinor/fusion-framework-lint-rules` | `linting/rules` | tree-sitter powered Fusion rules |
| `@equinor/fusion-framework-lint-config` | `linting/config` | Recommended presets |
| `@equinor/fusion-framework-lint-lsp` | `linting/lsp` | Language server |
| `fusion-ts-lint-vscode` | `linting/vscode` | VS Code extension |

> Linting packages have TypeScript project `references` between them. When adding a
> cross-package import inside `packages/linting/*`, add the matching `references`
> entry to `tsconfig.json` or isolated `prepack` builds will fail during publish.

### Cookbooks (`cookbooks/*`)

`app-react`, `app-react-ag-grid`, `app-react-ai`, `app-react-apploader`, `app-react-assets`,
`app-react-bookmark`, `app-react-bookmark-advanced`, `app-react-charts`, `app-react-context`,
`app-react-context-custom-error`, `app-react-environment-variables`, `app-react-feature-flag`,
`app-react-module`, `app-react-msal`, `app-react-observable`, `app-react-people`,
`app-react-router`, `app-react-router-legacy`, `app-react-settings`, `app-react-styling`,
`app-vanilla`, `poc-portal`, `portal`, `portal-analytics`.

Package name pattern: `@equinor/fusion-framework-cookbook-<folder>`.

---

## Task routing

Use this table instead of searching. "Start here" is the first file to open.

| Task | Start here |
| --- | --- |
| Add or change an HTTP client | `packages/modules/http/src` |
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
| Test one project | `npx vitest run --project '<name>'` |
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
