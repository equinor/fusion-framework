---
"@equinor/fusion-framework-lint-config": major
---

`CustomRuleDefinition.check` (used by `ConfigBuilder.addRule` and `defineConfig`'s builder form) now follows `@equinor/fusion-framework-lint-core`'s `check(source, ctx: LintContext)` signature instead of `check(source, filePath)`.

```typescript
// Before
args.addRule({ id: 'my-rule', severity: 'warn', check: (source, filePath) => [] });

// After
args.addRule({ id: 'my-rule', severity: 'warn', check: (source, ctx) => [] });
```

`recommendedRules` is unaffected — it still exports resolved `Rule[]` instances (each built-in factory is called internally).
