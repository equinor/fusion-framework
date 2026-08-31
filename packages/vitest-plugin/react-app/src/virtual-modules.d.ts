declare module 'virtual:fusion-app-test-env' {
  import type { AppEnv } from '@equinor/fusion-framework-app';

  export const manifest: AppEnv['manifest'];
  export const config: AppEnv['config'];
  export const usesFeatureFlag: boolean;
}

declare module 'virtual:fusion-app-test-configure' {
  import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';

  export const configure: AppMockConfigureFn | undefined;
}
