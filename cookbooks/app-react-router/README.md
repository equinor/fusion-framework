# Router Cookbook

This cookbook demonstrates how to set up client-side routing in your Fusion Framework application using the `@equinor/fusion-framework-react-router` package. The router integrates seamlessly with Fusion Framework's module system and provides a file-based routing approach that simplifies route management.

## Overview

The Fusion Framework Router is built on top of React Router v7 and provides:

- **File-based routing** - Define routes by referencing component files
- **Fusion Framework integration** - Automatic access to Fusion modules in loaders and components
- **Type-safe routing** - Full TypeScript support with route handles
- **Lazy loading** - Automatic code splitting for route components
- **Data loading** - Built-in support for client-side data fetching
- **Error boundaries** - Automatic error handling with custom error components

## How It Works

The router integrates with Fusion Framework's navigation module to provide a unified routing experience. When you use the `Router` component, it:

1. **Connects to Fusion Navigation** - Uses the navigation module's history and basename
2. **Injects Fusion Context** - Makes Fusion modules available in all loaders and actions
3. **Lazy Loads Components** - Automatically code-splits route components
4. **Handles Data Loading** - Executes `clientLoader` functions before rendering

This means your routes have automatic access to HTTP clients, authentication, and other Fusion modules without manual setup.

## Getting Started

### Basic Setup

Start by creating your router component:

```typescript
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import routes from './routes';
import Loader from './components/Loader';

export default function AppRouter() {
  return (
    <Router 
      routes={routes} 
      loader={<Loader />} 
      context={{ foo: 'bar', baz: 123 }} 
    />
  );
}
```

**Key Points:**
- `routes` - Your route configuration (defined using helper functions)
- `loader` - Optional loading indicator shown during navigation
- `context` - Custom data accessible in all loaders via `fusion.context`

### Defining Routes

Routes are defined using helper functions that reference component files. This approach provides several benefits:

- **Code splitting** - Each route is automatically lazy-loaded
- **Type safety** - Route handles provide TypeScript types
- **Organization** - Routes mirror your file structure

```typescript
// src/pages/index.ts
import { index, route, prefix } from "@equinor/fusion-framework-react-router/routes";

export const pages = [
  // Index route - renders at the root path '/'
  index(import.meta.resolve('./HomePage.tsx')),
  
  // Prefix groups related routes under a common path
  prefix('products', [
    // Index route for /products
    index(import.meta.resolve('./ProductsPage.tsx')),
    // Dynamic route for /products/:id
    route(':id', import.meta.resolve('./ProductPage.tsx')),
  ]),
  
  prefix('users', [
    index(import.meta.resolve('./UsersPage.tsx')),
    route(':id', import.meta.resolve('./UserPage.tsx')),
  ]),
  
  prefix('pages', [
    route('people', import.meta.resolve('./PeoplePage.tsx')),
    route('error-test', import.meta.resolve('./ErrorTestPage.tsx')),
  ]),
];
```

### Creating a Layout

Layouts wrap multiple routes with shared UI (navigation, headers, etc.):

```typescript
// src/routes.ts
import { layout } from '@equinor/fusion-framework-react-router/routes';
import { pages } from './pages';

// Wrap all pages with the Root layout
export const routes = layout('/src/Root.tsx', pages);
export default routes;
```

The layout component receives child routes via `<Outlet />`:

```typescript
// src/Root.tsx
import { Outlet, useNavigation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Loader from './components/Loader';

export default function Root() {
  const navigation = useNavigation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header>
        <h1>My App</h1>
        <Navigation />
      </header>
      <main>
        {/* Show loader during navigation */}
        {navigation.state === 'loading' && <Loader />}
        {/* Render child routes */}
        {navigation.state === 'idle' && <Outlet />}
      </main>
    </div>
  );
}
```

**Understanding `useNavigation()`:**
- `navigation.state` - Current navigation state: `'idle'`, `'loading'`, or `'submitting'`
- Use this to show loading indicators during route transitions
- The router automatically manages this state during navigation

## Route Helpers Explained

### `index(path)`
Creates an index route - the default route for a path segment.

```typescript
index(import.meta.resolve('./HomePage.tsx'))
// Creates route at '/'
```

