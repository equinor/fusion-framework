import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SetStateAction,
} from 'react';

import { BehaviorSubject, from } from 'rxjs';
import { map, skip } from 'rxjs/operators';

import type { AllowedValue, StateModule } from '@equinor/fusion-framework-module-state';

import useAppModule from '../useAppModule';

/**
 * Configuration options for the `useAppState` hook.
 */
interface UseAppStateOptions<T extends AllowedValue> {
  /**
   * Default value to return when the state item doesn't exist or is undefined.
   * This value will be returned immediately on first render if no stored value exists.
   */
  defaultValue?: T;
}

/**
 * A React hook for managing persistent application state through the Fusion Framework.
 *
 * This hook provides a simple way to store and retrieve values that persist across
 * app sessions and are shared between different parts of your application. It works
 * similarly to `useState` but with automatic persistence and cross-component synchronization.
 *
 * **Key Features:**
 * - Automatic persistence across app sessions
 * - Real-time synchronization between components
 * - Optimistic updates for responsive UX
 * - Deep equality checking to prevent unnecessary re-renders
 * - TypeScript support with type safety
 * - Default value support
 *
 * **Important Notes:**
 * - Setting a value to `undefined` will completely remove it from storage
 * - Values must be serializable (JSON-compatible)
 * - Use unique keys to avoid conflicts between different state items
 * - **The key parameter must remain constant across re-renders** - changing the key after the hook
 *   is initialized will be ignored and a warning will be logged in development mode
 *
 * @template T The type of value to store. Must be serializable (string, number, boolean, object, array, etc.)
 * @param key Unique identifier for this state item. Use descriptive names like 'user.preferences' or 'dashboard.filters'. **Must remain constant across re-renders.**
 * @param options Configuration options including default value
 * @returns A tuple containing [currentValue, setValue] similar to useState
 *
 * @example
 * **Basic Usage:**
 * ```tsx
 * function UserProfile() {
 *   // Simple string state with default value
 *   const [userName, setUserName] = useAppState('user.name', {
 *     defaultValue: 'Anonymous'
 *   });
 *
 *   return (
 *     <input
 *       value={userName || ''}
 *       onChange={(e) => setUserName(e.target.value)}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * **Object State:**
 * ```tsx
 * interface UserSettings {
 *   theme: 'light' | 'dark';
 *   language: string;
 *   notifications: boolean;
 * }
 *
 * function SettingsPanel() {
 *   const [settings, setSettings] = useAppState<UserSettings>('user.settings', {
 *     defaultValue: { theme: 'light', language: 'en', notifications: true }
 *   });
 *
 *   const toggleTheme = () => {
 *     setSettings(prev => ({
 *       ...prev!,
 *       theme: prev!.theme === 'light' ? 'dark' : 'light'
 *     }));
 *   };
 *
 *   return <button onClick={toggleTheme}>Theme: {settings?.theme}</button>;
 * }
 * ```
 *
 * @example
 * **Array State:**
 * ```tsx
 * function TaskList() {
 *   const [tasks, setTasks] = useAppState<string[]>('tasks', { defaultValue: [] });
 *
 *   const addTask = (text: string) => {
 *     setTasks(prev => [...(prev || []), text]);
 *   };
 *
 *   const removeTask = (index: number) => {
 *     setTasks(prev => prev?.filter((_, i) => i !== index));
 *   };
 *
 *   return (
 *     <ul>
 *       {tasks?.map((task, index) => (
 *         <li key={index} onClick={() => removeTask(index)}>
 *           {task}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example
 * **Clearing State:**
 * ```tsx
 * function DataManager() {
 *   const [data, setData] = useAppState<unknown[]>('cache.data');
 *
 *   const clearCache = () => {
 *     // Setting to undefined removes the item from storage completely
 *     setData(undefined);
 *   };
 *
 *   return <button onClick={clearCache}>Clear Cache</button>;
 * }
 * ```
 *
 * @example
 * **Cross-Component Synchronization:**
 * ```tsx
 * // Component A
 * function ComponentA() {
 *   const [counter, setCounter] = useAppState('shared.counter', { defaultValue: 0 });
 *   return <button onClick={() => setCounter(c => (c || 0) + 1)}>Count: {counter}</button>;
 * }
 *
 * // Component B (automatically stays in sync)
 * function ComponentB() {
 *   const [counter] = useAppState('shared.counter', { defaultValue: 0 });
 *   return <div>Current count: {counter}</div>;
 * }
 * ```
 *
 * @example
 * **Key Stability - DO and DON'T:**
 * ```tsx
 * function MyComponent({ userId }: { userId: string }) {
 *   // ❌ DON'T: Key changes with prop, will cause warnings and use initial key
 *   const [userPrefs] = useAppState(`user.${userId}.preferences`);
 *
 *   // ✅ DO: Use a constant key
 *   const [globalSettings] = useAppState('app.global.settings');
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @since 6.3.0
 */
