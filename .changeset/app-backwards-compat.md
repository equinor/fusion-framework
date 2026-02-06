---
"@equinor/fusion-framework-app": patch
---

Internal: simplify endpoint configuration in AppConfigurator to use direct property access via destructuring.

```typescript
// Simplified from complex conditional to simple destructuring
const { endpoints = {} } = this.env.config ?? {};
```

Resolves: equinor/fusion#792
