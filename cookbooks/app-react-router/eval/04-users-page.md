---
name: React Router - Users page
---

## story

As a user, I want the users page to keep pagination state in the URL,
so that I can browse the directory predictably and return to the same list state.

## acceptance criteria

- [ ] When I navigate to the Users page, then the URL ends with "/users" and I see the heading "Users".
- [ ] When the Users page loads, then I see the "Items per page" input together with "Previous" and "Next" pagination buttons.
- [ ] When the Users page loads with default settings, then I see a summary showing the current page and total pages.
- [ ] When I change the items-per-page value to `3`, then the URL contains `limit=3` and the list stays on page 1.
- [ ] When I click "Next", then the URL contains `page=2` and the summary updates to page 2.
- [ ] When non-default pagination is active, then chips for the active `Limit` and `Page` values are visible and each listed user still exposes a "View Profile" button.