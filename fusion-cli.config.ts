/**
 * Fusion CLI configuration for local monorepo development.
 *
 * This file is resolved from the repository root so the CLI workspace does not
 * need direct dependencies on the AI plugin workspaces. Keeping the plugin
 * wiring at the root avoids a cyclic workspace graph in Turborepo while still
 * making the plugins available for local development commands.
 */
import aiIndexPlugin from '@equinor/fusion-framework-cli-plugin-ai-index';
import aiChatPlugin from '@equinor/fusion-framework-cli-plugin-ai-chat';
import copilotPlugin from '@equinor/fusion-framework-cli-plugin-copilot';

export default {
  plugins: [aiIndexPlugin, aiChatPlugin, copilotPlugin],
};
