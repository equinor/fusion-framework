import type { RouterSchema } from '../types.js';
import { BaseFileRoute } from './BaseFileRoute.js';

/**
 * Represents an index route that renders at the parent route’s path.
 *
 * Index routes provide default content when the parent route matches
 * but no child route does (equivalent to `index: true` in React Router).
 */
export class IndexRoute extends BaseFileRoute {
  /**
   * @param file - Path to the index route component module.
   * @param schema - Optional route schema for documentation and manifest generation.
   */
  constructor(file: string, schema?: RouterSchema) {
    super('index', file, schema ? { route: schema } : { route: {} });
  }
}
