import { StrictMode } from 'react';
import AppRouter from './Router';

export default function () {
    return (
        <StrictMode>
            <h1>React Router App</h1>
            <AppRouter />
        </StrictMode>
    );
}
