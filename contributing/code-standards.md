# Code Standards

Standards and best practices for writing maintainable, readable, and consistent code in the Fusion Framework monorepo.

## Why Readability and Documentation Matter

In a large-scale monorepo like Fusion Framework, code is read far more often than it's written. Investing in readability and documentation pays dividends throughout the codebase's lifetime:

### Readability Enables Collaboration
- **Faster onboarding**: New developers (and AI assistants) can understand code quickly
- **Easier maintenance**: Bugs are found and fixed faster by both human and AI contributors
- **Safer changes**: Clear code reduces the risk of introducing bugs for all contributors
- **Knowledge sharing**: Team members and AI tools can work effectively across the codebase

### Documentation Preserves Knowledge
- **API stability**: Clear contracts prevent breaking changes and guide AI suggestions
- **Future maintenance**: Future developers and AI assistants understand intent and constraints
- **Code reviews**: Both human reviewers and AI tools can focus on logic rather than guessing intent
- **User experience**: Well-documented APIs are easier to consume and maintain

### Long-term Code Health
Readable, well-documented code ages gracefully. It can be maintained, extended, and refactored with confidence by both human developers and AI assistants, reducing technical debt and development friction over time.

## Core Principles

### Readability First
Write "stupid" code that's easy to understand and maintain. Prioritize clarity over cleverness. If code needs a comment to explain what it does, rewrite it to be self-explanatory.

### Documentation is Code
All functions, components, and classes MUST have comprehensive TSDoc comments. Documentation is as important as the code itself - it's part of the API contract.

### Package Documentation
Every package MUST have a comprehensive README.md file explaining its purpose, usage, and API. A package without documentation might as well not exist.

## Quick Reference

| Standard | Requirement | Enforcement |
|----------|-------------|-------------|
| **TSDoc** | All public functions, components, classes | Code review + CI |
| **README.md** | All packages | Code review |
| **Code Quality** | Readable, maintainable code | Code review |
| **Inline Comments** | Complex logic and business rules | Code review |
| **Formatting** | Biome | Pre-commit hooks |
| **TypeScript** | Strict mode | CI builds |

**Key Rules:**
- All functions, components, and classes MUST have proper TSDoc comments
- All packages MUST have comprehensive README.md files
- Write readable code over clever optimizations
- Add inline comments for complex logic
- Prioritize maintainability and clarity

## TSDoc Documentation

### Mandatory TSDoc Requirements

**ALL functions, components, and classes MUST have TSDoc comments.** This is non-negotiable.

#### Functions and Methods
```typescript
/**
 * Validates user permissions for a specific resource
 * @param userId - The user's unique identifier
 * @param resource - The resource being accessed (e.g., 'project', 'document')
 * @param action - The action being performed ('read', 'write', 'delete')
 * @returns True if user has permission, false otherwise
 * @throws {AuthorizationError} When user authentication fails
 */
function hasPermission(userId: string, resource: string, action: string): boolean {
  // implementation
}
```

#### React Components
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

#### Classes
```typescript
/**
 * Service for managing user authentication and sessions
 *
 * Handles login, logout, token refresh, and session persistence.
 * Integrates with MSAL authentication provider.
 */
export class AuthService {
  /**
   * Attempts to log in a user with the provided credentials
   * @param credentials - User login credentials
   * @returns Promise resolving to authentication result
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // implementation
  }
}
```

### TSDoc Best Practices

#### ✅ Do's
- **Describe what and why**, not just how
- **Include parameter descriptions** with types and constraints
- **Document return values** and their meaning
- **Note side effects** and important behavior
- **Mention thrown errors** with specific error types
- **Use examples** for complex APIs
- **Keep descriptions concise** but comprehensive

#### ❌ Don'ts
- Don't repeat the function name in the description
- Don't just restate parameter types
- Don't write novels - be concise but complete
- Don't skip edge cases or error conditions

## Package README Requirements

Every package MUST have a comprehensive README.md file with:

### Required Sections
- **Description**: What the package does and why it exists
- **Installation**: How to install and set up the package
- **Usage**: Basic usage examples with code snippets
- **API Reference**: Complete API documentation
- **Configuration**: Configuration options and environment variables
- **Contributing**: How to contribute to the package
- **License**: License information

### README Quality Standards
- **Keep it updated** when APIs change
- **Include working code examples** that can be copy-pasted
- **Explain the problem** the package solves
- **Document breaking changes** and migration guides
- **Use consistent formatting** across all package READMEs

## Code Quality Standards

### Readability Principles

