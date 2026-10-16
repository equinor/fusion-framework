import {
  createContext,
  type ActionFunction,
  type ErrorElement,
  type LoaderFunction,
  type MiddlewareFunction,
  type RouteObject,
} from '../../../index.js';

/** Viewer resolved by middleware and read by the route's loader and action. */
export type Viewer = {
  /** Display name taken from the request. */
  name: string;
  /** Whether the viewer may submit the action. */
  canWrite: boolean;
};

/** Route parameters of the fixture route. */
export type ProjectParams = { projectId?: string };

/** Typed context key shared by the middleware, the loader and the action. */
export const viewerContext = createContext<Viewer>();

/**
 * Resolves the viewer from the `viewer` search parameter and stores it for this execution.
 *
 * @param args - Middleware arguments with the request and per-execution context.
 * @param next - Runs the loader or action.
 * @returns The downstream result, unchanged.
 */
export const resolveViewer: MiddlewareFunction<ProjectParams> = ({ request, context }, next) => {
  const name = new URL(request.url).searchParams.get('viewer') ?? 'anonymous';
  context.set(viewerContext, { name, canWrite: name !== 'anonymous' });
  return next();
};

/**
 * Typed Fusion loader that reads the viewer written by {@link resolveViewer}.
 *
 * @param args - Loader arguments with params, per-execution context and Fusion context.
 * @returns A label combining viewer, project and the Fusion custom context.
 */
export const projectLoader: LoaderFunction<ProjectParams> = ({ context, params, fusion }) => {
  const viewer: Viewer = context.get(viewerContext);
  return `${viewer.name}:${params.projectId}:${String(fusion.context !== undefined)}`;
};

/**
 * Typed Fusion action that authorises the submission with the viewer from middleware.
 *
 * @param args - Action arguments with the request and per-execution context.
 * @returns A label naming who saved which value.
 * @throws Error when the viewer may not write.
 */
export const projectAction: ActionFunction<ProjectParams> = async ({ context, request }) => {
  const viewer: Viewer = context.get(viewerContext);
  // The action trusts only the middleware-resolved viewer, never the submitted form.
  if (!viewer.canWrite) {
    throw new Error(`${viewer.name} may not write`);
  }
  const form = await request.formData();
  return `${viewer.name} saved ${String(form.get('value'))}`;
};

/**
 * Builds the fixture route with the typed middleware, loader and action.
 *
 * @param Component - Page component rendering loader and action results.
 * @param errorElement - Boundary rendering rejected executions with the Fusion error props.
 * @returns Route objects for `/projects/:projectId`.
 */
export const createContextPipelineRoutes = (
  Component: RouteObject['Component'],
  errorElement: ErrorElement,
): RouteObject[] => [
  {
    path: '/projects/:projectId',
    middleware: [resolveViewer],
    loader: projectLoader,
    action: projectAction,
    Component,
    errorElement,
  },
];
