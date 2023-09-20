import React from 'react';
import ReactDOM from 'react-dom/client';
import { Framework } from '@equinor/fusion-framework-react';
import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { EquinorLoader } from './EquinorLoader';
import { configure } from './config';
import { Router } from './Router';
import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';

const target = document.getElementById('root') as HTMLElement;

import fallbackSvg from './resources/fallback-photo.svg';

const fallbackImage = new Blob([fallbackSvg], { type: 'image/svg+xml' });

ReactDOM.createRoot(target).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <Framework configure={configure} fallback={<EquinorLoader text="Loading framework" />}>
                <PeopleResolverProvider options={{ fallbackImage }}>
                    <Router />
                </PeopleResolverProvider>
            </Framework>
        </ThemeProvider>
    </React.StrictMode>,
);
