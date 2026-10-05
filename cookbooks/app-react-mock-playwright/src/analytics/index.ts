/**
 * Usage analytics of the cookbook: tracking page views, and reading the app's own events through
 * the Apps service's app-feature events query.
 *
 * @module
 */
export { APP_KEY } from './app-key';
export { appFeatureEventsQuery } from './app-feature-events-query';
export {
  useAppFeatureEvents,
  type AppFeatureEvent,
  type AppFeatureEventsState,
} from './useAppFeatureEvents';
export { usePageViewTracking } from './usePageViewTracking';
