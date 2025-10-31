---
"@equinor/fusion-framework-module-ag-grid": patch
"@equinor/fusion-framework-react-ag-grid": patch
---

Improve AG Grid dependency management and version compatibility.

**Module package**: Updated peer dependency ranges to support AG Grid v34 with more flexible version constraints (`^34` for ag-grid packages, `^12` for ag-charts-enterprise).

**React package**: Moved AG Grid dependencies from peer dependencies to direct dependencies, simplifying installation for consumers. AG Grid packages are now automatically included when installing the React AG Grid module. Also simplified React peer dependency range to `^17 || ^18 || ^19`.