**When to use:** For the default view of a section (e.g., `/products` showing a product list).

### `route(path, component)`
Creates a route with a specific path. Supports dynamic segments with `:paramName`.

```typescript
route(':id', import.meta.resolve('./ProductPage.tsx'))
// Creates route at '/products/:id' (when nested under prefix('products'))
```

**Dynamic segments:**
- `:id` - Required parameter (e.g., `/products/123`)
- `:id?` - Optional parameter (e.g., `/products` or `/products/123`)

### `prefix(path, children)`
Groups routes under a common path prefix. Useful for organizing related routes.

```typescript
prefix('products', [
  index(import.meta.resolve('./ProductsPage.tsx')),      // /products
  route(':id', import.meta.resolve('./ProductPage.tsx')), // /products/:id
])
```

**Benefits:**
- Keeps related routes together
- Reduces path repetition
- Makes route structure more maintainable

### `layout(component, children)`
Wraps routes with a layout component. The layout renders once and persists across child route changes.

```typescript
layout('/src/Root.tsx', pages)
// All pages are wrapped with Root layout
```

**Use cases:**
- Shared navigation
- Common headers/footers
- Persistent sidebars
- Global loading states

## Page Components

### Basic Page

The simplest page is just a React component:

```typescript
// src/pages/HomePage.tsx
export default function HomePage() {
  return <h1>Welcome to the Home Page</h1>;
}
```

### Route Handles

Route handles document your routes and provide TypeScript types. They're especially useful for:

- **API documentation** - Auto-generate route documentation
- **Type safety** - TypeScript knows what params/search params exist
- **Developer experience** - Better IDE autocomplete

```typescript
// src/pages/ProductPage.tsx
import type { RouterHandle } from '@equinor/fusion-framework-react-router';

export const handle = {
  route: {
    description: 'Product detail page',
    params: {
      id: 'Product identifier (numeric)',
    },
    search: {
      view: 'View mode: "details", "specs", or "reviews"',
      tab: 'Active tab for reviews section: "all", "positive", or "negative"',
    },
  },
} satisfies RouterHandle;
```

**Handle structure:**
- `route` - Required property containing the route schema
  - `description` - Human-readable description of the route
  - `params` - Object describing route parameters (from URL path)
  - `search` - Object describing search parameters (from query string)
- Additional properties can be added to the handle for custom metadata

### Client Loaders

Client loaders fetch data before rendering a route. They run on the client side and have access to Fusion Framework modules.

```typescript
import type { LoaderFunctionArgs, RouteComponentProps } from '@equinor/fusion-framework-react-router';

export const clientLoader = async ({ params, request, fusion }: LoaderFunctionArgs) => {
  // Access route parameters
  const productId = parseInt(params.id, 10);
  
  // Access search parameters
  const url = new URL(request.url);
  const view = url.searchParams.get('view') || 'details';
  
  // Access Fusion Framework modules
  // const httpClient = fusion.modules.http.createHttpClient('products');
  // const product = await httpClient.json(`/products/${productId}`);
  
  // For this example, using mock data
  const product = mockProducts[productId];
  
  // Throw Response for error handling
  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }
  
  // Return data that will be available in component
  return {
    product,
    view,
  };
};
```

**Loader Function Arguments:**
- `params` - Route parameters (e.g., `{ id: '123' }`)
- `request` - The incoming request (access URL, headers, etc.)
- `fusion` - Fusion Framework context with modules and custom context

**Accessing Loader Data:**

```typescript
export default function ProductPage(props: RouteComponentProps) {
  const { loaderData, fusion } = props;
  const { product, view } = loaderData;
  
  // loaderData contains the return value from clientLoader
  // fusion contains modules and custom context
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

**Important Notes:**
- Loaders run before the component renders
- If a loader throws, the error boundary catches it
- Loader data is automatically passed to the component
- The `fusion` object is also available in the component props

### Using Fusion Modules in Loaders

One of the key benefits of Fusion Framework Router is automatic access to modules:

```typescript
export const clientLoader = async ({ fusion }: LoaderFunctionArgs) => {
  // Access HTTP module
  const httpClient = fusion.modules.http.createHttpClient('api');
  const data = await httpClient.json('/endpoint');
  
  // Access navigation module
  // fusion.modules.navigation.navigate({ pathname: '/other-route' });
  
  // Access custom context
  const { queryClient } = fusion.context;
  // Use queryClient for caching, etc.
  
  return { data };
};
```

### Route Parameters and Search Parameters

Access route parameters and search parameters in your components:

```typescript
import { useParams, useSearchParams } from 'react-router-dom';

