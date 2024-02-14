---
title: Widget Component
category: Guide
tag:
    - widget
    - component
    - config
---

## Installation

```sh
npm install @equinor/fusion-framework-react
```

Fist one ned to enable the widget module

```ts
import { enableWidgetModule } from '@equinor/fusion-framework-react/widget';
export default (configurator: IAppConfigurator) => {
    enableWidgetModule(configurator);
};
```

## Widget Component

Utilizing the widget component is straightforward; only the essential "name" parameter is required.

::: code-tabs
@tab:active Basic
```jsx
import { Widget } from "@equinor/fusion-framework-react/widget"

<Widget name='my-widget-id' />
```

@tab Version Select 
```jsx
import { Widget } from "@equinor/fusion-framework-react/widget"

<Widget name='my-widget-id' widgetVersion={{
        type: 'version' 
        value: '1.0.4'
    }} />
```

@tab With Props 
```jsx
import { Widget } from "@equinor/fusion-framework-react/widget"

<Widget name='my-widget-id' props={{ someWidgetProp: 'Hello Widget' }} />
```
