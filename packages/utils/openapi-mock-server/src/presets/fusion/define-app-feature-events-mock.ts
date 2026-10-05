import { defineService } from '../../discovery/define-service.js';
import type { ServiceMockDefinition } from '../../discovery/discover-services.js';
import type { AnalyticsSender, AnalyticsStore } from './analytics/AnalyticsStore.js';
import { executeAppFeatureEventsQuery } from './analytics/execute-app-feature-events-query.js';
import { resolveAnalyticsSender } from './analytics/resolve-analytics-sender.js';
import type { AnalyticsEventRow, AppFeatureEventRow } from './analytics/types.js';

/** Options for {@link defineAppFeatureEventsMock}. */
export interface DefineAppFeatureEventsMockOptions {
  /** The store the mock Monitor service keeps analytics in, usually `defineAnalyticsMock().store`. */
  store: AnalyticsStore;
  /** Key of the Apps service to merge onto. Defaults to `apps`. */
  key?: string;
  /**
   * Decides whether a signed-in user may query app-feature events. The real Apps service only
   * answers app admins and users with full control; this mock allows every signed-in user unless
   * a rule is given here.
   */
  isAppAdmin?: (sender: AnalyticsSender) => boolean;
}

/**
 * Checks whether an event-table row is an `app-feature` event.
 *
 * @param row - Any stored event row.
 * @returns Whether the row belongs to `event_app_features`.
 */
const isAppFeatureRow = (row: AnalyticsEventRow): row is AppFeatureEventRow =>
  row.event_name === 'app-feature';

/**
 * Adds the Apps service's `POST /apps/feature-events/query` to the mock `apps` service, answering
 * with the app-feature events the mock Monitor service received and any seeded history — so an
 * app's analytics page shows real local events instead of hand-written samples.
 *
 * @remarks
 * Merges onto the `apps` service of the Fusion preset, which must be loaded first. Queries run
 * against the caller's own browser session plus the seeded history, using Fabric's GraphQL
 * schema, limits, and error format (see `executeAppFeatureEventsQuery`). Answers `401` without a
 * signed-in user and `403` when {@link DefineAppFeatureEventsMockOptions.isAppAdmin} rejects the
 * user.
 *
 * @param options - The shared analytics store, and optional service key and admin rule.
 * @returns An `apps` merge definition.
 *
 * @example
 * ```typescript
 * const monitor = defineAnalyticsMock({ seed: 'recordings' });
 * server.use('fusion').use([monitor, defineAppFeatureEventsMock({ store: monitor.store })]);
 * ```
 */
export function defineAppFeatureEventsMock(
  options: DefineAppFeatureEventsMockOptions,
): ServiceMockDefinition {
  const { store, key = 'apps', isAppAdmin = () => true } = options;

  return defineService({
    key,
    serviceDiscovery: 'merge',
    middleware: (router) => {
      router.post('/apps/feature-events/query', async (req, res, { body, identity }) => {
        const sender = resolveAnalyticsSender(req, identity);
        // The Apps service requires a signed-in user.
        if (!sender) {
          res.statusCode = 401;
          return res.json({
            error: { code: 'Unauthorized', message: 'A signed-in user is required.' },
          });
        }
        // Only app admins may read usage data, as in the Apps service.
        if (!isAppAdmin(sender)) {
          res.statusCode = 403;
          return res.json({
            error: { code: 'Forbidden', message: 'User must be an app admin for at least one app' },
          });
        }

        await store.ready();
        // Only app-feature events are exposed, as the Apps service only queries that table.
        const rows = store.getRows(sender.sessionId).filter(isAppFeatureRow);
        res.json(await executeAppFeatureEventsQuery(rows, body));
      });
    },
  });
}

export default defineAppFeatureEventsMock;
