# Change Log

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