export default function ProductPage() {
  // Route parameters (from URL path: /products/:id)
  const params = useParams();
  const productId = params.id; // '123'
  
  // Search parameters (from query string: ?view=details&tab=all)
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view'); // 'details'
  
  // Update search parameters
  const updateView = (newView: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', newView);
    setSearchParams(newParams); // Triggers navigation with new search params
  };
  
  return (
    <div>
      <p>Product ID: {productId}</p>
      <p>View: {view}</p>
      <button onClick={() => updateView('specs')}>View Specs</button>
    </div>
  );
}
```

**Best Practices:**
- Use route parameters for required data (e.g., resource IDs)
- Use search parameters for optional filters, pagination, view modes
- Updating search params doesn't reload the page, just updates the URL
- Search params are preserved when navigating between routes

### Pagination Pattern

Here's a complete example of implementing pagination with search parameters:

```typescript
// src/pages/UsersPage.tsx
import type { RouterHandle } from '@equinor/fusion-framework-react-router';

export const handle = {
  route: {
    description: 'Users list page with pagination',
    params: {},
    search: {
      page: 'Page number for pagination (default: 1)',
      limit: 'Number of users per page (default: 5)',
    },
  },
} satisfies RouterHandle;

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '5', 10);
  
  // Fetch paginated data
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = allUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allUsers.length / limit);
  
  return {
    users: paginatedUsers,
    page,
    limit,
    total: allUsers.length,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export default function UsersPage(props: RouteComponentProps) {
  const { loaderData } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, page, limit, totalPages, hasNext, hasPrev } = loaderData;
  
  const goToPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams); // Triggers loader to re-run with new page
  };
  
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <div>
        <button onClick={() => goToPage(page - 1)} disabled={!hasPrev}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => goToPage(page + 1)} disabled={!hasNext}>
          Next
        </button>
      </div>
    </div>
  );
}
```

**Key Points:**
- Search params trigger loader re-execution
- Loader receives updated search params via `request.url`
- Component automatically receives new loader data
- URL stays in sync with application state

## Router Context

Router context allows you to pass custom data to all routes. This is useful for:

- API clients
- Query clients (React Query, etc.)
- Shared services
- Configuration

### Setting Up Context

```typescript
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        routes={routes}
        context={{
          queryClient,
          apiClient: new MyApiClient(),
        }}
      />
    </QueryClientProvider>
  );
}
```

### Extending TypeScript Types

To get type safety for your context:

```typescript
// src/Router.tsx or a types file
declare module '@equinor/fusion-framework-react-router' {
  interface RouterContext {
    queryClient: QueryClient;
    apiClient: MyApiClient;
  }
}
```

### Using Context in Loaders

```typescript
export const clientLoader = async ({ fusion }: LoaderFunctionArgs) => {
  const { queryClient, apiClient } = fusion.context;
  
  // Use query client for caching
  return queryClient.fetchQuery({
    queryKey: ['data'],
    queryFn: () => apiClient.fetchData(),
  });
};
```

### Using Context in Components

```typescript
export default function MyPage(props: RouteComponentProps) {
  const { fusion } = props;
  const { queryClient, apiClient } = fusion.context;
  
  // Access context in component
  // ...
}
```

## Navigation

The router uses React Router's navigation primitives, which work seamlessly with Fusion Framework's navigation module.

### Using Links

```typescript
import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/products">Products</Link>
      <Link to="/products/123">Product 123</Link>
      <Link to="/users?page=2&limit=10">Users Page 2</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

