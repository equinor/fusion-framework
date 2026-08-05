# Performance

Prefix filtering, batching, and sync tuning tips for `@equinor/fusion-framework-module-state`.

## Optimization Tips

1. **Use prefix filtering** for large datasets:
   ```typescript
   // Good: Filter by prefix for better performance
   const userPrefs = await stateProvider.getAllItems({ prefix: 'user.' });

   // Avoid: Loading all items when you only need a subset
   const allItems = await stateProvider.getAllItems();
   const userPrefs = allItems.items.filter(item => item.key.startsWith('user.'));
   ```

2. **Batch operations** for multiple changes:
   ```typescript
   // Good: Single bulk operation
   await stateProvider.storeItems([
     { key: 'user.name', value: 'John' },
     { key: 'user.email', value: 'john@example.com' }
   ]);

   // Avoid: Multiple individual operations
   await stateProvider.storeItem({ key: 'user.name', value: 'John' });
   await stateProvider.storeItem({ key: 'user.email', value: 'john@example.com' });
   ```

3. **Unsubscribe from observables** when components unmount:
   ```typescript
   // Good: Proper cleanup
   useEffect(() => {
     const subscription = stateProvider.observeItem('data').subscribe(setData);
     return () => subscription.unsubscribe();
   }, []);

   // Avoid: Memory leaks
   stateProvider.observeItem('data').subscribe(setData); // Never unsubscribed
   ```

## Memory Management

- **PouchDB Storage**: Uses IndexedDB in browsers, which has storage limits
- **Memory Storage**: All data kept in memory - lost on page refresh
- **Custom Storage**: Depends on your implementation

## Sync Performance

- **Live sync**: Provides real-time updates but increases network usage
- **Batch sync**: Reduces network calls but may show stale data
- **Filtered sync**: Only sync relevant data to improve performance
