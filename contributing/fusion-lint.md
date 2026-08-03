# Working with `fusion-lint`

`fusion-lint` enforces Fusion Framework conventions that Biome cannot express — intent
comments, TSDoc completeness, filename conventions, and single-export files. It parses with
tree-sitter, so its rules reason about **syntax tree position**, not about what a comment
looks like to a human reader.

That distinction is the source of nearly every "but I *did* add a comment" moment. This page
records the placements that work, so you do not have to rediscover them.

## Running it

```bash
pnpm lint:fusion              # build the rules, then lint packages and cookbooks
pnpm lint:fusion:packages     # packages only
pnpm exec fusion-lint lint <path>
pnpm exec fusion-lint changed --against origin/main
```

The CLI runs from built `dist`. After editing anything in `packages/linting/rules/src/**`,
run `pnpm build:lint` or the CLI will keep reporting the old behaviour.

## `require-intent-comment`

The rule looks for a comment in a specific structural position relative to the flagged node.
Two placements are recognised:

**Statement anchor** — the comment is the previous sibling of the enclosing statement:

```ts
// Only modules that opted into disposal need teardown
const disposable = modules.filter((module) => !!module.dispose);
```

**Inline chain anchor** — the comment sits between the receiver and the method call:

```ts
source$
  // Retry transient failures before surfacing an error to the UI
  .pipe(retry(3));
```

Prefer the statement anchor when the receiver is short. Use the inline chain anchor when the
receiver spans several lines, so the comment stays next to what it explains.

### Where the statement anchor does not reach

Use the inline chain anchor, or hoist into a `const`, in these cases:

| Situation | Why the statement comment fails |
| --- | --- |
| Iterator nested mid-chain (`obj.map(…).join(', ')`) | Only the *outermost* call is anchored |
| Multi-method chain (`arr.filter(…).map(…)`) | Each iterator call is checked independently |
| Spread element (`...items.map(…)`) | `spread_element` has no sibling to anchor against |
| JSX expression container (`{items.map(…)}`) | Not a statement node |
| Call nested in another call's arguments | Anchor climbs to the enclosing statement instead |
| Ternary branch containing a type assertion | The branch is not a statement |

For JSX, hoist the expression above the `return` and reference the variable:

```tsx
// Render one row per visible bookmark, newest first
const rows = bookmarks.filter((bookmark) => bookmark.isVisible).map(toRow);

return <List>{rows}</List>;
```

A comment placed as the first line inside an outer call's parentheses works only when the
argument is a **single** iterator call on a plain receiver:

```ts
expect(
  // Compare field names rather than whole field objects
  fields.map((field) => field.name),
).toEqual(expected);
```

It does not work when the receiver is itself a chain or a constructor call.

### Severity

`require-intent-comment/type-assertion` is an **error**, not a warning. A double cast
(`as unknown as T`) must explain why the escape hatch is necessary. The remaining
`require-intent-comment` rules are warnings.

## `require-tsdoc`

- Generic parameters use `@template T - …`. `@typeParam` is not recognised.
- The TSDoc block must be **immediately** adjacent to the declaration. A `biome-ignore`
  comment between them breaks the association.

When a symbol needs both TSDoc and a `biome-ignore`, keep the TSDoc adjacent and move the
suppression down to the specific line holding the flagged token:

```ts
/**
 * Resolves the module instance for a configurator.
 */
export function requireInstance(
  // biome-ignore lint/suspicious/noExplicitAny: module registry is intentionally untyped here
  registry: any,
): Promise<unknown> {
  /* … */
}
```

## `filename-convention` and `single-export-per-file`

Some basenames are repository conventions and are exempt in `fusion-lint.config.json`:

- `config.ts` — every cookbook's `src/config.ts` is imported by name from `src/index.ts`
- `static.ts` — files holding constant exports
- `types.ts` — type-only modules, which may also hold a single `enum`
- `utils.ts`, `helpers.ts`, `options.ts`, `predicates.ts`, `selectors.ts`, `actions.ts`,
  `setup.ts` — deliberately multi-export
- `routes.ts`, `layout.tsx` — route DSL and router conventions

If a rule flags one of these, add to the exempt list rather than renaming the file. When
adding an `excludePattern`, avoid a leading `*`: `"*module.ts"` matches any basename *ending*
in `module.ts` and will silently mask real violations. Prefer an exact basename plus an
explicit `"*-module.ts"` if the hyphenated form also needs covering, and confirm the blast
radius first:

```bash
find packages cookbooks -name '*module.ts' -not -path '*/node_modules/*'
```

## Splitting files safely

`single-export-per-file` often pushes toward extracting a second export. Two things break
consumers and are not caught by the package's own `tsc` run:

1. **Subpath exports.** `package.json` `exports` and `typesVersions` hardcode dist paths.
   Grep the manifest for the old filename after any split or rename.
2. **Dropped named exports.** Adding `export * as Errors from './errors'` should be added
   *alongside* the existing `export *`, not replace it. Removing a named export is a breaking
   change.

After any split or bulk rename, run a full `pnpm build:packages` from the repository root —
cross-package project references catch breakage that a single package build will not. Also
grep `tests/` and `*.config.ts` for the old path; neither is covered by `tsc -b`.

Finally, check for orphans. A split that rewires importers but leaves the original file
behind produces dead code that still compiles and still lints. If nothing imports the old
file, delete it rather than fixing its warnings.

## This repository uses Biome, not ESLint

Stray `// eslint-disable-next-line` comments predate the Biome migration. Delete them —
especially when one sits between a doc comment and its declaration, where it breaks
adjacency. For unused parameters or generics, prefix with `_` instead of suppressing.

Batch `biome check --write --unsafe` fixes can break both TypeScript and `fusion-lint`
several files away from the edit. After any unsafe batch, run the full sequence:
`pnpm build:packages`, `pnpm test`, `pnpm lint`.