export function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Navigate to a route
    navigate('/products/123');
    
    // Navigate with search params
    navigate('/users?page=2');
    
    // Navigate with state
    navigate('/products', { state: { from: 'home' } });
    
    // Navigate back
    navigate(-1);
    
    // Navigate forward
    navigate(1);
  };
  
  return <button onClick={handleClick}>Navigate</button>;
}
```

### Active Route Detection

```typescript
import { useLocation, useMatch } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();
  const isProductsActive = useMatch('/products/*');
  
  return (
    <nav>
      <Link 
        to="/products" 
        style={{ 
          fontWeight: isProductsActive ? 'bold' : 'normal' 
        }}
      >
        Products
      </Link>
    </nav>
  );
}
```

## Error Handling

The router provides built-in error handling through error boundaries.

### Error Boundaries

When a loader throws an error, the router looks for an `ErrorElement` export:

```typescript
// src/pages/ErrorTestPage.tsx
import type { ErrorElementProps } from '@equinor/fusion-framework-react-router';

export function ErrorElement({ error }: ErrorElementProps) {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>⚠️ Error Encountered</h1>
      <p>{error.message}</p>
      <button onClick={() => navigate('/')}>Go Home</button>
      <button onClick={() => navigate(0)}>Retry</button>
    </div>
  );
}

export const clientLoader = async () => {
  throw new Error('This is a test error');
};

export default function ErrorTestPage() {
  return <div>This won't render if loader throws</div>;
}
```

**Error Handling Flow:**
1. Loader throws error or component throws during render
2. Router looks for `ErrorElement` export in the same file
3. If found, renders `ErrorElement` instead of component
4. If not found, bubbles up to parent route's error boundary

### Throwing Errors in Loaders

```typescript
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const product = await fetchProduct(params.id);
  
  if (!product) {
    // Throw Response for HTTP-like errors
    throw new Response('Product not found', { status: 404 });
  }
  
  if (product.disabled) {
    // Throw Error for application errors
    throw new Error('Product is disabled');
  }
  
  return { product };
};
```

## Advanced Patterns

### Nested Layouts

You can nest layouts for complex UI structures:

```typescript
// src/routes.ts
export const routes = layout('/src/Root.tsx', [
  index(import.meta.resolve('./HomePage.tsx')),
  prefix('admin', [
    layout('/src/AdminLayout.tsx', [
      index(import.meta.resolve('./AdminDashboard.tsx')),
      route('users', import.meta.resolve('./AdminUsers.tsx')),
    ]),
  ]),
]);
```

### Route Actions

Handle form submissions and mutations:

```typescript
import type { ActionFunctionArgs } from '@equinor/fusion-framework-react-router';
import { Form } from 'react-router-dom';

export const action = async ({ request, fusion }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const productId = formData.get('productId');
  
  // Process form submission
  // ...
  
  // Navigate after action
  fusion.modules.navigation.navigate({ 
    pathname: `/products/${productId}` 
  });
  
  return { success: true };
};

