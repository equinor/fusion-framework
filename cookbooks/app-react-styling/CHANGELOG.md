# @equinor/fusion-framework-cookbook-app-react-styling

## 1.1.2

### Patch Changes

- 2899c8a: Internal: rebase `next` onto `main`, syncing in already-published stable releases so they carry a `next` pre-release tag.

## 1.1.2-next.0

### Patch Changes

- c8008e3: Internal: rebase `next` onto `main`, syncing in already-published stable releases so they carry a `next` pre-release tag.

## 1.1.1

### Patch Changes

- 80c3e4a: Internal: resolve `fusion-lint` warnings across `Demo.tsx`, `Text.tsx`, `Title.tsx`, and `config.ts`. No behavior change.

## 1.1.0

### Minor Changes

- ffe9b06: Update @equinor/fusion-react-styles to provide EDS variables

## 1.0.0

### Major Changes

- abffa53: Add new cookbook demonstrating React 19 compatible version of `@equinor/fusion-react-styles`.

  This cookbook showcases:
  - ThemeProvider setup and usage
  - makeStyles and createStyles patterns
  - Theme value access patterns (getVariable, .css, .attributes)
  - Dynamic styles with props
  - CSS-in-JS with classes instead of inline styles
  - Automatic stylesheet cleanup on component unmount

  The cookbook tests the React 19 compatible version of fusion-react-styles with Material-UI dependency removed.

  Related to: https://github.com/equinor/fusion-framework/issues/3698
