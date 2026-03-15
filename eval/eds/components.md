# Components

These queries test whether the EDS index surfaces accurate component documentation
when developers ask about EDS React component usage, props, patterns, and examples.

When judging results, verify that:
- Results reference `@equinor/eds-core-react` as the component package.
- Props tables include correct prop names, types, and defaults — not invented values.
- Code examples use the correct import path and valid JSX patterns.
- Component guidelines (do/don't, accessibility) are surfaced alongside props when available.
- Subcomponent composition patterns (e.g., `Dialog.Header`, `Accordion.Item`) are shown accurately.

## How to use the Button component with different variants and colors

- must mention `Button` from `@equinor/eds-core-react`
- must list the `variant` prop with values including `contained`, `outlined`, `ghost`
- must list the `color` prop with values `primary`, `secondary`, `danger`
- must show a code example with Button JSX
- should mention `href` prop for link-style buttons
- should mention `fullWidth` prop

## How to open and close a Dialog modal in EDS

- must mention `Dialog` from `@equinor/eds-core-react`
- must show the `open` prop as required for controlling dialog visibility
- must mention `onClose` callback for handling close events
- must mention `isDismissable` prop for ESC key and outside-click dismissal
- should show subcomponent composition: `Dialog.Header`, `Dialog.Title`, `Dialog.CustomContent`, `Dialog.Actions`
- should include a code example showing controlled open/close state

## How to use Accordion with controlled expand state

- must mention `Accordion` from `@equinor/eds-core-react`
- must mention `Accordion.Item` subcomponent with `isExpanded` prop
- must mention `onExpandedChange` callback for controlled state
- must show `chevronPosition` prop with `left` and `right` options
- should mention `headerLevel` prop for semantic heading levels
- should mention `disabled` prop on `Accordion.Item`

## How to use Tabs for navigation in EDS

- must mention `Tabs` from `@equinor/eds-core-react`
- must show `Tabs.List` and `Tabs.Tab` subcomponent pattern
- must mention `activeTab` and `onChange` for controlled tab switching
- should show `Tabs.Panels` and `Tabs.Panel` for content panels
- should mention `variant` prop for tab styling options

## How to show a Snackbar notification in EDS

- must mention `Snackbar` from `@equinor/eds-core-react`
- must show `open` prop for controlling visibility
- must mention `onClose` callback
- must mention `autoHideDuration` for auto-dismiss timing
- should show action button pattern inside Snackbar
- should mention placement and stacking behavior

## How to use Autocomplete with search and selection in EDS

- must mention `Autocomplete` from `@equinor/eds-core-react`
- must show `options` prop for providing selectable items
- must mention `onOptionsChange` callback for handling selection
- must mention `label` prop
- should mention `multiple` prop for multi-select
- should mention `optionLabel` for custom display text

## How to create a Card layout in EDS

- must mention `Card` from `@equinor/eds-core-react`
- must show subcomponent composition: `Card.Header`, `Card.Content`, `Card.Actions`
- must mention `variant` prop with `default`, `info`, `warning`, `danger`
- should show `Card.HeaderTitle` for title content
- should show `Card.Media` for image/media content

## How to use the SideSheet component in EDS

- must mention `SideSheet` from `@equinor/eds-core-react`
- must show `open` prop for controlling visibility
- must mention `onClose` callback
- should mention `variant` prop for different side sheet sizes
- should show content composition pattern with header and body
