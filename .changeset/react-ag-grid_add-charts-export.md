---
"@equinor/fusion-framework-react-ag-grid": minor
---

Add new `./charts` export path for AG Charts React components and enterprise module.

The package now exports `AgCharts` and `AgChartsEnterpriseModule` from a dedicated `./charts` export path. This provides a cleaner separation from the enterprise exports.

```typescript
import { AgCharts, AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-grid/charts';
```

Note: Charts exports are still available from `./enterprise` for backward compatibility but will be removed in a future minor release.

Fixes: https://github.com/equinor/fusion-framework/issues/747
