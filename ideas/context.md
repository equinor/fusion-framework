```ts
interface IContextModuleConfig {
  
  createContextClient(modules: Modules)?: IContextClient;

  /** 
   * Callback function for creating the context manager
   * 
   * - as a Framework this will create a new ContextManager with a ContextClient
   * - as a consumer (app/portal) this will return the instance from the Framework
  */
  createContextManager(modules: Modules)?: IContextManager;

  /** Callback for setting current context when the module is initialized */
  resolveInitialContext?: (args: { context: ContextItem, history: {items: ContextItem[]} }) => ContextItem;

  persistAppStateOnContextChanged?: boolean;
  onContextChanged?: (args: {
    context: {cur: ContextItem, prev: ContextItem}
    modules: Modules
  })

  /** Callback for what the context provider should return on a search */
  searchContexts?: (
      args: { query: string },
      modules: Modules
  ) => ContextItem[];

  /** defined types which the ContextManager should filter for in the ContextClient  */
  contextType?: string[];

  /** defined query string for filtering context in the  ContextClient */
  contextFilter?: string;

}
```

```ts
const onContextChanged = (args: {
    context: {cur: ContextItem, prev: ContextItem}
    modules: Modules
  }) => {
    if(!this.persistAppStateOnContextChanged){
      modules.navigate.to('somewhere')
    }
  }
```
When context change the framework context module will fire an event 
FrameWork => ContextManager => fireOnContextChange => App.ContextManager => event.preventDefault()

FrameWork => if(!event.defaultPrevented) navigate.to(/context/${contextId});
```tsx
// portal
const Foo = () => {
  return <ContextPicker onSelect={(context) => Fusion.context.setCurrentContext(context)} />
}

// ContextProvider | ContextManager
Fusion.context.onContextChange = (e: ContextChangedEvent): void => {
  const newUrl = oldUrl.replaceContextId(context.id);
  Fusion.navigate.to('app/CURRENT_APP/CONTEXT_ID', 'replace');
};

// somewhere

const App () => {
  const context = useModule('context');
  context.setContextById('magic');
}

// framework contextManager 
class ContextManager {
  setCurrentContext(context){
    this.dispatchContextChanged(context);
  }
  dispatchContextChanged(context) {
    const e = new ContextChangedEvent(context);
    ...
    this.onContextChange(e);
  }
}

// app
config.onContextChange = (e: ContextChangedEvent, modules: Modules) => {
  const {prev} = e.detail;
  modules.state.set('last_active_something', prev.foo.bar);
  e.preventDefault();
  // modules.navigate.to('/myroute/', 'replace');
  modules.context.setContext('orgContext');
}
```
```ts
class ContextManager {
  someFunction(){
    context.onCange((prev,next) => {
      if(this._config.onContextChanged){
        this._config.onContextChanged(prev,next);
      } else if (this._config.persistAppStateOnContextChanged) {

      }
    })
  }
}
```


```ts
export const module: ContextModule = {
    name: moduleKey,
    configure: async (
        modules
    ) => {
      // internally subscribe on context change from provided context manager
      return new ContextConfigurator(modules.context);
    },
    initialize: async (config): Promise<IAppConfigProvider> => {
        
    },
};
```

import { jsonSelector } from "@equinor/fusion-framework-module-http"

{portal}/app/{app-key}/123-23412-22/
{portal}/app/{app-key}/dsads?contextId=123

js.equinor.com/app/

{portal}/app/{app-key}/:contextId/
const context = useParam(contextId);

/context/123/contract/123456 => /context/321/contract/123456 => 'could not find contract xxx';

/123

/123/contracts?flyout1=open

/departments?query=tdi


resolveInitialContext?: (args: { context: ContextItem, history: {items: ContextItem[]} }) => ContextItem;

resolveInitialContext({
  context: something
})

// /context/123/contract/123456
onContextChanged(event: {detail: {context: ContextItem, prev?: ContextItem}}, modules: ModuleInstances): Promise<{baseUrl: string}>{
    await = modules.http.fetch('something');
    const attr = modules.state.get('myAttribute');
    // contract/123456
    const currentRoute = modules.navigate.getCurrentPath();
    switch(currentRoute){
      case currentRoute.match('contract/:contractId'):
        modules.navigate.to('/home');
    }
    event?.preventDefault();
    modules.navigation.redirect('/homepage');
}