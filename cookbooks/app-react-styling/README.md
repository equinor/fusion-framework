# Styling Cookbook

This cookbook demonstrates how to use `@equinor/fusion-react-styles` in React applications with Fusion Framework. This version is compatible with React 19 and has Material-UI dependency removed.

## What This Shows

This cookbook illustrates how to:
- Set up `ThemeProvider` to provide theme context
- Use `makeStyles` and `createStyles` for component styling
- Access theme values using different patterns
- Create dynamic styles with props
- Use CSS classes instead of inline styles
- Test automatic stylesheet cleanup on component unmount

## Key Concepts

The styling system uses CSS-in-JS with classes for better performance. Styles are generated at runtime and injected as CSS classes. The theme object provides access to colors, spacing, elevation, and other design tokens through various access patterns.

## Code Example

### 1. Set Up ThemeProvider

Wrap your application with `ThemeProvider` to provide theme context:

```typescript
import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppContent />
    </ThemeProvider>
  );
};
```

### 2. Basic Styling with makeStyles

Create styles using `makeStyles` and `createStyles`:

```typescript
import { makeStyles, createStyles } from '@equinor/fusion-react-styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      background: theme.colors.ui.background__light.getVariable('color'),
      padding: theme.spacing.comfortable.medium.getVariable('padding'),
      ...theme.elevation.raised.attributes,
      margin: `${theme.spacing.comfortable.medium.getVariable('padding')} 0`,
    },
  }),
  { name: 'Card' },
);

export const Card = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles({});
  return <div className={classes.card}>{children}</div>;
};
```

### 3. Access Theme Values

The theme provides multiple ways to access values:

```typescript
const useStyles = makeStyles((theme) =>
  createStyles({
    example: {
      // Access CSS variables for colors
      color: theme.colors.text.static_icons__default.getVariable('color'),
      
      // Access direct CSS color values
      background: theme.colors.ui.background__warning.css,
      
      // Access spacing CSS variables
      padding: theme.spacing.comfortable.medium.getVariable('padding'),
      
      // Spread elevation attributes (shadow, etc.)
      ...theme.elevation.raised.attributes,
    },
  }),
);
```

### 4. Dynamic Styles with Props

Pass props to `makeStyles` for dynamic styling:

```typescript
type ButtonType = 'primary' | 'secondary';

const useStyles = makeStyles(
  (theme) =>
    createStyles({
      button: (props: { type: ButtonType }) => {
        const backgroundColor =
          props.type === 'primary'
            ? theme.colors.interactive.primary__resting.getVariable('color')
            : theme.colors.interactive.secondary__resting.getVariable('color');
        return {
          background: backgroundColor,
          color: theme.colors.text.static_icons__primary_white.getVariable('color'),
          border: 'none',
          borderRadius: '4px',
          padding: '0.75rem 1.5rem',
          cursor: 'pointer',
        };
      },
    }),
  { name: 'Button' },
);

export const Button = ({ type = 'secondary', onClick, children }: ButtonProps) => {
  const classes = useStyles({ type });
  return (
    <button type="button" onClick={onClick} className={classes.button}>
      {children}
    </button>
  );
};
```

## Understanding the Pattern

### Theme Value Access Patterns

The theme object provides several ways to access design tokens:

- **`getVariable('color')`**: Returns CSS variable reference for colors (e.g., `var(--color-primary)`)
- **`.css`**: Returns direct CSS color value as a string
- **`getVariable('padding')`**: Returns CSS variable reference for spacing
- **`.attributes`**: Spreads multiple CSS properties (used for elevation, shadows, etc.)

### CSS Classes vs Inline Styles

Styles are compiled into CSS classes and injected into the document head. This approach:
- Improves performance compared to inline styles
- Allows better CSS caching
- Provides automatic cleanup when components unmount

### Component Naming

Provide a `name` option to `makeStyles` for better debugging:

```typescript
const useStyles = makeStyles((theme) => createStyles({ ... }), { name: 'Card' });
```

### TypeScript Support

For styled-components integration, add type declarations:

```typescript
// styled.d.ts
import 'styled-components';
import type { FusionTheme } from '@equinor/fusion-react-styles';

declare module 'styled-components' {
  export interface DefaultTheme extends FusionTheme {}
}
```

## When to Use This

Use `@equinor/fusion-react-styles` when you need to:
- Style components with design system tokens
- Create reusable styled components
- Access theme values (colors, spacing, elevation)
- Build consistent UI components
- Migrate from Material-UI to React 19 compatible styling

This cookbook serves as a test for the React 19 compatible version with Material-UI dependency removed. Stylesheets are automatically cleaned up when components unmount.
