---
"@equinor/modules": patch
---

## @equinor/modules

### Changes to `BaseConfigBuilder`

The `_createConfig` method in `BaseConfigBuilder` has been updated to return an `ObservableInput<TConfig>` instead of an `Observable<TConfig>`. 
This allows for more flexibility in how the config is created, as the method can now return a Promise or other observable-like type.

Additionally, the `_createConfig` method now uses `from()` to convert the result of `_buildConfig` to an observable stream.

Here's an example of how the updated `_createConfig` method can be used:

```typescript
protected _createConfig(
  init: ConfigBuilderCallbackArgs,
  initial?: Partial<TConfig>
): ObservableInput<TConfig> {
  return from(this._buildConfig(init, initial)).pipe(
    mergeMap((config) => this._processConfig(config, init))
  );
}
```

This change allows for asynchronous operations to be performed within the `_buildConfig` method, which can then be processed in the `_processConfig` method.

Consumers of the `BaseConfigBuilder` class should not need to update their code, as the public API remains the same.