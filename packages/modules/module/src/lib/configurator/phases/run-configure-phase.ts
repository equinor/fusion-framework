import type { ConfigurePhaseContext } from './create-module-configs.js';
import { createModuleConfigs } from './create-module-configs.js';
import { runPostConfigureHooks } from './run-post-configure-hooks.js';

/**
 * Runs the full configure lifecycle phase for a set of modules.
 *
 * Orchestrates three sub-steps in order:
 * 1. {@link createModuleConfigs} — call each module's `configure(ref)` factory.
 * 2. Apply all user-registered config callbacks (`_configs`) sequentially.
 * 3. {@link runPostConfigureHooks} — call `postConfigure` and `afterConfiguration` hooks.
 *
 * @param ctx - The configure phase context.
 * @param ref - Optional reference forwarded through all configure hooks.
 * @returns A promise resolving to the fully configured module config map.
 * @template TRef - Reference type forwarded to module configure hooks.
 */
export async function runConfigurePhase<TRef>(
  ctx: ConfigurePhaseContext<TRef>,
  ref?: TRef,
): Promise<// biome-ignore lint/suspicious/noExplicitAny: internal type-erased dispatch — the configure phase coordinates opaque module configs without knowing their concrete shapes
any> {
  // Step 1: Create raw config objects for all registered modules
  const config = await createModuleConfigs<TRef>(ctx, ref);

  // Step 2: Apply all user-registered configuration callbacks concurrently.
  await Promise.all(
    // Invoke every registered configure callback with the merged config
    ctx.configs.map((cb) => Promise.resolve(cb(config, ref))),
  );

  // Step 3: Run module postConfigure hooks and afterConfiguration callbacks
  await runPostConfigureHooks(ctx, config);

  return config;
}

export default runConfigurePhase;
