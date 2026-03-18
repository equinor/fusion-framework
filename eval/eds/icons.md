# Icons

These queries test whether the EDS index surfaces useful information about EDS icons
— finding icons by name or purpose, importing them, and using them in React.

When judging results, verify that:
- Icon names referenced are real exports from `@equinor/eds-icons`.
- Import examples use the correct named export pattern.
- React usage shows `Icon` component from `@equinor/eds-core-react` with `data` prop.
- Results don't fabricate icon names that don't exist in the package.

## How to import and use an EDS icon in React

- must mention `@equinor/eds-icons` for icon data imports
- must mention `Icon` component from `@equinor/eds-core-react`
- must show the pattern: `import { save } from '@equinor/eds-icons'` and `<Icon data={save} />`
- should mention that icons are imported as named exports (JavaScript objects, not SVG files)
- should mention TypeScript 3.8+ requirement

## What icon to use for delete or trash action

- must reference an icon name from `@equinor/eds-icons` related to delete (e.g., `delete_to_trash`, `delete_forever`)
- must show how to import it: `import { delete_to_trash } from '@equinor/eds-icons'`
- should show React usage with `<Icon data={delete_to_trash} />`
- should mention the icon category (action icons)

## What warning or alert icons are available in EDS

- must reference at least one warning-related icon from `@equinor/eds-icons` (e.g., `warning_filled`, `warning_outlined`, `error_filled`)
- must show the import pattern for the icon
- should mention multiple warning/alert icon variants
- should show how to use with the `Icon` component

## How to find and browse available EDS icons

- must reference `@equinor/eds-icons` as the icon package
- must mention that icons are available as named exports
- should reference the EDS Storybook icon preview or icon documentation
- should mention that the package contains system icons from the Equinor Design System

## How to customize icon size and color in EDS

- must mention the `Icon` component from `@equinor/eds-core-react`
- must mention the `size` prop or CSS-based sizing for icons
- should mention `color` prop or CSS color inheritance
- should reference `--eds-sizing-icon-*` tokens for consistent icon sizing
