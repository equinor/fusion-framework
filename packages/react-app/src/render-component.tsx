import { Suspense, StrictMode } from 'react';
import type { FunctionComponent } from 'react';
import type { ComponentRenderArgs, ComponentRenderer } from 'create-component';
import ReactDOM from 'react-dom';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createRoot } from 'react-dom/client';

export type RenderTeardown = VoidFunction;

export const renderComponent = (renderer: ComponentRenderer) => {
    return (el: HTMLElement, args: ComponentRenderArgs): RenderTeardown => {
        const Component = renderer(args);
        const renderFn = createRoot ? render : renderLegacy;
        return renderFn(el, Component);
    };
};

const renderLegacy = (el: Element, Component: FunctionComponent): RenderTeardown => {
    ReactDOM.render(
        <StrictMode>
            <Suspense fallback={<p>loading app</p>}>
                <Component />
            </Suspense>
        </StrictMode>,
        el
    );
    return () => {
        ReactDOM.unmountComponentAtNode(el);
    };
};

const render = (el: Element, Component: FunctionComponent): RenderTeardown => {
    const root = createRoot(el);
    root.render(
        <StrictMode>
            <Suspense fallback={<p>loading app</p>}>
                <Component />
            </Suspense>
        </StrictMode>
    );
    return () => {
        root.unmount();
    };
};

export default renderComponent;
