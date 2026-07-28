# Dev Portal Header Test Cookbook

This cookbook provides a focused manual test harness for the `Header` component in
`packages/dev-portal/src/Header.tsx`. Use it when changing the Fusion Framework CLI dev portal top
bar, context selector, bookmark side sheet, or person side sheet.

The cookbook does not render a copy of `Header`. Running the app through
`fusion-framework-cli app dev` loads it inside the real dev portal, which owns and renders
`Header`. The app enables the context and bookmark modules that the Header discovers from the
current app.

## Run the Test Harness

From the repository root:

```sh
pnpm --filter @equinor/fusion-framework-cookbook-app-react-header dev
```

Open the URL printed by the CLI. The page displays stacking test content below the portal Header.
The `predev` script rebuilds `@equinor/fusion-framework-dev-portal` first, ensuring the test uses
the current `Header.tsx` implementation instead of an older `dist` artifact. Restart the cookbook
after making additional Header changes.

## Verify Header Behavior

1. **Layout**: Confirm the Fusion logo, title, actions, and context selector fit in the 48-pixel top
   bar without clipping.
2. **Z-index scrolling**: Scroll through the vertical content layers with z-index values from 0
   through 3 and representative values up to 999999. Confirm every layer remains in normal document
   flow and below the Header.
3. **Sticky content**: Scroll the app and confirm the sticky content remains pinned directly below
   the portal top row and above all z-index test layers. Open the context selector and confirm its
   dropdown appears above the sticky content.
4. **Content side sheet**: Select **Open side sheet** in the sticky content and confirm the side
   sheet and scrim appear above the Header and all z-index test rows.
5. **Header controls**: Open and close the context selector, bookmark side sheet, and person side
   sheet directly from the Header.

Context search, bookmark persistence, and person data require an authenticated development
environment with the corresponding Fusion services available.

## Why This Works

`src/config.ts` calls `enableContext` and `enableBookmark`. The dev portal `Header` reads these
app-scoped modules with `useCurrentAppModule`, so the context selector appears and the bookmark
action becomes enabled.
