import { Suspense } from 'react';
import ReactDOM from 'react-dom';

import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import Framework from './FrameWork';
import App from './App';

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <Suspense fallback={<StarProgress text="Loading framework" />}>
            <Framework>
                <App />
            </Framework>
        </Suspense>
    </ThemeProvider>,
    document.getElementById('root')
);
