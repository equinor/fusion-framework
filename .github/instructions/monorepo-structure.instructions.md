---
description: Rules for working with monorepo structure and packages
name: Monorepo Structure Rules
applyTo: "packages/**/*.{ts,tsx,json}"
---

# Monorepo Structure Rules

## TL;DR (for AI agents)

- **Imports**: Always import via scoped package names (e.g. `@equinor/fusion-framework-*`), never by relative paths between packages and never via `workspace:` in source code.
- **Packages**: Every package needs `package.json`, `src/index.ts`, `tsconfig.json`, and a `README.md`.
- **Dependencies**: Use `"workspace:^"` for internal dependencies in `package.json`.
- **New packages**: Place under the correct category (`app`, `framework`, `modules`, `react`, `utils`, `vite-plugins`, etc.) and follow naming conventions.
- **New public packages**: Declare `repository` (with `directory`) and `publishConfig.access`. A maintainer must reserve the name with `pnpm npm-trust add <name>` before the first release, or publishing fails. See `.agents/skills/custom-npm-publishing/SKILL.md`.
- **Modules**: Implement module interfaces, export configuration and types, and add tests (plus React hooks if applicable).
- **Module source roots**: Keep module entry points and core contracts/configurators/providers at the root. Place new lifecycle internals in `lib/`, pure helpers in `utils/`, validation schemas in `schemas/`, and optional integrations in `integrations/`. Preserve public entry-point exports; do not reorganize unrelated pre-existing files during a feature change.
- **Module preparation**: Use synchronous `addConfig({ prepare })` callbacks with an explicitly supplied builder or an opt-in, reference-independent `module.prepare()` factory. Ordinary `configure(ref)` factories must not run early. Keep builder storage internal; use lifecycle callbacks or owner-held references rather than public registry lookups.
- **Reactive state classes**: A `FlowSubject`-backed state class keeps its actions, reducer and flows in companion files named after the class: `<Class>.actions.ts`, `<Class>.reducer.ts` and `<Class>.flows.ts`, next to `<Class>.ts`. Behaviour belongs in flows over `action$`/`state$`, not in the consuming class, which stays a thin facade. These suffixes are exempt from `filename-convention` in `fusion-lint.config.json`, so the companion name follows the class rather than the export. Keep per-item hot paths (for example telemetry records) on synchronous streams; flow outcomes are delivered on the `asyncScheduler`, so code under fake timers must advance timers to settle them.

## Package Organization

### Directory Structure
```
packages/
├── app/           # Application host runtime
├── framework/     # Framework composition root
├── widget/        # Widget host runtime
├── modules/       # Framework modules (packages/modules/*/)
├── react/         # React integrations (packages/react/*/)
├── utils/         # Utility packages (packages/utils/*/)
├── cli/           # `ffc` CLI
├── cli-plugins/   # CLI plugins (packages/cli-plugins/*/)
├── linting/       # `fusion-lint` engine, rules, CLI, LSP
├── dev-server/    # Development server
├── dev-portal/    # Local portal shell
└── vite-plugins/  # Vite plugins (packages/vite-plugins/*/)
```

### Package Structure
All packages MUST follow this structure:
- `src/index.ts` - Main entry point
- `src/**/*.ts` - Source files
- `package.json` - Package configuration
- `README.md` - Package documentation (REQUIRED)
- `tsconfig.json` - TypeScript configuration

### Import Patterns

Always import across packages by scoped package name, never by relative path:

```typescript
import { Framework } from "@equinor/fusion-framework";
import { HttpModule } from "@equinor/fusion-framework-module-http";
import { useFramework } from "@equinor/fusion-framework-react";
import { Query } from "@equinor/fusion-query";
```

Declare the corresponding dependency as `"workspace:^"` in `package.json`. The `workspace:`
protocol never appears in source code.

When you add a workspace dependency, add the matching `references` entry to the package's
`tsconfig.json`. `prepack` builds each package in isolation during publish, so a missing
reference passes a full local build and fails the release.

### Creating New Packages
1. Create directory: `packages/{category}/{package-name}/`
2. Add `package.json` with proper name and `workspace:^` dependencies
3. Create `src/index.ts` as entry point
4. Add TypeScript configuration
5. Create comprehensive `README.md`
6. Update workspace configuration if needed
7. For a public package (not `"private": true`), add `"publishConfig": { "access": "public" }`
   and `"repository": { "type": "git", "url": "git+https://github.com/equinor/fusion-framework.git", "directory": "packages/{category}/{package-name}" }`.
   npm provenance rejects a publish without a matching `repository`.
8. Add a changeset, and update the package list and count in `CODEMAP.md`.

### Publishing a new package for the first time

npm trusted publishing can only trust a package name that already exists on npm. The release
workflow runs `pnpm npm-trust preflight` and refuses to publish anything while a public package
is missing from npm. Before the first release PR that contains a new public package is merged:

1. A maintainer with npm 2FA runs `pnpm npm-trust add <name>`. This publishes a placeholder
   and trusts `.github/workflows/release.yml`.
2. The release publishes within 2 days. After that, an unused trust configuration expires.
3. `pnpm npm-trust verify --package <name>` reports `verified` after the release.

Runbook: `contributing/npm-publishing.md`. Agent workflow: `.agents/skills/custom-npm-publishing/SKILL.md`.

### Module Structure
Modules follow specific patterns:
- Implement module interface from `@equinor/fusion-framework-module`
- Export module configuration and types
- Provide React hooks if applicable
- Include comprehensive tests

### Package Naming
- Framework packages: `@equinor/fusion-framework-*`
- Modules: `@equinor/fusion-framework-module-*`
- React packages: `@equinor/fusion-framework-react-*`
- Vite plugins: `@equinor/fusion-framework-vite-plugin-*`
- Utils: `@equinor/fusion-*`

The full package list lives in `CODEMAP.md`. Consult it instead of listing directories.
