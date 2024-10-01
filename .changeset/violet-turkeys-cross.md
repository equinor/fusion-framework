---
'@equinor/fusion-framework-module-http': minor
---

Added `remove` to the `ProcessOperators` to allow for the removal of a specific operator. This is useful for removing operators that are not desired, example default operators included in initial configuration.

example:

```typescript
httpClient.requestHandler.remove('capitalize-method');
```

> [!NOTE]
> There are currently no code completion for the `remove` method, so you will need to know the name of the operator you want to remove. We assume this is so low level that if you are removing operators you know what the name of the operator is.

> [!TIP]
> If you only wish to replace the operator with another operator, you can use the `set` method instead of `remove` and `add`.
