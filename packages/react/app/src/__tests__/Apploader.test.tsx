import { describe, expect, it, vi } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppManifest, AppModule } from '@equinor/fusion-framework-module-app';

import { Apploader } from '../apploader/Apploader';
import { renderAppComponent } from '../vitest/render-app-component';

// resolved from this test file rather than hardcoded, so it survives a package move
const fixturesUri = new URL('./fixtures', import.meta.url).pathname;

describe('Apploader', () => {
  it('mounts the child app’s rendered content once its script loads', async () => {
    const manifest: AppManifest = {
      appKey: 'child-app',
      displayName: 'Child App',
      description: 'A child application',
      type: 'standalone',
      build: { version: '1.0.0', entryPoint: 'apploader-child-script.ts', assetPath: '' },
    };

    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, { manifest }, fixturesUri),
    );

    const { container } = await renderAppComponent(<Apploader appKey="child-app" />, { fusion });

    // the loading state renders synchronously, before the script's dynamic import resolves
    expect(container.textContent).toContain('Loading child-app');
    await vi.waitFor(() => expect(container.textContent).toContain('mounted: child-app'));
  });

  it('surfaces the load error instead of throwing when the app’s script fails to import', async () => {
    const manifest: AppManifest = {
      appKey: 'broken-app',
      displayName: 'Broken App',
      description: 'An application whose build entry point does not exist',
      type: 'standalone',
      build: { version: '1.0.0', entryPoint: 'does-not-exist.ts', assetPath: '' },
    };

    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, { manifest }, fixturesUri),
    );

    const { container } = await renderAppComponent(<Apploader appKey="broken-app" />, { fusion });

    await vi.waitFor(() => expect(container.textContent).toContain('Error loading broken-app'));
  });
});
