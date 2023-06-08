---
'@equinor/fusion-framework-react-app': minor
---

**Add tooling for navigation in React App package**

- add hook for using the navigation module
- add hook for creating a react router

```ts
const routes = [
  {
    path: '/',
    element: <p>👍🏻</p>,
  }
];

const Router = () => {
    const router = useRouter(routes);
    return <RouterProvider router={router} fallbackElement={<p>😥</p>} />;
}

const App = () => <Router />;
```