---
"@equinor/fusion-framework-module-bookmark": patch
---

Internal: add required fusion-lint intent comments explaining `as unknown as T` casts in `BookmarkConfigurator` and `BookmarkProvider`. `bookmarkWithDataSchema`'s `schema` parameter is now optional instead of defaulted, to allow the default schema's cast to be documented with an intent comment; behavior is unchanged for all callers, which never pass a `schema` argument.