#### Write Readable Code
```typescript
// ✅ Good: Clear, readable, immutable code
function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// ❌ Bad: Mutable variables make code harder to reason about
function calculateTotal(items: CartItem[]): number {
  let total = 0;

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    total += itemTotal; // Mutating total makes this harder to follow
  }

  return total;
}
```

#### Use Descriptive Names
```typescript
// ✅ Good: Self-documenting names
function validateUserPermissions(userId: string, resourceId: string): boolean {
  const user = getUserById(userId);
  const permissions = getUserPermissions(user);
  const resource = getResourceById(resourceId);

  return permissions.canAccess(resource);
}

// ❌ Bad: Cryptic abbreviations
function validateUP(uid: string, rid: string): boolean {
  const u = getU(uid);
  const p = getUP(u);
  const r = getR(rid);

  return p.canA(r);
}
```

## Separation of Concerns

### Why Separation Matters
Separation of concerns ensures each part of your code has a single, well-defined responsibility. This makes code more testable, maintainable, and reusable.

### Single Responsibility Principle
Each function, class, and module should have one reason to change. Ask yourself: "What is the one thing this code does?"

#### ✅ Good: Separated concerns
```typescript
// Business logic layer
function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Data persistence layer
async function saveOrder(order: Order): Promise<OrderId> {
  return await database.orders.insert(order);
}

// Presentation/API layer
function formatOrderResponse(order: Order): OrderResponse {
  return {
    id: order.id,
    total: order.total,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))
  };
}

// Usage: Clear separation between layers
app.post('/orders', async (req, res) => {
  const orderData = req.body;
  const total = calculateOrderTotal(orderData.items);
  const order = { ...orderData, total };
  const orderId = await saveOrder(order);
  const response = formatOrderResponse({ ...order, id: orderId });
  res.json(response);
});
```

#### ❌ Bad: Mixed concerns
```typescript
// ❌ Bad: One function doing everything
async function createOrder(orderData: any): Promise<any> {
  // Validation logic mixed with business logic
  if (!orderData.items?.length) throw new Error('Invalid order');

  // Business logic mixed with data persistence
  const total = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Data persistence mixed with response formatting
  const orderId = await database.insert({
    ...orderData,
    total,
    createdAt: new Date()
  });

  // Response formatting mixed with everything else
  return {
    id: orderId,
    total,
    items: orderData.items
  };
}
```

### Layer Separation in Fusion Framework

#### Framework Architecture Layers
- **Presentation Layer**: Components, hooks, UI logic
- **Business Logic Layer**: Domain rules, calculations, validations
- **Data Access Layer**: API calls, database operations, caching
- **Infrastructure Layer**: Configuration, utilities, cross-cutting concerns

#### Module Organization
```typescript
// ✅ Good: Clear module separation
fusion-framework/
├── modules/
│   ├── auth/           # Authentication concerns
│   │   ├── src/
│   │   │   ├── auth-service.ts      # Business logic
│   │   │   ├── auth-api.ts          # Data access
│   │   │   ├── auth-hooks.ts        # Presentation logic
│   │   │   └── auth-types.ts        # Domain types
│   │   └── README.md
│   └── notifications/  # Notification concerns
│       ├── src/
│       │   ├── notification-service.ts
│       │   ├── notification-api.ts
│       │   └── notification-types.ts
│       └── README.md
```

#### Cross-cutting Concerns
Separate infrastructure concerns from business logic:

```typescript
// ✅ Good: Logging as a separate concern
class OrderService {
  constructor(private logger: Logger, private repository: OrderRepository) {}

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    this.logger.info('Creating order', { userId: orderData.userId });

    try {
      const order = await this.repository.create(orderData);
      this.logger.info('Order created successfully', { orderId: order.id });
      return order;
    } catch (error) {
      this.logger.error('Failed to create order', { error, orderData });
      throw error;
    }
  }
}

// ❌ Bad: Logging mixed with business logic
async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  console.log(`Creating order for user ${orderData.userId}`); // Mixed concern

  const order = await database.orders.insert(orderData);
  console.log(`Order ${order.id} created successfully`); // Mixed concern

  return order;
}
```

### Practical Application

#### Component Separation
```typescript
// ✅ Good: UI, business logic, and data fetching separated
function UserProfile({ userId }: UserProfileProps) {
  const { data: user, loading, error } = useUser(userId); // Data fetching
  const { updateUser } = useUserActions(); // Business logic

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ProfileCard user={user} onUpdate={updateUser} /> // UI rendering
  );
}
```

#### File Organization by Concern
```
src/
├── components/        # UI concerns
├── hooks/            # State and lifecycle concerns
├── services/         # Business logic concerns
├── api/              # Data access concerns
├── types/            # Type definitions
├── utils/            # Utility concerns
└── constants/        # Configuration concerns
```

