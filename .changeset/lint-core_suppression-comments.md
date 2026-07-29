---
"@equinor/fusion-framework-lint-core": minor
---

Add inline suppression comments to silence specific fusion-lint diagnostics at the point of use.

```typescript
// fusion-lint-disable-next-line no-separate-export
export { foo, bar };

const x = value as unknown as Foo; // fusion-lint-disable-line
```

`fusion-lint-disable-line` suppresses diagnostics on the same line; `fusion-lint-disable-next-line` suppresses diagnostics on the following line. Both accept an optional comma-separated list of rule IDs (e.g. `fusion-lint-disable-next-line no-separate-export, require-tsdoc`); omitting the list suppresses every rule for that line.
