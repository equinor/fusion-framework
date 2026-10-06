/**
 * Mock service definitions served by the mock server: the Monitor service that receives
 * analytics, and the Apps service's app-feature events query.
 *
 * @module
 */
export {
  defineAnalyticsMock,
  type AnalyticsMockDefinition,
  type DefineAnalyticsMockOptions,
} from './define-analytics-mock.js';
export {
  defineAppFeatureEventsMock,
  type DefineAppFeatureEventsMockOptions,
} from './define-app-feature-events-mock.js';