export const useAppState = <T extends AllowedValue = AllowedValue>(
  key: string,
  options?: UseAppStateOptions<T>,
): [T | undefined, (action: SetStateAction<T | undefined>) => void] => {
  // Restrict development-only key validation to avoid production overhead.
  if (process.env.NODE_ENV === 'development') {
    // Warn early when callers provide a key that cannot identify persisted state.
    if (!key || typeof key !== 'string') {
      console.warn('useAppState: key must be a non-empty string');
    }
  }

  // Capture the initial key value and ensure it never changes
  const initialKey = useRef(key);

  // Warn about key changes only in development because the hook intentionally keeps its initial key.
  if (process.env.NODE_ENV === 'development') {
    // Surface an unstable key while preserving the original storage identity.
    if (initialKey.current !== key) {
      console.warn(
        `useAppState: key changed from "${initialKey.current}" to "${key}". The key should remain constant across re-renders. Using initial key: "${initialKey.current}"`,
      );
    }
  }

  // Access the state module from the Fusion Framework's dependency injection system
  const stateProvider = useAppModule<StateModule>('state');

  // BehaviorSubject bridges async state provider with React's sync rendering.
  // Provides immediate access via value$.value and replay semantics for new subscribers.
  // Initialize with defaultValue for consistent SSR/client hydration.
  const [value$] = useState(() => {
    return new BehaviorSubject<T | undefined>(options?.defaultValue);
  });

  // useLayoutEffect runs synchronously after DOM mutations but before paint,
  // preventing visual inconsistencies during hydration and ensuring state sync before updates.
  useLayoutEffect(() => {
    const subscription = from(
      stateProvider.observeItem<T>(initialKey.current, { initialValue: value$.value }),
    ).subscribe({
      next: (item) => {
        // Convert state provider's null to undefined for React conventions
        value$.next(item === null ? undefined : item.value);
      },
      error: (err) => {
        // Log errors for debugging but don't crash the component
        console.error(`State observation error for key "${initialKey.current}":`, err);
      },
      complete: () => {
        // Complete the local stream when the source completes
        value$.complete();
      },
    });

    // Critical: Always cleanup subscriptions to prevent memory leaks
    return () => {
      subscription.unsubscribe();
    };
  }, [stateProvider, value$]);

  // Helper function to get the current value, falling back to the default if necessary
  const getValue = useCallback(
    (rawValue: T | undefined) => (rawValue === undefined ? options?.defaultValue : rawValue),
    [options?.defaultValue],
  );

  // useSyncExternalStore integrates with React 18's concurrent features,
  // ensuring consistent state during concurrent rendering and preventing tearing.
  const value = useSyncExternalStore(
    (callback) => {
      const subscription = value$
        // Transform state emissions into the snapshot updates expected by React.
        .pipe(
          // skip the initial value, since we don't want to emit anything before the app state provider has initialized
          skip(1),
          // Apply default value logic consistently with snapshot function
          map((value) => (value === undefined ? options?.defaultValue : value)),
        )
        .subscribe(callback);

      return () => {
        subscription.unsubscribe();
      };
    },

    // Snapshot function: returns current value synchronously for React rendering
    () => getValue(value$.value),

    // Server snapshot: ensures consistent hydration between server and client
    () => options?.defaultValue,
  );

  // Implements optimistic updates: update local state immediately, then persist.
  // If persistence fails, the state provider will emit the old value, reverting the update.
  const setValue = useCallback(
    (action: SetStateAction<T | undefined>) => {
      // Handle both direct values and updater functions (like React's useState).
      // Apply the same defaulting as the snapshot so updaters never see a bare `undefined`
      // when a `defaultValue` was provided.
      const value = typeof action === 'function' ? action(getValue(value$.value)) : action;

      // Remove undefined values from storage while updating subscribers immediately.
      if (value === undefined) {
        // undefined means "delete from storage" - update local state first for immediate UI feedback
        value$.next(undefined);
        stateProvider.removeItem(initialKey.current).catch((error) => {
          console.error(`Failed to remove item "${initialKey.current}":`, error);
        });
      } else {
        // Optimistic update: local state first, then persist to storage
        value$.next(value);
        stateProvider
          .storeItem({
            key: initialKey.current,
            value,
          })
          .catch((error) => {
            console.error(`Failed to store item "${initialKey.current}":`, error);
          });
      }
    },
    [stateProvider, value$, getValue],
  );

  return [value, setValue];
};

export default useAppState;
