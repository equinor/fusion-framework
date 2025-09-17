---
"@equinor/fusion-framework-module-http": major
---

chore: bump zod from 3.25.76 to 4.1.8

### Breaking Changes Fixed
- Updated ZodError `.errors` to `.issues` property in capitalize-request-method operator
- Replaced `z.custom()` with `z.string().refine()` for better v4 compatibility in request method casing validation
- Simplified error message configuration in request method verb validation
- Updated error handling to use new zod v4 error structure

### Migration Notes
This is a major version update that requires careful testing. The HTTP module's zod validation patterns have been updated to be compatible with zod v4, including error handling and custom validation logic.

### Links
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)
