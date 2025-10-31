import { Suspense, StrictMode } from 'react';
import type { FunctionComponent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { ComponentRenderArgs, ComponentRenderer } from './create-component';

export type RenderTeardown = VoidFunction;

/**
 * Renders a React component into a DOM element using React 18's createRoot API.
 * 
 * @param el - The DOM element to render into
 * @param Component - The React component to render
 * @returns A teardown function that unmounts the component
 */
const render = (el: Element, Component: FunctionComponent): RenderTeardown => {
  const root: Root = createRoot(el);
  root.render(
    <StrictMode>
      <Suspense fallback={<p>loading app</p>}>
        <Component />
      </Suspense>
    </StrictMode>,
  );
  return () => {
    root.unmount();
  };
};

/**
 * Creates a render function for a component renderer.
 * Uses React 18's createRoot API instead of the deprecated ReactDOM.render.
 * 
 * @param renderer - A function that creates a component from fusion and env
 * @returns A function that renders the component into a DOM element
 */
export const renderComponent = (renderer: ComponentRenderer) => {
  return (el: HTMLElement, args: ComponentRenderArgs): RenderTeardown => {
    const Component = renderer(args.fusion, args.env);
    return render(el, Component);
  };
};

export default renderComponent;

