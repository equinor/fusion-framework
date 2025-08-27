import ReactDOM from 'react-dom/client';
import type { FusionRenderFn } from '@equinor/fusion-framework';
import { Framework } from '@equinor/fusion-framework-react';
import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';

import { EquinorLoader } from './EquinorLoader';
import { configure } from './config';
import { Router } from './Router';

import fallbackSvg from './resources/fallback-photo.svg';

const fallbackImage = new Blob([fallbackSvg], { type: 'image/svg+xml' });

export const render: FusionRenderFn = (target, args) => {
  ReactDOM.createRoot(target).render(
    <ThemeProvider theme={theme}>
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
