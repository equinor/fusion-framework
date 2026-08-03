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
- **Modules**: Implement module interfaces, export configuration and types, and add tests (plus React hooks if applicable).

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

