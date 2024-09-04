**@equinor/fusion-framework-module:**

Updated the `_buildConfig` method in `BaseConfigBuilder` to improve error handling and configuration merging.

- Enhanced `_buildConfig` to log errors when a configuration callback fails, providing more detailed error messages.
- Improved the merging process of configuration callbacks by filtering out undefined values and mapping them to target-value pairs.
- Updated the `_buildConfig` method to initialize the accumulator with the initial configuration or an empty object.

```ts
type MyConfig = {
  foo?: number;
  bar?: string;
}

const initial = {foo: 1, bar: 'baz'};

export class MyConfigurator extends BaseConfigBuilder<MyConfig> {
  setFoo(cb: ConfigBuilderCallback<MyConfig['foo']>){
    this._set('foo', cb);
  }
  setBar(cb: ConfigBuilderCallback<MyConfig['bar']>){
    this._set('bar', cb);
  }
}

const configurator =  MyConfigurator();

configurator.setFoo(async () => {
  if(someCondition) // do some async work
});

configurator.setBar(() => {
  return 'override';
});

configurator.createConfig(initial).subscribe(console.log);
```
_Output:_

```diff
- {foo: undefined, bar: 'override'}
+ {foo: 1, bar: 'override'}
```

Example of a failed configuration callback:

```ts
configurator.setFoo(async () => {
  throw new Error('Failed to set foo');
});
```

_Output:_
```diff
- Configuration failed
+ {foo: 1, bar: 'override'}
```