import ReactDOM from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import type { FusionRenderFn } from '@equinor/fusion-framework';
import { Framework } from '@equinor/fusion-framework-react';
import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';

import { EquinorLoader } from './EquinorLoader';
import { configure } from './configure';
import { Router } from './Router';

import fallbackSvg from './resources/svg';

/** Fallback avatar image used when a person photo cannot be loaded. */
const fallbackImage = new Blob([fallbackSvg], { type: 'image/svg+xml' });

const RootStyle = createGlobalStyle`
  :root[data-color-scheme='light'] {
    color-scheme: only light;
  }
`;

/**
 * Mounts the Fusion Dev Portal into the given DOM element.
 *
 * Creates a React root and renders the portal shell with the Equinor theme,
 * Fusion Framework provider, people-resolver provider, and the portal router.
 * This is the main entry point consumed by `@equinor/fusion-framework-dev-server`.
 * The dev shell owns its document for its lifetime and temporarily locks its EDS palette
 * and native controls to light mode when mounting, including for body-mounted portals.
 *
 * @param target - The DOM element to mount the portal into.
 * @param args - Render arguments containing a `ref` to the parent Fusion Framework instance.
 */
export const render: FusionRenderFn = (target, args) => {
  // EDS selects its palette independently of the native CSS color-scheme.
  target.ownerDocument.documentElement.dataset.colorScheme = 'light';

  ReactDOM.createRoot(target).render(
    <ThemeProvider theme={theme}>
      <RootStyle />
      <Framework
        configure={configure}
        parent={args.ref}
        fallback={<EquinorLoader text="Loading framework" />}
      >
        <PeopleResolverProvider options={{ fallbackImage }}>
          <Router />
        </PeopleResolverProvider>
      </Framework>
    </ThemeProvider>,
  );
};

export default render;
