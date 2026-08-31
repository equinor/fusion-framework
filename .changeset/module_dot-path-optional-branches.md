---
"@equinor/fusion-framework-module": patch
---

Fix `DotPath` skipping over optional object properties, which made anything beneath them unreachable from `BaseConfigBuilder._set`.

An optional property is typed `T | undefined`, which does not extend `object`, so the path union stopped at the property itself: given `{ foo?: { bar: string } }`, `'foo'` was allowed but `'foo.bar'` was not. `DotPathType` already unwrapped such properties with `NonNullable`, so the two disagreed — a path it could resolve was one `_set` refused.

`DotPath` now unwraps the same way. This only widens the accepted union, so existing calls are unaffected.
