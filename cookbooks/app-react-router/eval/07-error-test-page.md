---
name: React Router - Error test page
---

## story

As a developer, I want the error-test route to prove that the router error boundary is wired correctly,
so that I can trust loader failures to surface a recoverable UI.

## acceptance criteria

- [ ] When I navigate to the Error Test page, then the URL ends with "/pages/error-test".
- [ ] When the Error Test route loads, then I see the error boundary heading containing "Error Encountered".
- [ ] When the Error Test route loads, then the visible error message contains "This is a test error to demonstrate error boundaries in the router".
- [ ] When the Error Test route loads, then I see "Retry" and "Go Home" buttons.
- [ ] When I click "Go Home", then I return to the home route and see the heading "Router Cookbook" again.