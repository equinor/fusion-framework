import { describe, expect } from 'vitest';

import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import type { ContextItem } from '@equinor/fusion-framework-module-context';
import { useCurrentContext } from '@equinor/fusion-framework-react-app/context';

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
      'configure',
      { injected: true },
      () => (configurator) =>
        enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
    );

    test('starts on the seeded context', async ({ render }) => {
      const screen = await render(<CurrentContext />);
      await expect.element(screen.getByText(projectA.title as string)).toBeVisible();
    });
  });
});
