---
name: AG Grid - Smoke test
description: Verify the AG Grid cookbook launches and displays a data grid with rows and columns.
---

## story

As a user, I want the AG Grid cookbook to load successfully with a data table,
so that I can confirm the AG Grid component integration is working correctly.

## acceptance criteria

- [ ] When I open the application, then I see the heading "Fusion Framework AG Grid Cookbook".
- [ ] When I open the application, then I see two tabs: "Basic Example" and "Charts Example".
- [ ] When I open the Basic Example tab, then I see an AG Grid data table.
- [ ] When the Basic Example grid loads, then I see data rows with columns for "make", "model", and "price".
- [ ] When I view the grid data, then I can see at least 3 initial rows of vehicle data (Toyota, Ford, Porsche).
- [ ] When I click the "Add Row" button, then a new row is added to the grid without rendering errors.
