import ReactDOM from 'react-dom/client';
import { Framework } from '@equinor/fusion-framework-react';
import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';

import { EquinorLoader } from './EquinorLoader';
import { configure } from './config';
import { Router } from './Router';

import fallbackSvg from './resources/fallback-photo.svg';

const fallbackImage = new Blob([fallbackSvg], { type: 'image/svg+xml' });

// biome-ignore lint/suspicious/noExplicitAny: we know this is the bootstrap framework instance
export const render = (target: HTMLElement, args: any) => {
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
