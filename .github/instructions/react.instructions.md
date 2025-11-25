---
description: Rules for generating React components and hooks in Fusion Framework
name: React Rules
applyTo: "**/*.{tsx,jsx}"
---

# React Rules

## TL;DR (for AI agents)

- **Components**: Function components only, no `any`, always add TSDoc for exported components and props.
- **Hooks**: Prefix with `use`, return objects/tuples, throw clear errors when required context is missing.
- **State & UX**: Always handle loading and error states explicitly; prefer early returns for clarity.
- **Imports**: Use scoped framework imports (e.g. `@equinor/fusion-framework-react-*`), never cross-package relative imports.
- **Styling**: Use `styled-components` with a `Styled` object and descriptive names.
- **Testing**: Use Vitest + React Testing Library; also follow `testing.instructions.md` for general testing rules.

## Component Patterns

### Function Components Only
- **ALWAYS** use function components (never class components)
- Use arrow functions or function declarations
- Export components as named exports

```typescript
/**
 * User profile component that displays user information and settings
 * @param user - The user object containing profile data
 * @param onUpdate - Callback function called when user updates their profile
 * @param isLoading - Whether the component is in a loading state
 */
export function UserProfile({
  user,
  onUpdate,
  isLoading
}: UserProfileProps) {
  // implementation
}
```

### Component Props
- Define props using TypeScript interfaces (prefer `interface` over `type`)
- Use `PropsWithChildren` from React when component accepts children
- Destructure props in function signature
- Provide default values using default parameters

```typescript
import type { PropsWithChildren } from 'react';

interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
  isLoading?: boolean;
}

export function UserProfile({ user, onUpdate, isLoading = false }: UserProfileProps) {
  // implementation
}
```

### TSDoc for Components
**ALL components MUST have TSDoc comments** describing:
- What the component does
- Each prop parameter
- Return value (if applicable)
- Usage examples for complex components

```typescript
/**
 * Bookmark component that displays and manages user bookmarks
 * @param groupBy - Grouping mode for bookmarks ('date' | 'category' | 'none')
 * @param onBookmarkClick - Callback when bookmark is clicked
 */
export function Bookmark({ groupBy, onBookmarkClick }: BookmarkProps) {
  // implementation
}
```

## Hooks

### Custom Hooks
- Prefix hook names with `use` (e.g., `useBookmarkGrouping`, `useAppModule`)
- Return objects or tuples, not single values when multiple values are returned
- Include TSDoc comments explaining hook purpose and return values

```typescript
/**
 * Retrieves the specified app module from the app scope
 * @template TType - The type of the app module
 * @template TKey - The key of the app module
 * @param module - The key of the app module to retrieve
 * @returns The app module instance if found, otherwise throws an error
 */
export function useAppModule<TType extends AnyModule, TKey extends string>(
  module: TKey,
): ModuleType<TType> {
  const appModule = useAppModules()[module];
  if (!appModule) {
    throw Error(`the requested module [${module}] is not included in the app scope`);
  }
  return appModule;
}
```

### Framework Hooks
- Use `useFramework` from `@equinor/fusion-framework-react` to access framework
- Use `useModule` from `@equinor/fusion-framework-react-module` to access modules
- Use `useAppModule` from `@equinor/fusion-framework-react-app` for app-scoped modules

```typescript
import { useFramework } from '@equinor/fusion-framework-react';
import { useModule } from '@equinor/fusion-framework-react-module';
import { useAppModule } from '@equinor/fusion-framework-react-app';

export function MyComponent() {
  const framework = useFramework();
  const httpModule = useModule('http');
  const appModule = useAppModule('my-module');
  // ...
}
```

### Hook Dependencies
- Always include all dependencies in dependency arrays
- Use `useMemo` and `useCallback` to prevent unnecessary re-renders
- Document why dependencies are excluded if using `biome-ignore`

```typescript
// ✅ Good: All dependencies included
useEffect(() => {
  // effect
}, [dependency1, dependency2]);

// ✅ Good: Documented exclusion
// biome-ignore lint/correctness/useExhaustiveDependencies: should dispose when new instance is provided
useEffect(() => dispose, [instance]);
```

## Provider Patterns

### Lazy Providers
- Use `lazy` from React for async provider initialization
- Providers that initialize modules MUST be lazy-loaded
- Wrap lazy providers in `Suspense` with fallback

```typescript
import { lazy } from 'react';
import { Suspense } from 'react';

export const createModuleProvider = async (configurator, modules) => {
  const Component = lazy(async () => {
    const instance = await initializeModules(configurator, modules);
    return {
      default: ({ children }: { children?: ReactNode }) => (
        <ModuleProvider value={instance}>{children}</ModuleProvider>
      ),
    };
  });
  return Component;
};

// Usage
const ModuleProvider = createModuleProvider(configurator, modules);

<Suspense fallback={<Loading />}>
  <ModuleProvider>{children}</ModuleProvider>
</Suspense>
```

