# @equinor/fusion-framework-lint-rules

## 1.1.1

### Patch Changes

- f663b46: Internal: promote packages already published on the `next` prerelease channel to their stable versions.

## 1.1.0

### Minor Changes

- de2b4fb: Add `require-property-tsdoc` rule: requires class field (property) declarations — including Lit's `@property()` / `@state()` decorated fields — to have a preceding TSDoc block comment. `private`/`#name` and `static` fields are exempt. Included in the `recommended` rule preset.

### Patch Changes

- 43183d8: Fixed `single-export-per-file` false positives on the `@fusionElement` custom-element registration pattern:
  - Barrel files (`index.ts`, `index.tsx`, `index.mts`, `index.cts`) now stay exempt from the rule even when a repo's config overrides `options.match` — previously only the default (unconfigured) matcher included the barrel exemption.
  - A companion top-level `const`/`let` that only parameterizes an `export default class ... {}` (e.g. a `tag` string used by `@fusionElement(tag)`) no longer counts as a competing export.

## 1.0.1

### Patch Changes

- 19e0636: Internal: add missing TypeScript project `references` between the linting packages (`lint-core`, `lint-rules`, `lint-config`, `fusion-lint`, `lint-lsp`).

  Without these references, `tsc -b` couldn't resolve `@equinor/fusion-framework-lint-core`/`lint-config` types when a package was built in isolation (as happens during `npm publish`'s `prepack` step), causing the previous release's publish to fail partway through.

## 1.0.0

### Major Changes

- 80c3e4a: Every rule now exports a `RuleDef` factory instead of a pre-built `Rule` instance, and `Rule.check` signatures follow the new `@equinor/fusion-framework-lint-core` `check(source, ctx: LintContext)` shape. Rule imports must now be called (even with no arguments) to get a usable `Rule`.

  ```typescript
  // Before
  import {
    requireTsDoc,
    createRequireTsDoc,
  } from "@equinor/fusion-framework-lint-rules";
  const engine = new LintEngine([requireTsDoc]);
  const custom = createRequireTsDoc({ classScope: "exported" });

  // After
  import { requireTsDoc } from "@equinor/fusion-framework-lint-rules";
  const engine = new LintEngine([requireTsDoc()]);
  const custom = requireTsDoc({ classScope: "exported" });
  ```

  `single-export-per-file`'s `allowMultipleIn` option has been removed in favor of the shared `options.match` (`{ include?, exclude?, fn? }`). The rule still exempts `index.ts`/`index.tsx`/`index.mts`/`index.cts` by default, but this default is now a fallback used only when `options.match` is not supplied — a caller-supplied `options.match` fully replaces it (no merging), so re-add `index.ts` etc. yourself if you still want barrels exempted:

  ```typescript
  // Before
  createSingleExportPerFile({ allowMultipleIn: ["*.schemas.ts"] });

  // After
  singleExportPerFile({ match: { exclude: ["*.schemas.ts"] } });
  ```

### Minor Changes

- 80c3e4a: Add a `filenameConvention` rule that checks a file's name against the naming convention of its single top-level export: classes and PascalCase-named components must be named after the export exactly, hooks (`useXxx`) must match the hook name exactly, and everything else must be kebab-case. A trailing dotted category suffix is allowed for the kebab-case case (e.g. `my-foo.schema.ts`, `sse.operator.ts`) — only the segment before the first dot needs to match. Files with zero or more than one top-level value export are skipped, and `index.*`/`*.d.ts` files are exempt by default.

  ```typescript
  import { filenameConvention } from "@equinor/fusion-framework-lint-rules";

  const rule = filenameConvention();
  ```

- 80c3e4a: Add `require-intent-comment/object-merge` rule, enabled by default in the `recommended` config at `warn` severity.

  The rule flags multi-source object merges that are missing an intent comment:
  - `Object.assign(target, ...sources)` calls with one or more source arguments.
  - Object or array literals spreading two or more sources, e.g. `{ ...a, ...b }` or `[...a, ...b]`.

  A no-op `Object.assign(target)` call (no sources) and single-spread-plus-overrides literals (the common immutable-update pattern, e.g. `{ ...state, enabled: true }`) are intentionally not flagged, so the rule only fires where a merge actually happens and key precedence matters.

### Patch Changes

- 80c3e4a: Internal: Add intent comments for control-flow and iterator usage in the `no-separate-export` rule implementation, resolving all `fusion-lint` warnings in this package.
- 80c3e4a: Internal: renamed source files to comply with the `filename-convention` lint rule (files renamed to match their primary named export, e.g. `engine.ts` → `LintEngine.ts`, `glob.ts` → `matches-basename-pattern.ts`). No public API changes.
- 80c3e4a: `single-export-per-file` no longer counts `enum` declarations toward the export limit. Enums are commonly grouped with the related types they describe (e.g. in a `types.ts` file) and shouldn't force a file split on their own.
- 80c3e4a: `filenameConvention` now accepts a file's immediate parent directory as an implicit namespace prefix — e.g. `require-intent-comment/flow.ts` exporting `requireIntentCommentFlow` is valid, since the directory name plus filename together spell out the export's kebab-case form. This matches a common and intentional pattern throughout the codebase (rule variants, per-endpoint generator modules, etc.) that was previously flagged as a false positive.
- 80c3e4a: Fix `filenameConvention`'s kebab-case conversion to correctly handle `SCREAMING_SNAKE_CASE` constants (e.g. `EVENT_NAME` no longer suggests the invalid `event_name.ts`, but `event-name.ts`), leading-underscore "private" export names (e.g. `_routerContext` keeps its underscore prefix instead of producing a malformed `-router-context.ts`), and destructuring exports (e.g. `export const { Consumer, Provider } = ctx`), which are now skipped since there's no single export name to file the module after.
- 80c3e4a: Fix a false positive in `no-separate-export`: re-exporting an identifier that was itself imported into the file (e.g. `import { Foo } from './bar.js'; export { Foo };`) is a legitimate re-export pattern and is no longer flagged. The rule now only reports specifiers whose local name is defined in the same file and then exported separately from its declaration.
- 80c3e4a: Internal: fixed fusion-lint's own rule implementation files to comply with the rules they enforce (missing intent comments); no public API changes.
- 80c3e4a: Internal: add clarifying intent comments to satisfy fusion-lint's own `require-intent-comment/flow` rule; no behavior changes.
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
  - @equinor/fusion-framework-lint-core@1.0.0

## 0.2.0

### Minor Changes

- b68e731: Initial release of `@equinor/fusion-framework-lint-rules`.

  Provides the first set of Fusion Framework lint rules:
  - `require-intent-comment` — control-flow statements and iterator calls must be preceded by an explanatory comment.
  - `require-tsdoc` — exported functions and class methods must have TSDoc comments. Object-literal shorthand methods (interface implementations) are exempt.
  - `require-component-tsdoc` — exported React components (PascalCase `const` arrow functions in `.tsx` files) must have TSDoc comments. Fills the gap left by `require-tsdoc`, which only covers `function` declarations.

### Patch Changes

- Updated dependencies [b68e731]
  - @equinor/fusion-framework-lint-core@0.2.0
