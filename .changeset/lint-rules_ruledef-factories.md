---
"@equinor/fusion-framework-lint-rules": major
---

Every rule now exports a `RuleDef` factory instead of a pre-built `Rule` instance, and `Rule.check` signatures follow the new `@equinor/fusion-framework-lint-core` `check(source, ctx: LintContext)` shape. Rule imports must now be called (even with no arguments) to get a usable `Rule`.

```typescript
// Before
import { requireTsDoc, createRequireTsDoc } from '@equinor/fusion-framework-lint-rules';
const engine = new LintEngine([requireTsDoc]);
const custom = createRequireTsDoc({ classScope: 'exported' });

// After
import { requireTsDoc } from '@equinor/fusion-framework-lint-rules';
const engine = new LintEngine([requireTsDoc()]);
const custom = requireTsDoc({ classScope: 'exported' });
```

`single-export-per-file`'s `allowMultipleIn` option has been removed in favor of the shared `options.match` (`{ include?, exclude?, fn? }`). The rule still exempts `index.ts`/`index.tsx`/`index.mts`/`index.cts` by default, but this default is now a fallback used only when `options.match` is not supplied — a caller-supplied `options.match` fully replaces it (no merging), so re-add `index.ts` etc. yourself if you still want barrels exempted:

```typescript
// Before
createSingleExportPerFile({ allowMultipleIn: ['*.schemas.ts'] });

// After
singleExportPerFile({ match: { exclude: ['*.schemas.ts'] } });
```
