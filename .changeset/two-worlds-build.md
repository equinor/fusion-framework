---
"@equinor/fusion-framework-module-ag-grid": major
"@equinor/fusion-framework-react-ag-grid": major
---

## Breaking Changes: Upgrade to AG Grid v35

**AG Grid upgraded from v34.3.1 to v35.1.0**

### Removed AG Charts Integration

The AG Charts integration has been **removed** from both packages. If you need AG Charts functionality, install and import the packages directly:

```typescript
// Before
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-grid/charts';

// After
// Install @equinor/fusion-framework-react-ag-charts separately
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';
import { AgCharts } from '@equinor/fusion-framework-react-ag-charts';
```

### Updated Peer Dependencies

- `ag-grid-community`: `>=35.1.0` (previously `>=33.0.3`)
- `ag-grid-enterprise`: `>=35.1.0` (previously `>=33.0.3`)
- Removed `ag-charts-enterprise` peer dependency

### Compatibility Fix

Added automatic detection and correction for v34→v35 state migration issues. If you're upgrading from v34, the framework will automatically handle the internal `agStyleInjectionState` structure change that could cause crashes when mixing v34 and v35 bundles.
