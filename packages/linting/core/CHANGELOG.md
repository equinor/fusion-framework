# @equinor/fusion-framework-lint-core

## 1.0.0

### Major Changes

- 80c3e4a: `Rule.check` now takes a single `ctx: LintContext` argument instead of separate `filePath`/`severity` parameters, and a new `RuleDef`/`resolveMatch`/`RuleOptions` factory API is exported for building configurable rules.

  ```typescript
  // Before
  const myRule: Rule = {
    id: "my-rule",
    defaultSeverity: "warn",
    check(source, filePath, severity) {
      return [];
    },
  };

  // After
  import type { LintContext } from "@equinor/fusion-framework-lint-core";

  const myRule: Rule = {
    id: "my-rule",
    defaultSeverity: "warn",
    check(source, ctx: LintContext) {
      // ctx.filePath, ctx.severity
      return [];
    },
  };
  ```

  Also adds `LintContext`, `RuleDef`, `RuleOptions`, `RuleMatchOptions`, and `resolveMatch` — a factory-friendly way for rules to build their default `match` while still honoring a caller-supplied `options.match` override.

### Minor Changes

- 80c3e4a: Add inline suppression comments to silence specific fusion-lint diagnostics at the point of use.

  ```typescript
  // fusion-lint-disable-next-line no-separate-export
  export { foo, bar };

  const x = value as unknown as Foo; // fusion-lint-disable-line
  ```

  `fusion-lint-disable-line` suppresses diagnostics on the same line; `fusion-lint-disable-next-line` suppresses diagnostics on the following line. Both accept an optional comma-separated list of rule IDs (e.g. `fusion-lint-disable-next-line no-separate-export, require-tsdoc`); omitting the list suppresses every rule for that line.

### Patch Changes

- 80c3e4a: Internal: renamed source files to comply with the `filename-convention` lint rule (files renamed to match their primary named export, e.g. `engine.ts` → `LintEngine.ts`, `glob.ts` → `matches-basename-pattern.ts`). No public API changes.

## 0.2.0

### Minor Changes

- b68e731: Initial release of `@equinor/fusion-framework-lint-core`.

  Provides the foundational engine, rule interface, and diagnostic types for the Fusion Framework linting system.

  ```typescript
  import { LintEngine } from "@equinor/fusion-framework-lint-core";

  const engine = new LintEngine(rules, config);
  const diagnostics = engine.lint(sourceText, filePath);
  ```
