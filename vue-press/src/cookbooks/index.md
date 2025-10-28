---
title: Cookbooks
---

# Cookbooks

Welcome to the Fusion Framework cookbooks! These example applications demonstrate how to use the framework and its modules in real-world scenarios.

## What are Cookbooks?

Cookbooks are **complete, working examples** that show you how to implement specific features or patterns with the Fusion Framework. They serve multiple purposes:

- **Learning Resources** - Understand how to use framework features through working examples
- **Reference Implementations** - See best practices for common use cases and patterns
- **Starting Templates** - Use them as a foundation for your own applications
- **Integration Tests** - Validate that framework components work together correctly

::: tip Keep it simple
Cookbooks follow the [KISS principle](https://en.wikipedia.org/wiki/KISS_principle) - they contain only the necessary code to demonstrate a specific scenario with clear, helpful comments.
:::

## Available Cookbooks

### React Applications

Our React cookbooks demonstrate how to build applications using the Fusion Framework with React:

- **[Basic React App](react-app-basic.md)** - Foundation for React applications
- **[MSAL Authentication](react-app-msal.md)** - Microsoft Authentication Library (MSAL v4) integration with Azure AD
- **[AG Grid](react-app-ag-grid.md)** - Data tables and grids integration
- **[App Loader](react-app-apploader.md)** - Application loading patterns and strategies
- **[Assets](react-app-assets.md)** - Static asset management and loading
- **[Bookmarks](react-app-bookmark.md)** - Bookmark functionality with persistence
- **[Advanced Bookmarks](react-app-bookmark-advanced.md)** - Multi-page bookmark features with routing
- **[Charts](react-app-charts.md)** - Data visualization and chart components
- **[Context](react-app-context.md)** - Shared context usage patterns
- **[Custom Error Handling](react-app-context-custom-error.md)** - Error boundaries and custom error contexts
- **[Environment Variables](react-app-environment-variables.md)** - Configuration management with environment variables
- **[Feature Flags](react-app-feature-flag.md)** - Feature toggle implementation
- **[Custom Modules](react-app-module.md)** - Creating and integrating custom modules
- **[People Service](react-app-people.md)** - People search and person component integration
- **[Router](react-app-router.md)** - Client-side routing and navigation
- **[Settings](react-app-settings.md)** - Application settings management

### Other Examples

- **[Vanilla JavaScript](app-vanilla.md)** - Framework usage without React
- **[Portal](app-portal.md)** - Portal framework demonstration

## Getting Started

To run any cookbook:

```bash
# Navigate to the cookbook directory
cd cookbooks/app-react-msal

# Install dependencies
pnpm install

# Start the development server
pn high dev
```

Most cookbooks run on `http://localhost:3000` by default. Check the terminal output for the exact URL.

## Using Cookbooks in Your Projects

### As Learning Examples

Each cookbook focuses on a specific feature or pattern. Browse the code to understand how the framework is used:

1. Check the main `App.tsx` component
2. Review the `config.ts` for framework configuration
3. Examine the `package.json` for dependencies
4. Read the cookbook-specific README for detailed explanations

### As Starting Templates

To start a new project from a cookbook:

```bash
# Copy an existing cookbook as your template
cp -r cookbooks/app-react-my-feature cookbooks/my-new-app

# Update package.json with your app name
# Update configuration files as needed
```

### Finding the Right Cookbook

- **New to Fusion Framework?** Start with the basic React app cookbook
- **Need authentication?** Check the MSAL cookbook
- **Building a data table?** Look at the AG Grid cookbook
- **Adding routing?** See the Router cookbook

## Cookbook Structure

A typical cookbook follows this structure:

```
cookbooks/your-cookbook/
├── src/
│   ├── index.ts          # Application entry point
│   ├── App.tsx           # Main React component
│   ├── config.ts         # Framework configuration
│   └── ...               # Feature-specific files
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── README.md             # Cookbook documentation
└── app.config.ts         # App manifest (optional)
```

## Contributing Cookbooks

Have an example that would help others? Check out our [Cookbook Contribution Guide](../contributing/cookbooks.md) for:

- Best practices for creating cookbooks
- Code quality standards
- Documentation requirements
- How to submit new cookbooks

## Need Help?

- **Questions?** Check existing issues or create a new discussion
- **Bugs?** Open an issue with detailed reproduction steps
- **Confused about a pattern?** Review the related module documentation

---

Happy cooking! 🍳
