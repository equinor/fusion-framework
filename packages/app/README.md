# @equinor/fusion-framework-app

> support package for initializing application modules 

## 📚 read the [Doc](https://equinor.github.io/fusion-framework/)

## Bookmarks

The bookmark module provides a way to save and restore the state of the application. This is useful for saving the state of the application when the user navigates away from the application and then returns to the application.

> [!IMPORTANT]
> please use the `enableBookmark` from  `@equinor/fusion-framework-app/bookmark` or `@equinor/fusion-framework-react-app/bookmark` to enable the bookmark module.

> [!WARNING]
> The application must be install the `@equinor/fusion-framework-module-bookmark` package to use the bookmark module.
> 
> __Do not use the `enableBookmark` from that package when developing Fusion Apps__
>
> _We might in the future allow application configure their own module, but for now, use the enabler in the app package_

### Usage

```ts
import type { AppModuleInitiator, IAppConfigurator } from '@equinor/fusion-framework-react-app';

import { enableBookmark } from '@equinor/fusion-framework-react-app/bookmark';

export const configure: AppModuleInitiator = (configurator: IAppConfigurator) => {
    enableBookmark(configurator);
};
```

