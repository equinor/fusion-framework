---
'@equinor/fusion-framework-module': minor
---

Add possibility to add multilevel config for module

```ts
type MyModuleConfig = {
     foo: string;
     bar?: number,
     nested?: { up: boolean }
};

class MyModuleConfigurator extends BaseConfigBuilder<MyModuleConfig> {
  public setFoo(cb: ModuleConfigCallback<string>) {
      this._set('foo', cb);
  }

  public setBar(cb: ModuleConfigCallback<number>) {
    this._set('bar', cb);
  }

  public setUp(cb: ModuleConfigCallback<boolean>) {
    this._set('nested.up', cb);
  }
}
```
