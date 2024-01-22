# @equinor/fusion-framework-module-feature-flag

## 0.0.1

### Patch Changes

-   [#1215](https://github.com/equinor/fusion-framework/pull/1215) [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d) Thanks [@odinr](https://github.com/odinr)! - Adding PersonSidesheet to cli with featuretoggler

-   [#1215](https://github.com/equinor/fusion-framework/pull/1215) [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d) Thanks [@odinr](https://github.com/odinr)! - - Added imports for createApiPlugin and createCgiPlugin from the ./plugins module.
    -   Updated the IFeatureFlagConfigurator interface with new method signatures.
        -   The addPlugin method now has a JSDoc comment describing its usage.
        -   The enableCgi method now has a JSDoc comment and parameter description.
        -   The enableApi method now has a JSDoc comment and parameter description.
    -   Modified the FeatureFlagConfigurator class:
        -   Added implemented interface IFeatureFlagConfigurator.
        -   Added a private property #plugins as an array of FeatureFlagPluginConfigCallback.
        -   Updated the addPlugin method to append the new plugin handler to the #plugins array.
        -   Added the enableCgi method, which calls createCgiPlugin with the passed arguments and adds the result to the #plugins array.
        -   Added the enableApi method, which does the same for createApiPlugin.
        -   Updated the \_processConfig method with additional type annotations and comments.
        -   Added a JSDoc comment for the plugins$ observable.
        -   Added a JSDoc comment for the initial$ observable.
        -   Added a JSDoc comment for the config$ observable.
        -   Updated the return statement to return config$.