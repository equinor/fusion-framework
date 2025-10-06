---
"@equinor/fusion-framework-module-http": patch
---

Fixed capitalizeRequestMethodOperator to handle undefined HTTP method values.

The operator was throwing a Zod validation error when request.method was undefined, expecting a string but receiving undefined. Updated the requestMethodCasing schema to properly handle optional method values and added test coverage for undefined method scenarios.
