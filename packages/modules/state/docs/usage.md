# Usage & Error Handling

CRUD operations, subscription cleanup, error handling, and test utilities for
`@equinor/fusion-framework-module-state`.

## Basic Usage

```typescript
// Store a single entry in the state
stateProvider.storeItem({ 
    key: 'user-preference', 
    value: { theme: 'dark', language: 'en' } 
  }).then(result => {
    console.log(result); 
    // Output: { status: 'success', key: 'user-preference' }
  });

// Store multiple entries in the state
stateProvider.storeItems([
  { key: 'user-preference', value: { theme: 'dark', language: 'en' } },
  { key: 'app-settings', value: { notifications: true, autoSave: false } }
]).then(result => {
  console.log(result);
  // Output: [
  //   { status: 'success', key: 'user-preference' },
  //   { status: 'success', key: 'app-settings' }
  // ]
});

// Retrieve a single item from the state
stateProvider.getItem('user-preference').then(item => {
  console.log(item);
  // Output: { key: 'user-preference', value: { theme: 'dark', language: 'en' } }
});

// Retrieve all items from the state
stateProvider.getAllItems().then(response => {
  console.log(response.items);
  // Output: [
  //   { key: 'user-preference', value: { theme: 'dark', language: 'en' } },
  //   { key: 'app-settings', value: { notifications: true, autoSave: false } }
  // ]
  console.log(`Total items: ${response.total_count}`);
});

// Retrieve items with pagination
stateProvider.getAllItems({ limit: 10, skip: 0 }).then(response => {
  console.log(`Retrieved ${response.items.length} items`);
});

// Retrieve items with prefix filtering
stateProvider.getAllItems({ prefix: 'feature.' }).then(response => {
  console.log(`Retrieved ${response.items.length} feature items`);
});

// Retrieve items with both prefix filtering and pagination
stateProvider.getAllItems({ prefix: 'config.', limit: 5, skip: 0 }).then(response => {
  console.log(`Retrieved ${response.items.length} config items`);
});

// Prefix filtering is useful for organizing data by categories
// Example: Store feature flags with 'feature.' prefix
stateProvider.storeItems([
  { key: 'feature.darkMode', value: true },
  { key: 'feature.notifications', value: false },
  { key: 'config.theme', value: 'dark' }
]).then(() => {
  // Retrieve only feature flags
  return stateProvider.getAllItems({ prefix: 'feature.' });
}).then(response => {
  console.log('Feature flags:', response.items);
  // Output: [{ key: 'feature.darkMode', value: true }, { key: 'feature.notifications', value: false }]
});

// Remove a single item from the state (using object with key)
stateProvider.removeItem({ key: 'user-preference' }).then(result => {
  console.log(result);
  // Output: { status: 'success', key: 'user-preference' }
});

// Remove a single item from the state (using string key directly)
stateProvider.removeItem('user-preference').then(result => {
  console.log(result);
  // Output: { status: 'success', key: 'user-preference' }
});

// Remove multiple items from the state
stateProvider.removeItems([
  { key: 'user-preference' },
  { key: 'app-settings' }
]).then(result => {
  console.log(result);
  // Output: [
  //   { status: 'success', key: 'user-preference' },
  //   { status: 'success', key: 'app-settings' }
  // ]
});

// Clear all items from the state
stateProvider.clear().then(results => {
  console.log(results);
  // Output: Array of StorageResult objects for each deleted item
  // e.g., [{ status: 'success', key: 'user-preference' }, { status: 'success', key: 'app-settings' }]
});

// Observe changes to a specific item in the state
stateProvider.observeItem('user-preference').subscribe(item => {
  console.log(item?.value);
});

// Observe changes to all items in the state
stateProvider.observeItems().subscribe(items => {
  console.log(items);
});
```

> [!WARNING]
> `observeItem` and `observeItems` are hot observables and should be unsubscribed when no longer needed to prevent memory leaks.

### Managing Observable Subscriptions

```typescript
import { Subscription } from 'rxjs';

// Store subscription reference for cleanup
const itemSubscription: Subscription = stateProvider.observeItem('user-preference').subscribe(item => {
  console.log('Item changed:', item?.value);
});

// Clean up when done
itemSubscription.unsubscribe();

// For multiple subscriptions, use a subscription container
const subscriptions = new Subscription();

subscriptions.add(
  stateProvider.observeItem('setting1').subscribe(item => console.log('Setting 1:', item))
);

subscriptions.add(
  stateProvider.observeItem('setting2').subscribe(item => console.log('Setting 2:', item))
);

// Unsubscribe from all at once
subscriptions.unsubscribe();

// In React components, use useEffect for cleanup
useEffect(() => {
  const subscription = stateProvider.observeItem('user-preference').subscribe(item => {
    setUserPreference(item?.value);
  });

  return () => subscription.unsubscribe(); // Cleanup on unmount
}, []);
```

## Error Handling

The state module provides comprehensive error handling through `StorageResult` objects. Here's how to handle potential errors:

```typescript
// Handle storage errors when storing items
stateProvider.storeItem({ key: 'test', value: 'data' }).then(result => {
  if (result.status === 'error') {
    console.error(`Failed to store item ${result.key}:`, result.error?.message);
  } else {
    console.log(`Successfully stored item: ${result.key}`);
  }
});

// Handle bulk operation errors
stateProvider.storeItems([
  { key: 'item1', value: 'data1' },
  { key: 'item2', value: 'data2' }
]).then(results => {
  const failures = results.filter(r => r.status === 'error');
  const successes = results.filter(r => r.status === 'success');
  
  console.log(`${successes.length} items stored successfully`);
  if (failures.length > 0) {
    console.error(`${failures.length} items failed to store:`, failures);
  }
});

// Handle retrieval errors
stateProvider.getItem('non-existent-key').then(item => {
  if (item === null) {
    console.log('Item not found');
  } else {
    console.log('Item retrieved:', item);
  }
}).catch(error => {
  console.error('Error retrieving item:', error);
});
```

## Testing

The state module includes comprehensive test utilities and examples:

```typescript
import { StateProvider } from '@equinor/fusion-framework-module-state';
import { createMockStorage } from '@equinor/fusion-framework-module-state/__tests__/storage.mock';

// Create a mock storage for testing
const mockStorage = createMockStorage();
const stateProvider = new StateProvider({ storage: mockStorage });

// Test your state operations
describe('State Management', () => {
  it('should store and retrieve items', async () => {
    await stateProvider.storeItem({ key: 'test', value: 'data' });
    const item = await stateProvider.getItem('test');
    expect(item?.value).toBe('data');
  });
});
```
