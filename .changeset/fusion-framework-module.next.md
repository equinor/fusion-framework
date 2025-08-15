---
"@equinor/fusion-framework-module": major
---

Major: explicit ESM module type and .js extensions for all internal imports

This release makes `@equinor/fusion-framework-module` an explicit ESM package by setting `type: "module"` in `package.json` and updating all internal TypeScript imports to use explicit `.js` extensions. This ensures compatibility with NodeNext module resolution and ESM environments, and aligns the runtime and published output with ESM standards.

- All internal imports now use `.js` extensions (e.g., `import { X } from './foo.js'`)
- `package.json` now explicitly sets `"type": "module"`
- `tsconfig.json` updated to use `module` and `moduleResolution` set to `NodeNext`
- No runtime logic changes
- Expose `satisfies` method on `SemanticVersion` class to allow version range checks directly on instances. This change extends the `SemVer` class and adds a `satisfies` method for convenience and improved API usability.

**BREAKING CHANGE:**
Consumers must use ESM-compatible tooling and update any imports of this package to use explicit `.js` extensions for internal imports. CommonJS is no longer supported. This may require changes to build tooling, import paths, and runtime environments if not already ESM-ready.
