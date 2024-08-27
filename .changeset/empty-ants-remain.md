---
'@equinor/fusion-framework-module': patch
---

Improved Configuration Callback Handling

BaseConfigBuilder.\_buildConfig will now correctly handle asynchronous configuration callbacks. This change simplifies the handling of asynchronous configuration callbacks by removing the `async` keyword and directly using RxJS operators.
