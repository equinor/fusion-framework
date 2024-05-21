---
"@equinor/fusion-query": patch
---

## @equinor/fusion-query

### Improved Action Suffix Resolution

We have improved the way action suffixes are resolved in the observable package. This change includes the following updates:

- **Enhanced `actionBaseType` function**: Now supports extracting the base action type from both action objects and action type strings.
- **New `isActionWithSuffix` function**: A utility function to check if an action has a specific suffix.
- **Updated `isRequestAction`, `isSuccessAction`, `isFailureAction`, and `isCompleteAction` functions**: These functions now utilize `isActionWithSuffix` for better type safety and readability.

### Example Usage

#### Extracting Base Action Type

```typescript
const actionBaseTypeName = actionBaseType('update_my_stuff::request'); // 'update_my_stuff'
```

#### Checking Action Suffix

```typescript
if (isRequestAction(action)) {
    // Handle request action
}

if (isSuccessAction(action)) {
    // Handle success action
}

if (isFailureAction(action)) {
    // Handle failure action
}

if (isCompleteAction(action)) {
    // Handle complete action (either success or failure)
}

// Example
import { createReducer, isSuccessAction } from '@equinor/fusion-observable';

type Actions = |
  { type: 'foo::request', type: 'foo::success'} |
  { type: 'fooBar::request', type: 'fooBar::success'}

const reducer = createReducer<any, Actions>(null, (builder) => {
  builder.addMatcher(isSuccessAction, (state, action) => {
    // IntelliSense will type hint only `::success` actions
    console.log(action.type) // 'foo::success' || 'fooBar::success'
  });
});
```