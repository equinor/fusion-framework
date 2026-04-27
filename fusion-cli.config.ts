/**
 * Fusion CLI configuration for local monorepo development.
 *
 * This file is resolved from the repository root so the CLI workspace does not
 * need direct dependencies on the AI plugin workspaces. Keeping the plugin
 * wiring at the root avoids a cyclic workspace graph in Turborepo while still
 * making the plugins available for local development commands.
 *
 * The chat and copilot plugins are loaded optionally so that CI environments
 * (which only need `ai index create`) do not crash when those packages are
 * not installed.
 */
import aiIndexPlugin from '@equinor/fusion-framework-cli-plugin-ai-index';

const optionalPlugins = await Promise.allSettled([
  import('@equinor/fusion-framework-cli-plugin-ai-chat').then((m) => m.default),
  import('@equinor/fusion-framework-cli-plugin-copilot').then((m) => m.default),
]);

export default {
  plugins: [
    aiIndexPlugin,
    ...optionalPlugins
      .filter((r): r is PromiseFulfilledResult<typeof aiIndexPlugin> => r.status === 'fulfilled')
      .map((r) => r.value),
  ],
};
