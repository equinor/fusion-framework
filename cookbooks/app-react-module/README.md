# Custom Module Cookbook

This cookbook demonstrates how to create and integrate a custom module into your Fusion Framework application.

## What This Shows

This cookbook illustrates the complete process of building a custom module:
- Creating a module with a configurator
- Defining a provider that exposes module functionality
- Registering the module with the framework
- Using the module in your React components

## Module Architecture

A custom module consists of three key parts:

1. **Configurator** - Allows configuration during module setup
2. **Provider** - Exposes the module's functionality
3. **Module Definition** - Registers everything with the framework

## Code Example

### 1. Create the Configurator

The configurator defines what can be configured:

```typescript
import { BaseConfigBuilder, type ConfigBuilderCallback } from '@equinor/fusion-framework-module';

export type DemoModuleConfig = { 
  foo: string; 
  bar?: number 
};

export class DemoModuleConfigurator extends BaseConfigBuilder<DemoModuleConfig> {
  // Method to set the 'foo' config value
  public setFoo(cb: ConfigBuilderCallback<string>) {
    this._set('foo', cb);
  }

  // Method to set the 'bar' config value
  public setBar(cb: ConfigBuilderCallback<number>) {
    this._set('bar', cb);
  }

  // Process the config before module initialization
  protected async _processConfig(config: Partial<DemoModuleConfig>) {
    if (!config.bar) {
      // Halt operation for demo purpose (simulates async work)
      await new Promise((resolve) => setTimeout(resolve, 10000));
      config.bar = 5;
    }
    return config as DemoModuleConfig;
  }
}
```

### 2. Create the Provider

The provider exposes the module's public API:

```typescript
import type { DemoModuleConfig } from './configurator';

export class DemoProvider {
  #config: DemoModuleConfig;
  
  constructor(config: DemoModuleConfig) {
    this.#config = config;
  }

  // Public getters expose configuration values
  get foo(): string {
    return this.#config.foo;
  }
  
  get bar(): number | undefined {
    return this.#config.bar;
  }
}
```

### 3. Define the Module

The module definition brings everything together:

```typescript
import type { Module } from '@equinor/fusion-framework-module';
import { DemoModuleConfigurator } from './configurator';
import DemoProvider from './provider';

export type DemoModule = Module<'demo', DemoProvider, DemoModuleConfigurator>;

export const demoModule: DemoModule = {
  name: 'demo',
  
  // Configure phase: create and return the configurator
  configure() {
    const config = new DemoModuleConfigurator();
    return config;
  },
  
  // Initialize phase: create the provider with config
  initialize: async (args) => {
    const config = await args.config.createConfigAsync(args, {
      foo: 'elg', // Default value
    });
    const module = new DemoProvider(config);
    return module;
  },
};

// Make TypeScript aware of the new module
declare module '@equinor/fusion-framework-module' {
  interface Modules {
    demo: DemoModule;
  }
}
```

### 4. Register the Module in Your App

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { type DemoModule, demoModule } from './modules/demo';

export const configure: AppModuleInitiator<[DemoModule]> = (configurator) => {
  // Add your custom module to the framework
  configurator.addConfig({
    module: demoModule,
    configure(configBuilder) {
      // Set 'foo' to async load a value
      configBuilder.setFoo(async () => 'https://foo.bar');
      
      // Set 'bar' synchronously
      configBuilder.setBar(() => 69);
    },
  });
};
```

### 5. Use the Module in Components

```typescript
import { useModule } from '@equinor/fusion-framework-react-module';

export const App = () => {
  // Get the module provider
  const demoProvider = useModule('demo');
  
  return (
    <>
      <h1>🚀 Hello custom module</h1>
      <p>foo: {demoProvider.foo}</p>
      <p>bar: {demoProvider.bar}</p>
    </>
  );
};
```

## Understanding the Pattern

### Module Lifecycle

1. **Configuration Phase**: The module's configurator is created
2. **Setup Phase**: Configuration values are set via callbacks
3. **Processing Phase**: `_processConfig` runs (can be async)
4. **Initialization Phase**: Provider is created with final config
5. **Usage Phase**: React components access the module via hooks

### Why Use Modules?

Modules encapsulate related functionality and provide:
- **Type Safety**: Full TypeScript support
- **Dependency Injection**: Clean way to provide services
- **Async Configuration**: Can handle async setup operations
- **Framework Integration**: Automatically integrated with React

### Configurator Pattern

The configurator allows flexible configuration:

```typescript
configBuilder.setFoo(async () => {
  // You can return values synchronously or asynchronously
  return 'some-value';
});
```

### Private Fields

The provider uses private fields (`#config`) to encapsulate the configuration:

```typescript
export class DemoProvider {
  #config: DemoModuleConfig; // Private field
  
  // Public API exposes what you want users to access
  get foo() { return this.#config.foo; }
}
```

## When to Use Custom Modules

Create custom modules when you need to:
- Encapsulate complex functionality
- Share configuration across the app
- Provide services to multiple components
- Handle async initialization
- Build reusable framework features

This pattern is especially useful for features like HTTP clients, state management, or integration with external services.