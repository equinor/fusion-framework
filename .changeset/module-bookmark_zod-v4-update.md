---
"@equinor/fusion-framework-module-bookmark": major
---

feat: migrate to zod v4

Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified schema definitions in the bookmark module to use explicit key and value types for records, simplified function schema definitions, and replaced zod-inferred types with explicit TypeScript interfaces.

Key changes in source code:
- Fixed record schema definitions to use explicit key and value types (`z.record(z.string(), z.unknown())`)
- Simplified function schema definitions by removing complex chaining (`.args()` and `.returns()`)
- Replaced zod-inferred types with explicit TypeScript interfaces for better performance
- Enhanced `BookmarkData` type definition with proper generic constraints
- Added helper functions for config parsing (`parseBookmarkConfig`)

Breaking changes: Record schemas must specify both key and value types explicitly. Function schema definitions now require explicit typing.

Links:
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)
