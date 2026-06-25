---
"@equinor/fusion-framework-react-app": major
---

🎉 **Introducing State Management for React Applications!**

We're excited to bring you a complete state management solution that makes sharing data between components effortless. Say goodbye to prop drilling and hello to persistent, synchronized state that survives page refreshes!

**What's new?** The powerful `useAppState` hook works just like React's `useState` but with superpowers:

🔄 **Persistent by default** - Your state survives page refreshes using browser storage
🔗 **Automatically synchronized** - Share state between any components in real-time
⚡ **Optimistically updated** - Lightning-fast UI with automatic error recovery
🛡️ **Fully type-safe** - Complete TypeScript support with type inference
🎯 **Dead simple API** - If you know `useState`, you already know `useAppState`

**Getting started is easy:**
```typescript
import { enableAppState } from '@equinor/fusion-framework-react-app/state';

export const configure = (configurator) => {
  enableAppState(configurator);
};
```

**Then use it anywhere:**
```typescript
import { useAppState } from '@equinor/fusion-framework-react-app/state';

const [count, setCount] = useAppState('counter', { defaultValue: 0 });
```

**Perfect for:**
- User preferences and UI settings
- Form data that enhances user experience
- Filters, sorting, and view states
- Any data that needs to be shared across components
- Caching expensive operations

**Important:** Uses browser storage (localStorage/IndexedDB via PouchDB) - perfect for enhancing user experience but not suitable for critical data that must be guaranteed to persist. Always have fallback strategies for essential information.

**Examples that show the magic:**

```typescript
// Simple counter that persists across refreshes
const Counter = () => {
  const [count, setCount] = useAppState('counter', { defaultValue: 0 });
  return <button onClick={() => setCount(c => (c || 0) + 1)}>Count: {count}</button>;
};

// Components automatically sync - change in one updates all others!
const Settings = () => {
  const [theme, setTheme] = useAppState('theme', { defaultValue: 'light' });
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
    Switch to {theme === 'light' ? 'dark' : 'light'} mode
  </button>;
};

const Header = () => {
  const [theme] = useAppState('theme', { defaultValue: 'light' });
  return <header className={`header-${theme}`}>My App</header>;
};
```

This feature includes comprehensive documentation with practical examples, best practices, and TypeScript patterns. Applications need to install `@equinor/fusion-framework-module-state` to unlock these capabilities.

Ready to eliminate prop drilling and embrace persistent state? Check out the updated README for complete setup instructions and advanced usage patterns!
