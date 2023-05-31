---
'@equinor/fusion-framework-module': patch
---

__Change base behavior of BaseModuleProvider__

because of weird limitations of JavaScript, private fields are not accessible until all constructors are initialized (from ancestor to current child).
This causes the `abstract` init function could not access private members when overridden.

* __removed__ `init` from `BaseModuleProvider`
  - _this is a breaking change, but not yet published, yet the `patch` version_
  - https://github.com/equinor/fusion-framework/blob/43854d9538ade189483c43e04b52eff7e1aa3b0c/packages/modules/module/src/lib/provider/BaseModuleProvider.ts#L31
* __added__ `provider` sub-scope for package

> The usage when extending `BaseModuleProvider` is not as 😘, but now works
