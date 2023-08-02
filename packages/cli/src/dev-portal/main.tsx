import React from 'react';
import ReactDOM from 'react-dom/client';
import { Framework } from '@equinor/fusion-framework-react';
import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { EquinorLoader } from './EquinorLoader';
import { configure } from './config';
import { Router } from './Router';

document.body.style.height = '100vh';
const target = document.getElementById('root') as HTMLElement;
target.style.height = '100%';

ReactDOM.createRoot(target).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <Framework configure={configure} fallback={<EquinorLoader text="Loading framework" />}>
                <Router />
            </Framework>
        </ThemeProvider>
    </React.StrictMode>,
);
