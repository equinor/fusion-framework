---
'@equinor/fusion-framework-module-feature-flag': patch
'@equinor/fusion-observable': patch
'@equinor/fusion-query': patch
---

Updated `uuid` from `^9.0.16` to `^10.0.0`. This update includes breaking changes where support for Node.js versions 12 and 14 has been dropped, and Node.js version 20 is now supported. Additionally, it introduces support for RFC9562 MAX, v6, v7, and v8 UUIDs.

**Migration Guide**
Consumers should ensure their environments are using Node.js version 16 or higher to avoid compatibility issues. If you are using Fusion Framework, you do not need to take any action as Fusion Framework already requires Node.js version 18 or higher.

[Link to `immer` v10.0.0 release notes](https://github.com/uuidjs/uuid/blob/main/CHANGELOG.md)
