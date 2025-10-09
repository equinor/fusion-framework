---
"@equinor/fusion-framework-react-ag-grid": patch
---

Add AgChartsEnterpriseModule support for charting

- **Added AgChartsEnterpriseModule export**: Now available from `@equinor/fusion-framework-react-ag-grid/enterprise`
- **New dependency**: Added `ag-charts-enterprise` as direct dependency (12.2.0)
- Updated enterprise.ts to include AG Charts Enterprise module alongside existing AG Grid enterprise modules

## Usage

Users can now import and use the AgChartsEnterpriseModule for advanced charting features:

```ts
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';

// Use in AG Grid configuration
enableAgGrid(configurator, (builder) => {
    builder.addModule(AgChartsEnterpriseModule);
});
```