export default function MyPage() {
  return (
    <Form method="post">
      <input name="productId" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### Loading States

Show different loading states based on navigation state:

```typescript
import { useNavigation } from 'react-router-dom';

export default function Layout() {
  const navigation = useNavigation();
  
  return (
    <div>
      {navigation.state === 'loading' && <GlobalLoader />}
      {navigation.state === 'submitting' && <FormLoader />}
      <Outlet />
    </div>
  );
}
```

## Integration with Fusion Framework

The router automatically integrates with Fusion Framework:

### Navigation Module

The router uses the navigation module's history and basename:

```typescript
// This happens automatically - no configuration needed
// The router uses:
// - fusion.modules.navigation.history
// - fusion.modules.navigation.basename
```

### Module Access

All Fusion modules are available in loaders and components:

```typescript
export const clientLoader = async ({ fusion }: LoaderFunctionArgs) => {
  // HTTP module
  const httpClient = fusion.modules.http.createHttpClient('api');
  
  // Auth module (if configured)
  // const user = fusion.modules.auth.getUser();
  
  // Event module (if configured)
  // fusion.modules.event.emit('route-loaded', { route: 'products' });
  
  return { data: await httpClient.json('/endpoint') };
};
```

## Best Practices

### 1. Organize Routes by Feature

```typescript
// Good: Group related routes
prefix('products', [
  index(import.meta.resolve('./ProductsPage.tsx')),
  route(':id', import.meta.resolve('./ProductPage.tsx')),
  route(':id/edit', import.meta.resolve('./EditProductPage.tsx')),
])
```

### 2. Use Handles for Documentation

Always define handles for routes with parameters:

```typescript
import type { RouterHandle } from '@equinor/fusion-framework-react-router';

export const handle = {
  route: {
    description: 'Clear description of what this route does',
    params: {
      id: 'Description of parameter',
    },
    search: {
      filter: 'Description of search parameter',
    },
  },
} satisfies RouterHandle;
```

### 3. Handle Loading States

Always show loading indicators during navigation:

```typescript
const navigation = useNavigation();
{navigation.state === 'loading' && <Loader />}
```

### 4. Use Search Params for Optional State

Use search parameters for filters, pagination, and view modes:

```typescript
// Good: Search params for filters
/users?page=2&limit=10&filter=active

// Avoid: Route params for optional data
/users/page/2/limit/10/filter/active
```

### 5. Type Your Loader Data

```typescript
type ProductPageLoaderData = {
  product: Product;
  view: string;
};

export default function ProductPage(
  props: RouteComponentProps<ProductPageLoaderData>
) {
  const { loaderData } = props;
  // TypeScript knows the shape of loaderData
}
```

## Common Patterns

### Pattern: List and Detail Pages

```typescript
prefix('products', [
  index(import.meta.resolve('./ProductsPage.tsx')),      // List
  route(':id', import.meta.resolve('./ProductPage.tsx')), // Detail
])
```

### Pattern: Pagination

```typescript
// Use search params
/users?page=2&limit=10

// In loader
const page = parseInt(url.searchParams.get('page') || '1', 10);
```

### Pattern: Filters

```typescript
// Use search params
/products?category=electronics&sort=price&order=asc

// In loader
const category = url.searchParams.get('category');
const sort = url.searchParams.get('sort') || 'name';
```

### Pattern: View Modes

```typescript
// Use search params
/product/123?view=details&tab=reviews

// In component
const view = searchParams.get('view') || 'details';
```

## Troubleshooting

### Routes Not Matching

- Check that route paths match exactly (case-sensitive)
- Verify prefix nesting is correct
- Ensure dynamic segments use `:paramName` syntax

### Loader Not Running

- Verify `clientLoader` is exported from the component file
- Check that the route is actually being navigated to
- Ensure no errors are being thrown silently

### Context Not Available

- Verify context is passed to `Router` component
- Check TypeScript module declaration for `RouterContext`
- Ensure you're accessing via `fusion.context`

### Navigation Not Working

- Verify navigation module is configured in Fusion Framework
- Check that routes are properly defined
- Ensure you're using `useNavigate` from `react-router-dom`

## Example Structure

This cookbook demonstrates a complete routing setup:

```
src/
├── Router.tsx              # Router component with context
├── routes.ts               # Route definitions using layout
├── Root.tsx                # Main layout component
├── components/
│   ├── Navigation.tsx      # Navigation sidebar
│   ├── Loader.tsx          # Loading indicator
│   └── RouterDebugToolbar.tsx  # Debug information
└── pages/
    ├── index.ts            # Page route definitions
    ├── HomePage.tsx        # Home page
    ├── ProductsPage.tsx    # Product list with filters
    ├── ProductPage.tsx     # Product detail with tabs
    ├── UsersPage.tsx       # User list with pagination
    ├── UserPage.tsx        # User detail
    ├── PeoplePage.tsx      # People API integration
    └── ErrorTestPage.tsx   # Error handling demo
```

## Key Takeaways

1. **File-based routing** simplifies route management and enables automatic code splitting
2. **Fusion integration** provides automatic access to modules in loaders and components
3. **Route handles** document routes and provide type safety
4. **Client loaders** handle data fetching before rendering
5. **Search parameters** are ideal for optional state like filters and pagination
6. **Error boundaries** provide built-in error handling
7. **Router context** enables sharing services across routes

## Next Steps

- Explore the actual implementation in this cookbook's source files
- Check the [package README](../../packages/react/router/README.md) for API details
- Review React Router v7 documentation for advanced features
- Experiment with different route patterns and layouts
