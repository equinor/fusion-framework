# @equinor/fusion-framework-react-widget

## 1.0.0

### Major Changes

-   [#1746](https://github.com/equinor/fusion-framework/pull/1746) [`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86) Thanks [@Noggling](https://github.com/Noggling)! - Widget has had a complete makeover all from the loading Component to the Module itself.
    -   adding events to widget module some include `onWidgetInitialized` , `onWidgetInitializeFailure` and `onWidgetScriptLoaded` and more.
    -   Enabling for multiple widget loading.
    -   Complex overhaul on the widget configuration utilizing th new BaseConfigBuilder class.
    -   Now able to configure baseImport url and widgetClient
    -   New widget component for loading of widgets
    -   Updated documentation

### Patch Changes

-   Updated dependencies [[`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86)]:
    -   @equinor/fusion-framework-module-widget@3.0.0
    -   @equinor/fusion-framework-widget@1.0.29
