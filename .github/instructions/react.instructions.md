---
description: Rules for generating React components and hooks in Fusion Framework
name: React Rules
applyTo: "**/*.{tsx,jsx}"
---

# React Rules

## TL;DR (for AI agents)

- **Components**: Function components only, no `any`, always add TSDoc for components and props. User-facing components must include `@example`.
- **Hooks**: Prefix with `use`, return objects/tuples, and document intent, params, returns, generics, errors, and usage for user-facing hooks.
- **State & UX**: Resolve decision logic, transforms, and derived values before markup. JSX should render prepared values, and loading/error states should use early returns.
- **Styling**: Use `styled-components` with a `Styled` object and descriptive names.

## Component Patterns

### Components And Props

- Function components only, exported as named exports. No class components.
- Props as a TypeScript `interface`, destructured in the signature, defaults via default
  parameters. Use `PropsWithChildren` when the component accepts children.
- Every component needs TSDoc covering its intent, its usage context, and each prop.
  User-facing or complex components also need `@example`.

### Intent Before Markup

`fusion-lint` enforces this, and it is the rule most often missed:

- Resolve filters, maps, reduces, labels, flags, and handler composition *before* the `return`.
- JSX renders prepared values and simple presentational branching — nothing else.
- Use early returns for loading, error, empty, and access-denied states.

```typescript
/**
 * Displays a user's profile and lets them edit it.
 * @param user - Profile data to render.
 * @param onUpdate - Called with the edited user when the form is submitted.
 * @param isLoading - Renders the loading state instead of the form.
 */
export function UserProfile({ user, onUpdate, isLoading = false }: UserProfileProps) {
  if (isLoading) return <Loading />;

  const displayName = formatDisplayName(user);

  return <ProfileForm name={displayName} onSubmit={onUpdate} />;
}
```

## Hooks

### Custom Hooks
- Prefix hook names with `use` (e.g., `useBookmarkGrouping`, `useAppModule`)
- Return objects or tuples, not single values when multiple values are returned
- Include TSDoc comments explaining hook intent, parameters, return values, and thrown errors
- Add `@template` for every generic type parameter
- Add `@example` for user-facing or non-trivial hooks

```typescript
/**
 * Retrieves the specified app module from the app scope
 * @template TType - The type of the app module
 * @template TKey - The key of the app module
 * @param module - The key of the app module to retrieve
 * @returns The app module instance if found, otherwise throws an error
 * @example
 * const httpModule = useAppModule<HttpModule, 'http'>('http');
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

- `useFramework` from `@equinor/fusion-framework-react` — the framework instance
- `useModule` from `@equinor/fusion-framework-react-module` — a configured module
- `useAppModule` from `@equinor/fusion-framework-react-app` — an app-scoped module

### Hook Dependencies

Dependency arrays are exhaustive. When one deliberately is not, say why:

```typescript
// biome-ignore lint/correctness/useExhaustiveDependencies: should dispose when new instance is provided
useEffect(() => dispose, [instance]);
```

## Provider Patterns

### Lazy Providers
- Use `lazy` from React for async provider initialization
- Providers that initialize modules MUST be lazy-loaded
- Wrap lazy providers in `Suspense` with fallback

```typescript
import { lazy, Suspense } from 'react';

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
- Precede non-trivial RxJS operator chains with an intent comment that explains cancellation, deduplication, or stream-shape decisions

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
      // Treat any active bookmark fetch as a loading signal for the UI state machine
      () => (provider?.status$ || EMPTY).pipe(map((status) => !!status.has('fetch_bookmarks'))),
      [provider],
    ),
    { initial: true },
  );

  // ...
}
```

## State Management

- `useState` for simple state, `useReducer` for complex transitions, derived values over
  redundant stored state.
- Loading and error states are never implicit. Resolve them with early returns before
  rendering content.

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

- Hooks that require context throw when it is missing, with a message naming the missing
  provider or module. The `useModules` example above is the canonical shape.
- Wrap component trees in an error boundary with a fallback UI.

## Performance

- `useMemo` for expensive computations, `useCallback` for references passed to memoized children.
- Reach for `React.memo` only after profiling shows a real problem.

## Import Patterns

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

## Testing

Vitest plus React Testing Library. Mock framework hooks and providers, and cover the loading
and error branches — see `testing.instructions.md`.

