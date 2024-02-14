---
title: Module Widget
category: Module
tag:
    - widget
    - config
    - builder
---

<ModuleBadge module="module-widget" />

## Configuration

The configuration of the widget module is elegantly straightforward. It is required only when displaying a widget, and is not necessary during development. For more details on displaying widgets, refer to the "Widget React" section in the guide.

::: code-tabs
@tab:active Basic

```ts
import { enableWidgetModule } from '@equinor/fusion-framework-module-widget';
export default (configurator: IAppConfigurator) => {
    enableWidgetModule(configurator);
};
```

@tab Custom Config

```ts
import { enableWidgetModule } from '@equinor/fusion-framework-module-widget';
export default (configurator: IAppConfigurator) => {
    enableWidgetModule(configurator, (builder)=> {
        builder.setApiVersion('2.0')
        builder.setBaseImportUrl('https://localhost:3000')
    });
}
```
