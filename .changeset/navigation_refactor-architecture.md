---
"@equinor/fusion-framework-module-navigation": major
---

Complete refactor of navigation module architecture with React Router v7 upgrade, improved state management, and history implementations.

**Breaking Changes:**

1. **Upgraded to React Router v7**: `@remix-run/router` upgraded from v1.8.0 to v1.23.0 for React Router v7 compatibility
   - The `createRouter` API remains backward compatible
   - All existing router patterns continue to work
   - **Type compatibility note**: TypeScript types may not fully resolve with React Router v7, requiring type assertions (`as any`) in some cases when using `useRouter` with `RouterProvider`. This is a known limitation and will be addressed in future updates.
   
   ```typescript
   // Example: Type assertions required with React Router v7
   import { RouterProvider } from 'react-router-dom';
   import { useRouter } from '@equinor/fusion-framework-react-app/navigation';
   
   export default function Router() {
     // biome-ignore lint/suspicious/noExplicitAny: types not fully resolving with React Router v7
     const router = useRouter(routes as any);
     // biome-ignore lint/suspicious/noExplicitAny: types not fully resolving with React Router v7
     return <RouterProvider router={router as any} />;
   }
   ```

2. **Configurator exports restructured**: `NavigationConfigurator` and `INavigationConfigurator` are now exported from separate interface files
   - Public API unchanged, but internal structure changed

3. **`createHistory` path changed**: Moved from root to `lib/create-history`
   - Public API unchanged, but internal path changed

4. **Types reorganized**: Types moved from `./types` to `./lib/types`
   - Public API unchanged, but internal path changed

5. **`navigator` deprecated**: Use `history` instead
   ```typescript
   // Before
   const nav = navigation.navigator;
   
   // After
   const history = navigation.history;
   ```

**New Features:**

- Added `NavigationProvider` and `INavigationProvider` exports
- Added `enableNavigation` helper function for easier configuration
- Added navigation events (`NavigateEvent`, `NavigatedEvent`)
- Improved history implementations with state management
- Added comprehensive test coverage
- Added detailed README documentation

**Internal Improvements:**

- Restructured history implementations (BrowserHistory, HashHistory, MemoryHistory)
- Added state management with reducer pattern
- Improved type safety and organization
- Better separation of concerns

Closes https://github.com/equinor/fusion-framework/issues/3699

