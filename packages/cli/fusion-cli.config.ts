/**
 * Fusion CLI configuration for local development.
 *
 * This configuration file is used only for building and running the CLI locally.
 * It does not affect releases or published packages. Plugins listed here will be
 * available when running the CLI from source, but are not bundled into the
 * published package.
 */
import aiIndexPlugin from '@equinor/fusion-framework-cli-plugin-ai-index';
import aiChatPlugin from '@equinor/fusion-framework-cli-plugin-ai-chat';
import aiMcpPlugin from '@equinor/fusion-framework-cli-plugin-ai-mcp';

export default {
  plugins: [
    aiIndexPlugin,
    '@equinor/fusion-framework-cli-plugin-ai-search',
    aiChatPlugin,
    aiMcpPlugin,
  ],
};
