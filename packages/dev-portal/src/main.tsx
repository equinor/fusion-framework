import ReactDOM from 'react-dom/client';
import type { FusionRenderFn } from '@equinor/fusion-framework';
import { Framework } from '@equinor/fusion-framework-react';
import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';

import { EquinorLoader } from './EquinorLoader.js';
import { configure } from './configure.js';
import { installEdsColorScheme } from './install-eds-color-scheme.js';
import { Router } from './Router.js';

/**
 * Mounts the Fusion Dev Portal into the given DOM element.
 *
 * Creates a React root and renders the portal shell with the Equinor theme,
 * Fusion Framework provider, people-resolver provider, and the portal router.
 * This is the main entry point consumed by `@equinor/fusion-framework-dev-server`.
 *
 * @param target - The DOM element to mount the portal into.
 * @param args - Render arguments containing a `ref` to the parent Fusion Framework instance.
 */
export const render: FusionRenderFn = (target, args) => {
  installEdsColorScheme(target.ownerDocument);
  ReactDOM.createRoot(target).render(
    <ThemeProvider theme={theme}>
      <Framework
        configure={configure}
        parent={args.ref}
        fallback={<EquinorLoader text="Loading framework" />}
      >
        {/* No fallback image: a missing photo shows the person avatar's themed placeholder, which follows the colour scheme. */}
        <PeopleResolverProvider>
          <Router />
        </PeopleResolverProvider>
      </Framework>
    </ThemeProvider>,
  );
};

export default render;
