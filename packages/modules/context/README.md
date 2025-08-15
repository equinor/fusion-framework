## Overview

The `@equinor/fusion-framework-module-context` package is a core module of the Fusion Framework, designed to manage contextual data within Fusion-based applications and portals.
It provides a structured way to handle context information to enrich user experiences and facilitate data sharing across different components of the application.

## Configuration

```ts
import { enableContext } from '@equinor/fusion-framework-module-context';

const configure = (configurator: IModulesConfigurator<any, any>) => {
  enableContext(configurator, (builder) => {
    // configure the context module here
  });
};
```

## Features

- set and retrieve context items
- query context items based on search strings
- filter context items based on type
- validate context items against allowed types
- resolving related context items

## Usage

This module is the core of the context management system in Fusion Framework applications, but there are several packages which has additional functionality or provide a more convenient API for specific use cases.

When developing applications, the `@equinor/fusion-framework-react-app/context` package is typically used to provide a React context provider that integrates with this module.

When building portals, the `@equinor/fusion-framework-react/context` package is used to provide a context provider that integrates with this module.

