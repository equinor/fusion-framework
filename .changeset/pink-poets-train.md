---
"@equinor/fusion-framework-module-ag-grid": major
"@equinor/fusion-framework-cookbook-app-react-ag-grid": patch
---

# Upgrading to AG Grid 32 for React

## Summary

AG Grid 32 introduces several new features and improvements for React applications, along with some breaking changes that developers need to be aware of when upgrading.

## Key Breaking Changes

1. **Removal of deprecated APIs**
   - Several deprecated APIs have been removed, including some related to row models, column definitions, and grid options.

2. **Changes to default behavior**
   - The default for `suppressMenuHide` is now `true`.
   - `applyColumnDefOrder` now defaults to `true`.

3. **Typing changes**
   - Some TypeScript interfaces have been updated or removed, which may require code adjustments.

4. **Removal of Internet Explorer 11 support**
   - AG Grid no longer supports Internet Explorer 11.

5. **Changes to CSS classes**
   - Some CSS classes have been renamed or removed, which may affect custom styling.

6. **Adjustments to event parameters**
   - Certain events now have different parameter structures.

7. **Modifications to API methods**
   - Some API methods have been changed or removed.

When upgrading to AG Grid 32, it's important to review the [full changelog](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-32/?ref=blog.ag-grid.com) and test your application thoroughly to ensure compatibility with the new version. 
The AG Grid team provides codemods to assist with some of the migration tasks, which can help automate parts of the upgrade process.
