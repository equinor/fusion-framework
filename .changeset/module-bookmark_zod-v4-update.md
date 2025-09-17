---
"@equinor/fusion-framework-module-bookmark": major
---

feat: migrate to zod v4

Updated the bookmark module to be compatible with zod v4, including:

### Dependency Updates
- Updated zod dependency from v3.25.76 to v4.1.8

### Schema Definition Changes
- Fixed record schema definitions to use explicit key and value types (`z.record(z.string(), z.unknown())`)
- Simplified function schema definitions by removing complex chaining (`.args()` and `.returns()`)
- Updated generic type constraints to work with zod v4's improved type inference

### Type System Improvements
- Replaced zod-inferred types with explicit TypeScript interfaces for better performance
- Enhanced `BookmarkData` type definition with proper generic constraints
- Added default type parameters for better type inference (`T extends BookmarkData = BookmarkData`)
- Improved type safety for bookmark payload generation

### Code Quality Enhancements
- Added explicit type annotations and better error handling
- Improved function return type definitions
- Enhanced code comments and documentation
- Added helper functions for config parsing (`parseBookmarkConfig`)

### Breaking Changes
- Schema validation behavior may differ due to zod v4's stricter type checking
- Function schema definitions now require explicit typing
- Record schemas must specify both key and value types explicitly

This migration ensures compatibility with zod v4's improved type system and performance optimizations while maintaining the same public API.
