import { defineDevServerConfig } from  '@equinor/fusion-framework-cli/dev-server'

export default defineDevServerConfig(() => ({
  spa: {
    templateEnv: {
      telemetry: { consoleLevel: 0 }
    }
  }
}));