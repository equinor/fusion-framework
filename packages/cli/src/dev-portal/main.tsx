import React from 'react';
import ReactDOM from 'react-dom/client';

import { Framework } from '@equinor/fusion-framework-react';

import { ThemeProvider, theme } from '@equinor/fusion-react-styles';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import { configure } from './config';

import { AppLoader } from './AppLoader';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <Framework configure={configure} fallback={<StarProgress text="Loading framework" />}>
                <div>
                    <section>
                        <header>
                            <h1>Fusion Dev Portal</h1>
                        </header>
                    </section>
                    <AppLoader appKey={'test-app'} />
                </div>
            </Framework>
        </ThemeProvider>
    </React.StrictMode>
);
