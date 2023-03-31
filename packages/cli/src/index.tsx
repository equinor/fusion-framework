import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

// import 'vite/modulepreload-polyfill';

const Test = (args: { env: unknown }) => {
    return (
        <div>
            <p>Hello there this is all! good 🤙🏻</p>
            <pre>{JSON.stringify(args, undefined, 4)}</pre>
        </div>
    );
};

export const render = (el: HTMLElement, args: { env: unknown }) => {
    const root = ReactDOM.createRoot(el);
    root.render(
        <StrictMode>
            <Test env={args.env} />
        </StrictMode>
    );
    return () => root.unmount();
};

export default render;
