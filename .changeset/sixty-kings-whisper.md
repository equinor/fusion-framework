---
'@equinor/fusion-framework-module-widget': major
'@equinor/fusion-react-widget': major
'@equinor/fusion-framework-widget': patch
---

Widget has had a complete makeover all from the loading Component to the Module itself.
- adding events to widget module some include  `onWidgetInitialized` , `onWidgetInitializeFailure` and `onWidgetScriptLoaded` and more.
- Enabling for multiple widget loading.
- Complex overhaul on the widget configuration utilizing th new BaseConfigBuilder class.
- Now able to configure baseImport url and widgetClient
- New widget component for loading of widgets
- Updated documentation
