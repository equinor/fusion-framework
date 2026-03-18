---
name: React Router - People API page
---

## story

As a user, I want the People API page to search the Fusion people service,
so that I can find a known person from a short identifier.

## acceptance criteria

- [ ] When I navigate to the People API page, then the URL ends with "/pages/people" and I see the heading "People Search".
- [ ] When the People API page loads, then I see a search input and a "Search" button.
- [ ] When I submit the search term `oroc`, then the URL ends with `/pages/people?search=oroc`.
- [ ] When the `oroc` search completes, then I see a results summary for `oroc` instead of the initial empty state.
- [ ] When the `oroc` search completes, then the visible result list contains "Odin Thomas Rochmann".
- [ ] When the `oroc` search completes, then the matching result is shown in the page result list without rendering the route error state.