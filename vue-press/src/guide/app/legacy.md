---
title: Legacy
category: Guide
tags:
  - guide
  - legacy
  - routing
---

:::danger Legacy packages
__@eqiunor/fusion-api__ and __@eqiunor/fusion-components__ do not work well with __@equinor/fusion-framework__, since they are tightly couple with the __Project Portal__.
When using the __@equinor/fusion-framework-cli__, these packages will not work at all!
:::

![Legacy](./legacy.png)

:::warning Inter opt
During a grace period and for easing into the framework, applications (only works in __Project Portal__) can provide a render method to access the framework

```ts
import { registerApp as registerLegacy } from '@equinor/fusion';
import { createLegacyApp } from '@equinor/fusion-framework-react-app';

const AppComponent: React.ComponentType = () => { ... }

registerLegacy(
  'my-app', 
  {
    /** note when providing render, application must handle routing */
    render: createComponent(AppComponent, (configurator) => {...}),
    AppComponent,
  }
);
```
> A portal might use this functionality for render legacy applications [see LegacyFusionWrapper](https://github.com/equinor/fusion-framework/blob/main/packages/react/legacy-interopt/src/components/LegacyFusionWrapper.tsx)
:::


## React Router 5

For some apps, replacing `react-router` is a daunting task. 
With this method the app will initialize modules and consume the framework.

- <ModuleBadge module="react/app" />
- <ModuleBadge module="modules/navigation" />

### Legacy router
```jsx
import { createBrowserHistory } from 'history';
import { useObservableSubscription } from '@equinor/fusion-observable/react';
import { type NavigationModule } from '@equinor/fusion-framework-module-navigation';

/** this is only needed if your code uses `useHistory` from '@equinor/fusion'  */
import { HistoryContext } from '@equinor/fusion';

/**
 * Create a legacy history object and connect to framework navigation 
 */ 
const useLegacyHistory = () => {
    const navigation = useAppModule<NavigationModule>('navigation');
    const history = useMemo(() => {
            return createBrowserHistory({basename: navigation.navigator.basename});
        }, 
        [createBrowserHistory, navigation]
    );

    /** observe changes of framework navigation */
    useObservableSubscription(navigation, useCallback((next) => {
            /** stringify path, don't trust path`s are compatible */
            history.replace([
                next.path.pathname, 
                next.path.hash, 
                next.path.search
            ].join(''));
        }, [history])
    );

    return history;
}
export const LegacyRouter = (props: {children: React.ReactNode}) => {
    const history = useLegacyHistory();
    return (
      <HistoryContext.Provider value={{ history }}>
          <BrowserRouter>
              <Router history={history}>
                  {props.children}
              </Router>
          </BrowserRouter>
      </HistoryContext.Provider>
    );
} 
```

### Register app
```jsx
import { registerApp } from '@equinor/fusion';
import { createComponent } from '@equinor/fusion-framework-react-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

import { App } from './App';
import { LegacyRouter } from './LegacyRouter';

export const renderApp = createComponent(
  <LegacyRouter>
    <App />
  </LegacyRouter>, 
  (configurator, { env }) => {
    enableNavigation(configurator, env.basename);
  }
);

registerApp('my-app', { App, render });
```
