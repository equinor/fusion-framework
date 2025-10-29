# Context Cookbook

This cookbook demonstrates how to work with context in your Fusion Framework application.

## What This Shows

This cookbook illustrates how to:
- Access the current context (project, task, facility, etc.)
- Query related contexts using observables
- Create custom hooks for context operations
- Display context information in your UI

## Key Concepts

The context module provides information about what entity your app is operating on. This cookbook shows:
- Using `useModuleCurrentContext()` to get the current context
- Creating a custom hook to query related contexts
- Using RxJS observables for reactive context updates

## Code Example

### Getting Current Context

```typescript
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context';

export const App = () => {
  // Get the current context (project, task, etc.)
  const { currentContext } = useModuleCurrentContext();
  
  return (
    <section>
      <h3>Current Context:</h3>
      <pre>{JSON.stringify(currentContext, null, 4)}</pre>
    </section>
  );
};
```

### Custom Hook for Related Contexts

The cookbook includes a custom hook `useRelatedContext.ts` that shows how to query related contexts:

```typescript
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';
import {
  type ContextItem,
  type ContextModule,
  useModuleCurrentContext,
} from '@equinor/fusion-framework-react-module-context';
import { useAppModule } from '@equinor/fusion-framework-react-app';
import { useObservableState } from '@equinor/fusion-observable/react';

/**
 * Hook to get related contexts
 * @param type - Optional filter by context type
 */
export const useRelatedContext = (
  type?: string[],
): ReturnType<typeof useObservableState<ContextItem[] | undefined>> => {
  const { currentContext } = useModuleCurrentContext();
  const provider = useAppModule<ContextModule>('context');
  
  return useObservableState(
    useMemo(() => {
      if (!currentContext) return EMPTY; // No context, return empty observable
      
      return provider.relatedContexts({
        item: currentContext,
        filter: { type },
      });
    }, [provider, currentContext]),
  );
};
```

### Using the Custom Hook

```typescript
import { useRelatedContext } from './useRelatedContext';

export const App = () => {
  const { currentContext } = useModuleCurrentContext();
  
  // Get all related contexts
  const { value: relatedContext } = useRelatedContext();
  
  // Or filter by specific type
  // const { value: relatedContext } = useRelatedContext(['EquinorTask']);
  
  return (
    <>
      <section>
        <h3>Current Context:</h3>
        <pre>{JSON.stringify(currentContext, null, 4)}</pre>
      </section>
      <section>
        <h3>Related Context:</h3>
        <pre>{JSON.stringify(relatedContext, null, 4)}</pre>
      </section>
    </>
  );
};
```

## Understanding the Pattern

### Current Context

The current context is the entity your app is working with. It could be:
- A project
- A task
- A facility
- Any other context-aware entity

### Related Contexts

Related contexts are entities connected to the current context:
- Tasks related to a project
- Sub-projects of a project
- Equipment in a facility

### Observable Pattern

The context module uses RxJS observables for reactive updates:
- `useObservableState()` converts observables to React state
- When context changes, components automatically re-render
- The observable pattern handles async operations cleanly

### Type Filtering

You can filter related contexts by type:

```typescript
// Get all related contexts
const { value: contexts } = useRelatedContext();

// Get only 'EquinorTask' contexts
const { value: tasks } = useRelatedContext(['EquinorTask']);
```

## When to Use Context

Use the context module when:
- Your app operates on specific entities (projects, tasks, etc.)
- You need to display information about the current entity
- You want to query related entities
- You need to track what the user is working with

The context system automatically updates when users navigate between different entities in the Fusion portal.