### Benefits of Good Separation

- **Testability**: Each concern can be tested in isolation
- **Maintainability**: Changes to one concern don't affect others
- **Reusability**: Separated concerns can be reused independently
- **Debugging**: Issues are easier to isolate and fix
- **Team Collaboration**: Different team members can work on different concerns simultaneously

#### Keep Functions Small and Focused
```typescript
// ✅ Good: Single responsibility
function processOrder(order: Order): ProcessedOrder {
  validateOrder(order);
  calculateTaxes(order);
  applyDiscounts(order);
  return finalizeOrder(order);
}

// ❌ Bad: Does too many things
function processOrder(order: Order): ProcessedOrder {
  // validation, tax calculation, discounts, finalization all mixed together
  if (!order.items?.length) throw new Error('Invalid order');
  // ... 50 more lines of mixed concerns
}
```

### Inline Comments for Maintainability

#### When to Add Comments
```typescript
// ✅ Good: Explain complex business logic
function calculateShippingCost(order: Order): number {
  let cost = BASE_SHIPPING_COST;

  // Free shipping for orders over $100, but only for non-bulky items
  // Bulky items always incur shipping costs regardless of order total
  if (order.total >= 100 && !hasBulkyItems(order)) {
    return 0;
  }

  // Additional cost for bulky items (over 10lbs or large dimensions)
  if (hasBulkyItems(order)) {
    cost += BULKY_ITEM_SURCHARGE;
  }

  return cost;
}

// ✅ Good: Explain non-obvious algorithmic choices
function findOptimalRoute(routes: Route[]): Route {
  // Using Dijkstra's algorithm here because we need the shortest path
  // considering both distance and traffic conditions
  return dijkstraShortestPath(routes, (route) =>
    route.distance * TRAFFIC_MULTIPLIER + route.trafficDelay
  );
}
```

#### What NOT to Comment
```typescript
// ❌ Bad: Comments that just restate the code
const total = price * quantity; // multiply price by quantity

// ❌ Bad: Comments for obvious operations
if (user.age >= 18) { // check if user is adult
  // ...
}

// ❌ Bad: Outdated comments that lie
const total = calculateTotal(items); // this will be refactored later (it wasn't)
```

## Error Handling Standards

### Consistent Error Patterns
```typescript
// ✅ Good: Specific error types with context
function validateUser(user: unknown): User {
  if (!isValidUser(user)) {
    throw new ValidationError('user', user, 'Invalid user object structure');
  }
  return user as User;
}

// ✅ Good: Async error handling with proper typing
async function loadUserData(userId: string): Promise<UserData> {
  try {
    const response = await api.getUser(userId);
    return processUserData(response.data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new UserNotFoundError(userId);
    }
    throw new DataLoadError(`Failed to load user ${userId}`, error);
  }
}
```

### Error Type Hierarchy
Define specific error classes for different failure scenarios:

```typescript
export class ValidationError extends Error {
  constructor(field: string, value: unknown, message?: string) {
    super(message || `Invalid value for ${field}: ${value}`);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
```

## Development Workflow

### Code Review Checklist

- [ ] All functions, components, and classes have proper TSDoc comments
- [ ] Package has comprehensive README.md documentation
- [ ] Code is readable and maintainable ("stupid" code preferred)
- [ ] Complex logic has explanatory inline comments
- [ ] Functions are small and focused on single responsibilities
- [ ] Error handling is consistent and uses proper error types
- [ ] No clever optimizations that sacrifice readability
- [ ] Code follows established patterns and conventions

### Before Committing

1. **Check code**: `pnpm -w check` (formatting + linting)
2. **Run tests**: `pnpm test`
3. **Type check**: `pnpm build` (validates all packages)
4. **Self-review**: Ensure code meets standards above

## Tooling & Configuration

### Code Formatting
- **Tool**: Biome (`biome.json`)
- **Format**: `pnpm -w format`
- **Check**: `pnpm -w check`
- **Rules**: 100 char width, single quotes, semicolons required

### TypeScript
- **Configuration**: `tsconfig.json`, `tsconfig.base.json`
- **Mode**: Strict TypeScript with ESNext features
- **Build**: `pnpm build`

### Testing
- **Framework**: Vitest
- **Command**: `pnpm test`
- **Coverage**: Minimum 80% target

### Commit Standards
- **Format**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- **Validation**: Pre-commit hooks
- **Tooling**: Commitlint configuration

## Related Documentation

- [TSDoc Best Practices](https://tsdoc.org/)
- [Conventional Commits](contributing/conventional-commits.md)
- [Development Setup](contributing/development.md)
- [Code Review Guidelines](contributing/reviewing.md)
