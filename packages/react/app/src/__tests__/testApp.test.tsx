import { describe, expect } from 'vitest';

import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import type { ContextItem } from '@equinor/fusion-framework-module-context';
import { useCurrentContext } from '@equinor/fusion-framework-react-app/context';
import { useFramework } from '@equinor/fusion-framework-react';
import { createHistory, enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { testApp } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

const projectA: ContextItem = {
  id: 'ctx-a',
  title: 'Project A',
  type: { id: 'ProjectMaster' },
  value: {},
};

const Greeting = () => <p>hello</p>;

const CurrentContext = () => {
  const { currentContext } = useCurrentContext();
  return <p>{currentContext?.title ?? 'none'}</p>;
};

describe('testApp', () => {
  testApp(
    'resolves a fusion/app scope and renders through the public /vitest entry point',
    async ({ render, fusion, app }) => {
      const screen = await render(<Greeting />);
      await expect.element(screen.getByText('hello')).toBeVisible();
      expect(fusion).toBeDefined();
      expect(app).toBeDefined();
    },
  );

  describe('with a seeded context module', () => {
    const test = testApp.extend(
      'configureApp',
      { injected: true },
      () => (configurator) =>
        enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
    );

    test('starts on the seeded context', async ({ render }) => {
      const screen = await render(<CurrentContext />);
      await expect.element(screen.getByText(projectA.title as string)).toBeVisible();
    });
  });

  describe('with a configured parent framework', () => {
    const NavigationLocation = () => {
      const { navigation } = useFramework<[NavigationModule]>().modules;
      return <p>{navigation.history.location.pathname}</p>;
    };

    // pushed on the history instance itself, before it's handed to the framework configurator,
    // so a passing assertion also proves `configureFusion` ran ahead of framework initialization
    const history = createHistory('memory');
    history.push('/configured-by-configure-fusion');

    const test = testApp.extend(
      'configureFusion',
      { injected: true },
      () => (configurator) =>
        enableNavigation(configurator, { configure: (config) => config.setHistory(history) }),
    );

    test('resolves the fusion instance with the configured navigation history', async ({
      render,
    }) => {
      const screen = await render(<NavigationLocation />);
      await expect.element(screen.getByText('/configured-by-configure-fusion')).toBeVisible();
    });
  });
});
