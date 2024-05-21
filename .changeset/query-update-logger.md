---
"@equinor/fusion-query": patch
---

## @equinor/fusion-query

### Updated Logger Dependency

Replaced the internal logger implementation with the `@equinor/fusion-log` package. This change affects the following files:

- `package.json`: Removed `chalk` dependency and added `@equinor/fusion-log`.
- `src/Query.ts`: Updated import statements to use `@equinor/fusion-log`.
- `src/QueryTask.ts`: Updated import statements to use `@equinor/fusion-log`.
- `src/client/QueryClient.ts`: Updated import statements to use `@equinor/fusion-log`.
- Deleted `src/logger.ts` as it is no longer needed.

```typescript
typescript
// Before
import { ConsoleLogger, ILogger } from './logger';

// After
import { ConsoleLogger, ILogger } from '@equinor/fusion-log';
```
