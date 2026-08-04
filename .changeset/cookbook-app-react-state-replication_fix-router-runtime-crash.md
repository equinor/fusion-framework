---
"@equinor/fusion-framework-cookbook-app-react-state-replication": patch
---

Fix a runtime crash on route render caused by mixing `react-router-dom`'s `RouterProvider` with the router instance returned by `useRouter` from `@equinor/fusion-framework-react-app/navigation`. The router and route components now come from `@equinor/fusion-framework-react-router`, matching the react-router runtime used internally by the framework's navigation module.
