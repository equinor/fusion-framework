---
"fusion-framework": minor
---

### Enhance DotPath Utility and Config Builder Flexibility

- Improved the `DotPath` utility to support deeper type resolution, including arrays and nominal class types.
- Updated `BaseConfigBuilder` to use the new `DotPathUnion` and `DotPathType` types for better type safety and flexibility.
- Enhanced `_set` in `BaseConfigBuilder` to accept both direct values and callbacks, improving usability.
- Introduced and exported `ModuleConfiguratorConfigCallback` type for better type safety in module configuration.
- Re-exported `ModuleConfiguratorConfigCallback` in the public API for accessibility.

These changes improve type safety, developer experience, and flexibility when working with nested configurations and module builders.