### Context Providers
- Create context using `createContext` with proper typing
- Export Provider component from context file
- Use `useMemo` for provider values when appropriate

```typescript
import { createContext, useContext } from 'react';

const ModuleContext = createContext<ModulesInstance | undefined>(undefined);

export const ModuleProvider = ModuleContext.Provider;

export function useModules() {
  const context = useContext(ModuleContext);
  if (!context) {
    throw Error('useModules must be used within ModuleProvider');
  }
  return context;
}
```

## Observable Integration

### Using Observables in React
- Use `useObservableState` from `@equinor/fusion-observable/react` for RxJS observables
- Provide initial values when needed
- Use `useMemo` to memoize observable sources

```typescript
import { useObservableState } from '@equinor/fusion-observable/react';
import { EMPTY, map } from 'rxjs';
import { useMemo } from 'react';

export function BookmarkComponent() {
  const { provider } = useBookmarkContext();

  const { value: bookmarks } = useObservableState(
    useMemo(() => provider?.bookmarks$ || EMPTY, [provider]),
  );

  const { value: isLoading } = useObservableState(
    useMemo(
      () => (provider?.status$ || EMPTY).pipe(map((status) => !!status.has('fetch_bookmarks'))),
      [provider],
    ),
    { initial: true },
  );

  // ...
}
```

## State Management

### Local State
- Use `useState` for simple local state
- Use `useReducer` for complex state logic
- Prefer derived state over storing redundant state

### Loading States
- Always handle loading states explicitly
- Show loading indicators during async operations
- Handle error states appropriately

```typescript
export function DataComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data) return <NoData />;

  return <DataDisplay data={data} />;
}
```

## Styling

### Styled Components
- Use `styled-components` for component styling
- Group styled components in `Styled` object
- Use descriptive names for styled components

```typescript
import styled from 'styled-components';

const Styled = {
  Wrapper: styled.div`
    padding-right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `,
  List: styled.div`
    overflow-y: auto;
    overflow-x: hidden;
    height: calc((100vh - 85px) - 3rem);
  `,
};

export function Component() {
  return (
    <Styled.Wrapper>
      <Styled.List>
        {/* content */}
      </Styled.List>
    </Styled.Wrapper>
  );
}
```

## Error Handling

### Error Boundaries
- Use error boundaries for component tree error handling
- Provide fallback UI for errors
- Log errors appropriately

### Hook Error Handling
- Throw errors from hooks when required context is missing
- Provide clear error messages
- Use error boundaries to catch hook errors

```typescript
export function useModule<T>(key: string): T {
  const modules = useModules();
  const module = modules[key];
  if (!module) {
    throw Error(`the requested module [${key}] is not included in the app scope`);
  }
  return module;
}
```

## Performance

### Memoization
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references
- Avoid premature optimization

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(dependency);
}, [dependency]);

const stableCallback = useCallback((value: string) => {
  handleValue(value);
}, [/* dependencies */]);
```

### Component Optimization
- Use `React.memo` for components that re-render frequently
- Only optimize when performance issues are identified
- Profile before optimizing

## Import Patterns

### React Imports
- Import React types explicitly: `import type { ReactNode, PropsWithChildren } from 'react'`
- Use named imports for hooks: `import { useState, useEffect, useMemo } from 'react'`
- Import `lazy` and `Suspense` when needed

### Framework Imports
```typescript
// Framework
import { useFramework } from '@equinor/fusion-framework-react';

// Modules
import { useModule, ModuleProvider } from '@equinor/fusion-framework-react-module';

// App
import { useAppModule } from '@equinor/fusion-framework-react-app';

// Observable
import { useObservableState } from '@equinor/fusion-observable/react';
```

## Testing React Components

- Test component rendering and user interactions
- Mock framework hooks and providers
- Test error states and loading states
- Use React Testing Library patterns

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@equinor/fusion-framework-react', () => ({
  useFramework: vi.fn(),
}));

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Common Patterns

### Conditional Rendering
```typescript
// ✅ Good: Clear conditional rendering
{isLoading ? <Loading /> : <Content data={data} />}

// ✅ Good: Early returns for loading/error states
if (isLoading) return <Loading />;
if (error) return <ErrorDisplay error={error} />;
return <Content data={data} />;
```

### Lists and Keys
```typescript
{items.map((item) => (
  <ItemComponent key={item.id} item={item} />
))}
```

### Event Handlers
```typescript
// ✅ Good: Inline handlers for simple cases
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Good: useCallback for complex handlers
const handleClick = useCallback((id: string) => {
  // complex logic
}, [dependencies]);

<button onClick={() => handleClick(id)}>Click</button>
```

## Never Do

- ❌ Use class components
- ❌ Use `any` type for props
- ❌ Skip TSDoc comments for components
- ❌ Create components without proper TypeScript types
- ❌ Use relative imports for framework packages
- ❌ Forget to handle loading and error states
- ❌ Create hooks without `use` prefix
- ❌ Use `useEffect` without dependency array
- ❌ Mutate state directly (always use setState)

