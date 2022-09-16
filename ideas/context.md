```ts

type TagInfo {
  title: string;
  description?: string;
  color?: string;
  iconSvg?: string // svg
}

/** meta-data about context type */
type ContextRenderTemplate {
  id: string;
  title: string;
  subtitle? string;
  /** allow markdown */
  description?: string;
  tags?: string[] | TagInfo[];
  iconSvg?: string: // svg
  private? boolean;
}

type ContextItem<TType> {
  id: string;
  externalId: string | null;
  type: string;
  value: TType;
  parent?: ParentContext;
}

```

Framework => module.context
App => module.context

```ts
const appConfigurator


```


```ts 

import { useModule } from '@equinor/fusion-framework-react';
const contextModule = useModule('context');

// '@equinor/fusion-framework-react-app/context';
import { useModule } from '@equinor/fusion-framework-react-app';
export useContextModule = () => {
  return useModule('context');
}

export useContextHttpClient = (): IHttpClient => {
  return useContextModule().httpClient;
}

import { useContextModule, useContextHttpClient } from '@equinor/fusion-framework-react-app/context';

import { useFrameworkModule } from '@equinor/fusion-framework-react-app/framework';


/** gets client defined in the context module - can be their own */
import useContextClient from '@equinor/fusion-framework-react/context';
const contextClient = useContextClient();

/** will always return a fusion context client which consumes fusion services */
import useHttpService from '@equinor/fusion-framework-react-services';
const fusionContextClient = useHttpService('context', 'v2');

/** alterntive */
const framework = useFrameWork('context');
const fusionContextClient = framework.context.contextClient;


import {resolveContextFromExternalId} from '@equinor/fusion-framework-react-app/';

```


```ts

interface IContextModuleConfigFramework {
  /** 
   * Callback function for creating the context manager
   * 
   * - as a Framework this will create a new ContextManager with a ContextClient
   * - as a consumer (app/portal) this will return the instance from the Framework
   */
  createContextManager(modules: Modules)?: IContextManager;
}

interface IContextClient {
  httpClient: IHttpClient;  
  queryContext: (args: QueryArgs) => Context;
  getContext: () => Context;
  resolveContextFromExternalId: (id: string) => Context;
}

interface IContextModuleConfig {
  
  createContextClient(modules: Modules)?: IContextClient;

  /** 
   * Callback for setting current context when the module is initialized 
   * 
   * The portal should handle errors thrown from this function, future named errors
   * 
   * if null is returned the portal should clear selected context
   * 
   */
  resolveInitialContext?: (
    client: IContextClient, 
    args: { context: {id: string, private?: boolean }, history: {items: {id: string, private?: boolean}[]} }
  ) => ContextItem | null;

  /** if flag is set, do not resolve context */
  disableContext?: boolean; 

  persistAppStateOnContextChanged?: boolean;
  onContextChanged?: (args: {
    context: {cur: ContextItem, prev: ContextItem}
    modules: Modules
  })

  /** 
   * Callback for what the context provider should return on a search 
   * 
   * @exeample 
   * portal.search => config.searchContexts(app.modules.context.contextClient, query);
   * */
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

type IContextConfigurator = {
  onQuery: (client: IHttpClient /** configured client for app */,  query: args) => IContextQueryResult;
  onGetContext: (client: IHttpClient /** configured client for app */,  query: args) => IContextQueryResult;
  onContextChange
}

const configurate = (config, fusion) => {

  config.context.getContextSelector = async (context: Context,) => {
    const myContext = fusion.http.createClient('my_context_client');
    return {...context, myContext};
  } 

  config.context.searchContextSelector = async (context: Context): Context[] => {
    const myContext = fusion.http.createClient('my_context_client');
    return [...context, myContext];
  }

  config.context.additionalContext = (): Context[] => {
    const client = fusion.http.createClient('my_context_client');
    return client.featch('/somewthing');
  }

  /** override the function that the ContextClient.query **/
  config.context.onQuery = (client: IHttpClient /** configured client for app */,  query: args): IContextQueryResult => {
    // const fusionContext = await fusion.context.query('project_master', {query.q}),;
    const myContext = await client.fetch('my_api', {});
    return {
      context: myContext,
      replace: true
    };
  }

  config.context.resolveInitialContext(client: ContextClient, current: Context, previous: Context[]) => {
    if(current.type !== 'project_master'){
      const result = await client.resolveContextRelation(current.context.id, 'PimsDomain');
      const resolvedContext = pickContext(result);
       // do some logic to pick right context

      return resolvedContext;
    }
  }
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