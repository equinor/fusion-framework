import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { WidgetConfigurator } from './WidgetConfigurator';
import type { WidgetModulesInstance, WidgetModuleInitiator, WidgetEnv } from './types';
import type { WidgetRenderArgs } from '@equinor/fusion-framework-module-widget';

/**
 * Create a widget module initializer for configuring and bootstrapping widget modules.
 *
 * This is the primary entry point for widget authors. Call `configureWidgetModules`
 * with an optional configuration callback and export the result as the widget's
 * default export. The Fusion portal will invoke the returned async function at
 * render time, passing the current {@link Fusion} runtime and widget environment.
 *
 * The configuration callback receives an {@link IWidgetConfigurator} that exposes
 * helpers for setting up HTTP clients, MSAL authentication, service-discovery
 * bindings, and additional custom modules.
 *
 * @template TModules - Additional modules beyond the default widget module set.
 * @template TRef - Fusion runtime type (defaults to {@link Fusion}).
 * @template TEnv - Widget environment shape (defaults to {@link WidgetEnv}).
 *
 * @param cb - Optional configuration callback invoked before modules initialize.
 *             Use it to register HTTP clients, auth, service bindings, or custom modules.
 * @returns An async initializer function that, given {@link WidgetRenderArgs},
 *          creates and returns a fully initialized {@link WidgetModulesInstance}.
 *
 * @example
 * ```ts
 * import { configureWidgetModules } from '@equinor/fusion-framework-widget';
 *
 * export default configureWidgetModules((configurator, { env }) => {
 *   configurator.configureMsal({
 *     tenantId: '{TENANT_ID}',
 *     clientId: '{CLIENT_ID}',
 *     redirectUri: '/authentication/login-callback',
 *   });
 *   configurator.configureHttpClient('myApi', {
 *     baseUri: 'https://api.example.com',
 *     defaultScopes: ['api://my-client-id/.default'],
 *   });
 * });
 * ```
 */
export const configureWidgetModules =
  <
    TModules extends Array<AnyModule> | never,
    TRef extends Fusion = Fusion,
    TEnv extends WidgetEnv = WidgetEnv,
  >(
    cb?: WidgetModuleInitiator<TModules, TRef, TEnv>,
  ): ((args: WidgetRenderArgs<TRef, TEnv>) => Promise<WidgetModulesInstance<TModules>>) =>
  /**
   * Async initializer that creates widget modules from the Fusion runtime.
   *
   * @param args - Render-time arguments containing the Fusion runtime and widget environment.
   * @returns A promise resolving to the initialized widget modules instance.
   */
  async (args: WidgetRenderArgs<TRef, TEnv>): Promise<WidgetModulesInstance<TModules>> => {
    const configurator = new WidgetConfigurator<TModules, TRef['modules']>();
    if (cb) {
      await Promise.resolve(cb(configurator, args));
    }
    const modules = (await configurator.initialize(
      args.fusion.modules,
      // TODO
    )) as unknown as WidgetModulesInstance<TModules>;

    // TODO - fire event when widget is loaded
    // if (args.env.manifest?.key) {
    //     modules.event.dispatchEvent('onAppModulesLoaded', {
    //         detail: { appKey: args.env.manifest.key, modules },
    //     });
    // }
    return modules;
  };

export default configureWidgetModules;
