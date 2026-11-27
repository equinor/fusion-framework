---
"@equinor/fusion-framework-dev-portal": patch
---

The dev portal now loads the EDS CSS variables and sets `data-color-scheme` on `<html>` from the system colour preference, updating it when the preference changes. Help, bookmark and person side-sheet colours use EDS CSS custom properties instead of hard-coded values, and the header bar uses the EDS surface, border and text variables, so you can preview apps in light and dark mode locally. The page and the area behind hosted apps use the EDS neutral surface background (`--eds-color-bg-neutral-surface`) instead of the browser default, which was black in dark mode.

The built-in fallback avatar image, which had fixed light colours, is removed. A person without a photo now shows the avatar's own placeholder.

Components that still use the JavaScript `tokens` object or a forced light theme, such as `@equinor/fusion-react-styles` and the side sheet, stay light until they are migrated.

Refs equinor/fusion-core-tasks#2755
