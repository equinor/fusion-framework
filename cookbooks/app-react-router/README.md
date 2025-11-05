# Router Cookbook

This cookbook demonstrates how to set up client-side routing in your Fusion Framework application.

## What This Shows

This cookbook illustrates how to:
- Use the framework's `useRouter` hook
- Define route structures
- Create navigation links
- Use React Router with Fusion Framework
- Handle nested routes

## Code Example

### Set Up Router

```typescript
import { RouterProvider } from 'react-router-dom';
import { useRouter } from '@equinor/fusion-framework-react-app/navigation';
import routes from './routes';

export default function App() {
  const router = useRouter(routes);
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
}
```

### Define Routes

```typescript
import { Link, Outlet, type RouteObject } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Root = () => {
  const currentLocation = useLocation();
  return (
    <div>
      {/* Navigation links */}
      <section style={{ display: 'inline-flex', gap: 10 }}>
        <Link to={''}>Home</Link>
        <Link to={'page1'}>Page 1</Link>
        <Link to={'page2'}>Page 2</Link>
      </section>
      
      {/* Display current location */}
      <pre>{JSON.stringify(currentLocation, null, 4)}</pre>
      
      {/* Render child routes */}
      <Outlet />
    </div>
  );
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <p>home</p>,
      },
      {
        path: 'page1/*',
        element: <p>page1</p>,
      },
      {
        path: 'page2/*',
        element: <p>page2</p>,
      },
    ],
  },
];
```

## Key Concepts

- `useRouter()` - Framework hook that returns a configured router
- `RouteObject[]` - Define your route structure
- `<Outlet />` - Renders child routes
- `<Link>` - Navigation links
- `useLocation()` - Access current location

## When to Use Routing

Use routing for:
- Multi-page applications
- Deep linking
- Navigation between sections