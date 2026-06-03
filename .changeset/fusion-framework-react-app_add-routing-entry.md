---
"@equinor/fusion-framework-react-app": minor
---

Add `./routing` entry point that re-exports the full public API of
`@equinor/fusion-framework-react-router` and its route builder DSL.

App, portal, and widget consumers can now import all routing primitives from a single package
without adding `@equinor/fusion-framework-react-router` as a direct dependency.

Requires `@equinor/fusion-framework-react-router` (optional peer dependency):

```bash
pnpm add @equinor/fusion-framework-react-router
```

**Usage:**

```ts
import { Router } from '@equinor/fusion-framework-react-app/routing';
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-app/routing';
import { useNavigate, useParams, Link } from '@equinor/fusion-framework-react-app/routing';
```

All exports from `@equinor/fusion-framework-react-router` and its `/routes` DSL are available
from this single entry point.
