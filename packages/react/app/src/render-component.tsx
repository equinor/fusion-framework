import { Suspense, StrictMode } from 'react';
import type { FunctionComponent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { ComponentRenderArgs, ComponentRenderer } from './create-component';

/**
 * Callback returned after mounting an application; invoke it to unmount and clean
 * up the React root.
 */
export type RenderTeardown = VoidFunction;

/**
 * Renders a React component into a DOM element using React 18's `createRoot` API.
 *
 * The component is wrapped in `<StrictMode>` and `<Suspense>` with a basic
 * loading fallback.
 *
 * @param el - The DOM element to render into.
 * @param Component - The React function component to render.
 * @returns A {@link RenderTeardown} callback that unmounts the component.
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
 * Creates a mount function from a {@link ComponentRenderer}.
 *
 * The returned function accepts a target `HTMLElement` and
 * {@link ComponentRenderArgs}, resolves the lazy component via the renderer,
 * and mounts it with React 18's `createRoot`.
 *
 * @param renderer - A {@link ComponentRenderer} that produces a lazy component
 *   from Fusion and environment arguments.
 * @returns A function `(el, args) => RenderTeardown` that mounts the app and
 *   returns a teardown callback.
 */
export const renderComponent = (renderer: ComponentRenderer) => {
  return (el: HTMLElement, args: ComponentRenderArgs): RenderTeardown => {
    const Component = renderer(args.fusion, args.env);
    return render(el, Component);
  };
};

export default renderComponent;
