---
"@equinor/fusion-framework-module-http": major
---

chore: bump zod from 3.25.76 to 4.1.8

Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified error handling in the HTTP module to use ZodError `.issues` property instead of `.errors` and replaced `z.custom()` with `z.string().refine()` for better v4 compatibility.

Key changes in source code:
- Updated ZodError `.errors` to `.issues` property in capitalize-request-method operator
- Replaced `z.custom()` with `z.string().refine()` for better v4 compatibility in request method casing validation
- Simplified error message configuration in request method verb validation
- Updated error handling to use new zod v4 error structure

Breaking changes: Error handling structure has changed to use new zod v4 error format.

Links:
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)
