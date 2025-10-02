---
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-react-components-bookmark": patch
"@equinor/fusion-framework-module-context": patch
"@equinor/fusion-framework-legacy-interopt": patch
"@equinor/fusion-observable": patch
---

## Global Biome Configuration Modernization

**Workspace-wide changes:**
- Remove 19 rule overrides from `biome.json` to use Biome's strict "error" defaults
- Enable `correctness/useUniqueElementIds` accessibility rule globally
- Reduce configuration size by 40% (60+ → ~35 lines)
- Eliminate all custom linting rule customizations

**Package-specific changes:**
- Replace static IDs with React `useId()` hooks in bookmark and dev-portal components
- Fix `suspicious/noAssignInExpressions` violations in context, legacy-interopt, and observable packages
- Update 11 React components for accessibility compliance

**Impact:** All packages now use consistent, strict code quality enforcement with zero custom rule overrides.

resolves: [#3494](https://github.com/equinor/fusion-framework/issues/3494)
resolves: [#3495](https://github.com/equinor/fusion-framework/issues/3495)