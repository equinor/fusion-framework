---
"@equinor/fusion-framework-react-router": minor
---

Add `createMiddleware` for typed middleware definitions. The factory infers router arguments and the continuation, supports specialized route parameters, application context and downstream results, and preserves the original callback's signature and execution. React App's routing entry point re-exports the same factory.
