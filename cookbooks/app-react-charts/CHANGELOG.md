# Change Log

## 1.2.3-next.1

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab) Thanks [@odinr](https://github.com/odinr)! - relase next

- Updated dependencies [[`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab)]:
  - @equinor/fusion-framework-react-router@1.0.0-next.1
  - @equinor/fusion-framework-react-ag-grid@34.4.2-next.0

## 1.2.3-next.0

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8) Thanks [@odinr](https://github.com/odinr)! - Migrate cookbook from legacy router pattern to `@equinor/fusion-framework-react-router`.

  Updated the charts cookbook to use the new React Router DSL API:
  - Replaced `useRouter()` hook with `Router` component from `@equinor/fusion-framework-react-router`
  - Migrated route definitions to use DSL functions (`layout`, `index`, `route`, `prefix`) from `@equinor/fusion-framework-react-router/routes`
  - Moved Root component to separate `pages/Root.tsx` file using the new layout pattern
  - Simplified route structure using the DSL's `prefix` helper for nested routes

  This cookbook now serves as an example of the recommended routing pattern for Fusion Framework applications.

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b) Thanks [@odinr](https://github.com/odinr)! - relase next

- Updated dependencies [[`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b), [`75c068f`](https://github.com/equinor/fusion-framework/commit/75c068fea13c32435ac26bd9043cc156482bfaf1), [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8)]:
  - @equinor/fusion-framework-react-router@1.0.0-next.0

## 1.2.2

### Patch Changes

- [#3816](https://github.com/equinor/fusion-framework/pull/3816) [`7c57951`](https://github.com/equinor/fusion-framework/commit/7c57951c57763f567a1284e81f903dd892a023ed) Thanks [@odinr](https://github.com/odinr)! - Update AG Charts imports to use new `@equinor/fusion-framework-react-ag-grid/charts` export path.

  Migrate from direct `ag-charts-react` imports to the framework's unified charts export.

## 1.2.1

### Patch Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Improved all cookbook README documentation for better developer experience.

  All cookbook README files now feature:
  - Code examples matching actual implementations
  - Inline comments explaining patterns and concepts
  - Developer-friendly language for those new to Fusion Framework
  - Focus on what each cookbook demonstrates rather than generic setup
  - Proper TSDoc comments in code blocks
  - Removed installation sections in favor of teaching patterns

  This improves the learning experience for developers exploring framework features through the 18 available cookbooks.

## 1.2.0

### Minor Changes

- [#3613](https://github.com/equinor/fusion-framework/pull/3613) [`ea7db15`](https://github.com/equinor/fusion-framework/commit/ea7db15e9b84380c2a440ede414c5862475e1c99) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Added AG Charts to React Charts cookbook

  This update introduces AG Charts (ag-charts-community and ag-charts-react) as an alternative charting library alongside the existing Chart.js implementation. The cookbook now demonstrates both charting solutions with examples.

  ## New Features
  - **AG Charts Integration**: Added ag-charts-community and ag-charts-react dependencies
  - **Chart Components**: Four new AG Charts examples:
    - `AgBar` - Bar chart implementation
    - `AgPie` - Pie chart implementation
    - `AgLine` - Line chart implementation
    - `AgArea` - Area chart implementation
  - **Navigation Updates**: Enhanced navigation to include AG Charts examples
  - **Styling**: Added styled-components for improved component styling

  ## Dependencies Added
  - `ag-charts-community: ^12.2.0` - Core AG Charts library
  - `ag-charts-react: ^12.2.0` - React bindings for AG Charts
  - `styled-components: ^6.1.19` - CSS-in-JS styling solution

  ## Usage

  The cookbook now provides side-by-side examples of both Chart.js and AG Charts implementations, allowing developers to compare and choose the best charting solution for their Fusion applications. All examples include sample data and demonstrate common chart types used in enterprise applications.

### Patch Changes

- [#3657](https://github.com/equinor/fusion-framework/pull/3657) [`0864ebf`](https://github.com/equinor/fusion-framework/commit/0864ebfad1cb8693c55e7fb3a38e059e4378a0bf) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump react-chartjs-2 from 5.3.0 to 5.3.1 to update React monorepo compatibility and use jsx-runtime; no public API changes.

## 1.1.0

### Minor Changes

- [#3062](https://github.com/equinor/fusion-framework/pull/3062) [`f1d20be`](https://github.com/equinor/fusion-framework/commit/f1d20be3d8f3ee69b46e0ba94a7458909f586d1e) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Add new React charts cookbook with Chart.js integration

  ### Features
  - Chart.js integration for data visualization
  - Bar chart and line chart examples
  - Navigation component for chart types
  - Complete cookbook structure with routing

  ### Links
  - [Chart.js documentation](https://www.chartjs.org/docs/)
  - [Fusion Framework issue #566](https://github.com/equinor/fusion/issues/566)

### Patch Changes

- [#3400](https://github.com/equinor/fusion-framework/pull/3400) [`aed6c53`](https://github.com/equinor/fusion-framework/commit/aed6c5385df496a86d06dc0af9dacafc255ea605) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/eds-core-react from 0.45.1 to 0.49.0

  ### New Features
  - ✨ Always show "add new option" in Autocomplete when onAddNewOption is provided
  - ✨ Tabs call onChange with provided value if present
  - ✨ Add disabled prop to Tooltip
  - ✨ Autocomplete allow option-label prop to be used without type of object
  - ✨ Add support for adding new options in Autocomplete

  ### Bug Fixes
  - 🐛 Autocomplete - Don't call onOptionsChange when clicking "Add new"
  - 🐛 Table - Fix Firefox table header wrapping issue
  - 🐛 Tabs documentation type mismatch - update onChange parameter from number to number | string
  - 🐛 DatePicker Disable back button in year range based on year, not month
  - 🐛 Tabs now allow 'null' value as child element 'Tabs.List' and 'Tabs.Panel'
  - 🐛 Autocomplete prevent onAddNewOption from being called twice in Strict Mode
  - 🐛 Table export table row with pascal case
  - 🐛 Autocomplete: Improvements to placeholder text
  - 🐛 Menu: Ensure onClose is called when a MenuItem without onClick is clicked

  ### Links
  - [GitHub releases](https://github.com/equinor/design-system/releases/tag/eds-core-react%400.49.0)
  - [npm changelog](https://www.npmjs.com/package/@equinor/eds-core-react?activeTab=versions)
