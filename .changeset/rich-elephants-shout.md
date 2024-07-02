---
'@equinor/fusion-framework-module-ag-grid': patch
'@equinor/fusion-framework-module': patch
'@equinor/fusion-framework-module-event': patch
'@equinor/fusion-framework-module-http': patch
'@equinor/fusion-framework-app': patch
'@equinor/fusion-framework-cli': patch
'@equinor/fusion-framework': patch
'@equinor/fusion-framework-module-app': patch
'@equinor/fusion-framework-module-bookmark': patch
'@equinor/fusion-framework-module-context': patch
'@equinor/fusion-framework-module-feature-flag': patch
'@equinor/fusion-framework-module-msal': patch
'@equinor/fusion-framework-module-navigation': patch
'@equinor/fusion-framework-module-service-discovery': patch
'@equinor/fusion-framework-module-services': patch
'@equinor/fusion-framework-module-signalr': patch
'@equinor/fusion-framework-module-telemetry': patch
'@equinor/fusion-framework-module-widget': patch
'@equinor/fusion-framework-react-app': patch
'@equinor/fusion-framework-react-components-bookmark': patch
'@equinor/fusion-framework-react-components-people-provider': patch
'@equinor/fusion-framework-react': patch
'@equinor/fusion-framework-legacy-interopt': patch
'@equinor/fusion-framework-react-module-bookmark': patch
'@equinor/fusion-framework-react-module-context': patch
'@equinor/fusion-framework-react-module-event': patch
'@equinor/fusion-framework-react-module-http': patch
'@equinor/fusion-framework-react-module': patch
'@equinor/fusion-framework-react-module-signalr': patch
'@equinor/fusion-framework-react-widget': patch
'@equinor/fusion-log': patch
'@equinor/fusion-observable': patch
'@equinor/fusion-query': patch
'@equinor/fusion-framework-widget': patch
---

Removed the `removeComments` option from the `tsconfig.base.json` file.

Removing the `removeComments` option allows TypeScript to preserve comments in the compiled JavaScript output. This can be beneficial for several reasons:

1. Improved debugging: Preserved comments can help developers understand the code better during debugging sessions.
2. Documentation: JSDoc comments and other important code documentation will be retained in the compiled output.
3. Source map accuracy: Keeping comments can lead to more accurate source maps, which is crucial for debugging and error tracking.

No action is required from consumers of the library. This change affects the build process and doesn't introduce any breaking changes or new features.

Before:

```json
{
    "compilerOptions": {
        "module": "ES2022",
        "target": "ES6",
        "incremental": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "sourceMap": true,
        "moduleResolution": "node"
    }
}
```

After:

```json
{
    "compilerOptions": {
        "module": "ES2022",
        "target": "ES6",
        "incremental": true,
        "preserveConstEnums": true,
        "sourceMap": true,
        "moduleResolution": "node"
    }
}
```

This change ensures that comments are preserved in the compiled output, potentially improving the development and debugging experience for users of the Fusion Framework.
