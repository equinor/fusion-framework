---
"@equinor/modules": patch
---

## @equinor/modules

### Changes to `BaseConfigBuilder`

The `BaseConfigBuilder` class has been updated to improve its extendability and provide better access to the internal configuration callbacks.

#### Added `_get` and `_has` methods

Two new protected methods have been added to the `BaseConfigBuilder` class:

1. `_get<TTarget extends DotPath<TConfig>>(target: TTarget)`: This method retrieves the configuration callback for the specified target path in the configuration. It returns the callback or `undefined` if no callback is registered for the given target.

2. `_has<TTarget extends DotPath<TConfig>>(target: TTarget)`: This method checks if the given target path exists in the configuration callbacks. It returns `true` if the target path exists, `false` otherwise.

These methods allow subclasses of `BaseConfigBuilder` to easily access and check the existence of configuration callbacks for specific targets.

#### Example usage

Suppose you have a subclass of `BaseConfigBuilder` called `MyConfigBuilder`. You can use the new `_get` and `_has` methods like this:

```typescript
class MyConfigBuilder extends BaseConfigBuilder<MyConfig> {
  // override the _buildConfig method
  async _createConfig(
      init: ConfigBuilderCallbackArgs,
      initial?: Partial<TConfig>,
  ): ObservableInput<TConfig> {
      // Check if a callback is registered for the'my.custom.config' target
      if (this._has('my.custom.config')) {
        // register a fallback value for the'my.custom.config' target if no callback is registered
        this._set('my.custom.config', async() => { return 42; });
      } else {
        // if a callback is registered, call it and log the result
        configCallback = this._get('my.custom.config');
        configValue$ = from(configCallback(init, initial));
        console.log(await lastValueFrom(configValue$));
      }
      return lastValueFrom(from(super._createConfig(init, initial)));
  }
}
```

> [!WARNING]
> the example code is not intended to be a working implementation of the `MyConfigBuilder` class. It is only intended to demonstrate how the new `_get` and `_has` methods can be used.

This change allows for more flexibility and easier extensibility of the `BaseConfigBuilder` class.
