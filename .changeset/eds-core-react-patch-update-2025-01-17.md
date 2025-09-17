---
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-react-components-bookmark": patch
"@equinor/fusion-framework-cookbook-app-react-feature-flag": patch
"@equinor/fusion-framework-cookbook-app-react-people": patch
"@equinor/fusion-framework-cookbook-app-react-charts": patch
---

chore: bump @equinor/eds-core-react from 0.45.1 to 0.49.0

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
