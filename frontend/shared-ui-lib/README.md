# Shared UI Library

A centralized MUI-based theme and component library for the micro-frontend platform.

## Features

- 🎨 **MUI Theme Configuration**: Consistent design tokens across all micro-frontends
- 🌗 **Dark/Light Mode**: Built-in theme switching with localStorage persistence
- 🎯 **CSS Variables**: Runtime theming support for multi-tenancy
- 📦 **Component Library**: Common MUI components with custom styling
- ♿ **Accessibility**: WCAG compliant components
- 📱 **Responsive**: Mobile-first design with MUI breakpoints

## Installation

This library is used internally via Webpack Module Federation. No separate installation needed.

## Usage

### Basic Theme Provider

```tsx
import { ThemeProvider } from '@golden-sample/shared-ui-lib';

function App() {
  return (
    <ThemeProvider defaultMode="light" enableCSSVariables>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Using Theme Context

```tsx
import { useThemeContext } from '@golden-sample/shared-ui-lib';

function MyComponent() {
  const { mode, toggleTheme, theme } = useThemeContext();
  
  return (
    <Button onClick={toggleTheme}>
      Current mode: {mode}
    </Button>
  );
}
```

### Using Design Tokens

```tsx
import { colors, typography, spacing } from '@golden-sample/shared-ui-lib';

const myStyles = {
  color: colors.primary.main,
  fontSize: typography.h1.fontSize,
  padding: spacing.md,
};
```

### Using MUI Components

```tsx
import { Box, Typography, Button } from '@golden-sample/shared-ui-lib';

function MyComponent() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Hello World</Typography>
      <Button variant="contained" color="primary">
        Click Me
      </Button>
    </Box>
  );
}
```

### CSS Variables

The library automatically injects CSS variables that can be used across micro-frontends:

```css
.my-custom-element {
  background-color: var(--primary-main);
  color: var(--primary-contrast-text);
  border-color: var(--divider);
}
```

Available CSS Variables:
- `--primary-main`, `--primary-light`, `--primary-dark`, `--primary-contrast-text`
- `--secondary-main`, `--secondary-light`, `--secondary-dark`, `--secondary-contrast-text`
- `--background-default`, `--background-paper`, `--background-dark`
- `--text-primary`, `--text-secondary`
- `--divider`
- `--error-main`, `--warning-main`, `--info-main`, `--success-main`

## Theme Customization

Create a custom theme by extending the base theme:

```tsx
import { createCustomTheme } from '@golden-sample/shared-ui-lib';

const customTheme = createCustomTheme({
  palette: {
    primary: {
      main: '#custom-color',
    },
  },
  typography: {
    fontFamily: 'Custom Font, sans-serif',
  },
}, 'light');
```

## Design Tokens

### Colors
- Primary: `#61dafb` (React blue)
- Secondary: `#ff6b6b` (Coral red)
- Analytics: `#4ecdc4` (Teal)
- Settings: `#ffa726` (Orange)

### Typography
- Font Family: Roboto, Helvetica, Arial, sans-serif
- Base Font Size: 14px
- Font Weights: 300, 400, 500, 700

### Spacing
- Base Unit: 8px
- Sizes: xs(4px), sm(8px), md(16px), lg(24px), xl(32px), xxl(48px)

### Breakpoints
- xs: 0px
- sm: 600px
- md: 900px
- lg: 1200px
- xl: 1536px

## Module Federation

This library is exposed from the container app and consumed by remote micro-frontends:

```javascript
// Container webpack.config.js
exposes: {
  './sharedUI': './src/shared-ui-lib/src/index.ts',
}

// Remote webpack.config.js
remotes: {
  sharedUI: 'container@http://localhost:3000/remoteEntry.js',
}
```

## Contributing

When adding new design tokens or components:
1. Add to appropriate file in `src/tokens/` or `src/components/`
2. Export from `src/index.ts`
3. Update this README with usage examples
4. Test in at least one micro-frontend

## License

MIT



