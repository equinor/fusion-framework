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
├── app/           # Application framework
├── framework/     # Core framework
├── modules/       # Framework modules (packages/modules/*/)
├── react/         # React integrations (packages/react/*/)
├── utils/         # Utility packages (packages/utils/*/)
├── cli/           # CLI tools
├── dev-server/    # Development server
└── vite-plugins/  # Vite plugins
```

### Package Structure
All packages MUST follow this structure:
- `src/index.ts` - Main entry point
- `src/**/*.ts` - Source files
- `package.json` - Package configuration
- `README.md` - Package documentation (REQUIRED)
- `tsconfig.json` - TypeScript configuration

### Import Patterns

#### Framework Packages
```typescript
import { Framework } from "@equinor/fusion-framework";
import { Module } from "@equinor/fusion-framework-module";
import { HttpModule } from "@equinor/fusion-framework-module-http";
```

#### React Packages
```typescript
import { ReactFramework } from "@equinor/fusion-framework-react";
import { useFramework } from "@equinor/fusion-framework-react";
```

#### Utility Packages
```typescript
import { Observable } from "@equinor/fusion-observable";
import { Query } from "@equinor/fusion-query";
```

### Cross-Package Dependencies
```json
{
  "dependencies": {
    "@equinor/fusion-framework": "workspace:^",
    "@equinor/fusion-framework-module-http": "workspace:^"
  }
}
```

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
- Utils: `@equinor/fusion-*`
- Vite plugins: `fusion-framework-vite-plugin-*`

### Never Do
- ❌ Use relative imports for monorepo packages
- ❌ Use `workspace:` protocol in source code
- ❌ Create packages without README.md
- ❌ Skip TypeScript configuration
- ❌ Use `npm` or `yarn` commands

