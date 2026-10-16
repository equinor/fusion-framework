/**
 * Navigation sub-path entry-point.
 *
 * Provides hooks for accessing the Fusion navigation module and creating
 * client-side routers compatible with `react-router`, and `enableAppNavigation`
 * to adopt the navigation strategy supplied by the app initiator.
 *
 * @packageDocumentation
 */
export { enableAppNavigation } from '@equinor/fusion-framework-app/enable-navigation';
export { useNavigationModule } from './useNavigationModule.js';
export { useRouter } from './useRouter.js';
