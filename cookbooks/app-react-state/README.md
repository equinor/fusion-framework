# Fusion Framework State Module Cookbook

A comprehensive cookbook demonstrating how to use the Fusion Framework state module with `useAppState` hook for managing application state in React apps.

## 🎯 Learning Objectives

After working through this cookbook, you will understand:

- How to configure the state module in your Fusion app
- How to use the `useAppState` hook for simple state management
- How to share state between components with different state keys
- How to manage complex object state with proper update patterns
- Best practices for organizing state in Fusion applications

## 🏗️ Setup

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- Basic knowledge of React hooks

### Running the Example

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 📚 Key Concepts

### State Module Configuration

The state module must be enabled in your app configuration:

```typescript
import { enableAppState } from '@equinor/fusion-framework-react-app/state';

export const configure: AppModuleInitiator = (appConfigurator) => {
  enableAppState(appConfigurator);
};
```

### useAppState Hook

The `useAppState` hook works similar to React's `useState` but provides persistent state across components using a unique key:

```typescript
const [value, setValue] = useAppState<T>(key, options);
```

**Parameters:**
- `key`: Unique string identifier for the state (e.g., 'user.profile', 'app.settings')
- `options`: Configuration object with optional `defaultValue`

**Returns:**
- `value`: Current state value
- `setValue`: Function to update the state

### State Keys Organization

Use hierarchical naming for better organization:
- `app.*` - Application-level settings
- `user.*` - User-specific data  
- `feature.*` - Feature-specific state

## 📖 Examples in This Cookbook

### 1. Simple State Examples (SimpleStateExamples.tsx)
- **Boolean state** - notifications enabled/disabled
- **String state** - language selection with type safety
- **Optional state** - last login time (can be undefined)

### 2. Shared State Between Components
- **Complex object state** - user profile (UserProfile type)
- **Read-only component** - UserProfileDisplay.tsx
- **Control component** - UserProfileControls.tsx

### 3. State Update Patterns
- **Direct value updates** - simple assignments
- **Functional updates** - for complex objects
- **Clearing/resetting state** - setting to undefined or defaults

## 🔍 Code Structure

```
src/
├── App.tsx                    # Main app container and navigation
├── SimpleStateExamples.tsx    # Basic state management examples
├── UserProfileDisplay.tsx     # Read-only shared state component
├── UserProfileControls.tsx    # Interactive shared state component
├── types.ts                   # Shared TypeScript types
├── config.ts                  # App configuration with state module
└── index.ts                   # App entry point
```

## 💡 Best Practices

1. **Use descriptive state keys** - Choose keys that clearly describe the data
2. **Define default values** - Always provide sensible defaults for better UX
3. **Type your state** - Use TypeScript generics for type safety
4. **Functional updates** - Use functional updates for complex state changes
5. **Component separation** - Separate read and write concerns when appropriate

## 🔗 Related Documentation

- [Fusion Framework State Module](../../../packages/modules/state/)
- [React App State Hook](../../../packages/react/app/src/state/)
- [Fusion Framework React App](../../../packages/react/app/)
