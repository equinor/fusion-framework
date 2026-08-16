import { describe, expect, it } from 'vitest';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import type { ContextProvider } from '../../ContextProvider';
import { module as realModule } from '../../module';
import type { ContextItem } from '../../types';
import { ContextMockConfigurator, contextMockModule, enableContextMock } from '../../mock';
import { createContextItemFactory, createContextItems } from '../../mock/fixtures';

/**
 * Initializes the mock module through the real module system.
 *
 * @remarks
 * Deliberately avoids hand-building initialization arguments — the module
 * system itself is the thing under test, not a fake of it.
 *
 * @param configure - Callback to seed context items or override resolution.
 * @returns The provider the module produced.
 */
const initializeMockWith = async (
  configure?: (mock: ContextMockConfigurator) => void,
): Promise<ContextProvider> => {
  const configurator = new ModulesConfigurator([]);
  enableContextMock(configurator, configure);
  const instances = await configurator.initialize();
  // the configurator's generic instance map doesn't know about the context module by name
  return (instances as unknown as { context: ContextProvider }).context;
};

describe('contextMockModule', () => {
  it('changes nothing but the configurator', () => {
    expect(contextMockModule.name).toBe(realModule.name);
    expect(contextMockModule.initialize).toBe(realModule.initialize);
  });

  it('builds a real ContextModuleConfigurator, so the whole builder stays available', () => {
    const configurator = contextMockModule.configure?.();

    expect(configurator).toBeInstanceOf(ContextMockConfigurator);
  });
});

describe('enableContextMock', () => {
  it('initializes with no current context when nothing is seeded', async () => {
    const provider = await initializeMockWith();

    expect(provider.currentContext).toBeFalsy();
  });

  it('selects a seeded item as the initial context, without a navigation or parent module', async () => {
    const [project] = createContextItems([{ type: 'ProjectMaster' }]);

    const provider = await initializeMockWith((mock) => mock.setCurrentContext(project));

    expect(provider.currentContext?.id).toBe(project.id);
  });

  it('resolves a seeded item by id', async () => {
    const [project] = createContextItems([{ type: 'ProjectMaster' }]);

    const provider = await initializeMockWith((mock) => mock.setContexts([project]));
    const resolved = await provider.setCurrentContextByIdAsync(project.id);

    expect(resolved.id).toBe(project.id);
  });

  it('rejects with a clear error for an unseeded id', async () => {
    const provider = await initializeMockWith();

    await expect(provider.setCurrentContextByIdAsync('missing')).rejects.toThrow(
      /no context item resolves for id "missing"/,
    );
  });

  it('resolves related contexts by filtering the seeded pool by type', async () => {
    const [project] = createContextItems([{ type: 'ProjectMaster' }]);
    const [contract] = createContextItems([{ type: 'Contract', parentTypeIds: ['ProjectMaster'] }]);

    const provider = await initializeMockWith((mock) => mock.setContexts([project, contract]));
    const related = await provider.relatedContextsAsync({
      item: contract,
      filter: { type: ['ProjectMaster'] },
    });

    expect(related).toEqual([project]);
  });

  it('resolves a child-typed item into its configured parent type', async () => {
    const [project] = createContextItems([{ type: 'ProjectMaster' }]);
    const [contract] = createContextItems([{ type: 'Contract', parentTypeIds: ['ProjectMaster'] }]);

    const provider = await initializeMockWith((mock) => {
      // the provider only calls resolveContext for a type it wasn't configured to accept
      mock.addConfigBuilder((builder) => {
        builder.setContextType(['ProjectMaster']);
      });
      mock.setContexts([project, contract]);
    });

    const resolved = await provider.resolveContextAsync(contract);

    expect(resolved.id).toBe(project.id);
  });

  it('overrides the default type-filtered related contexts for one specific item', async () => {
    const createContract = createContextItemFactory('contract');
    const contractA = createContract({
      type: { id: 'Contract', isChildType: true, parentTypeIds: ['ProjectMaster'] },
    });
    const contractB = createContract({
      type: { id: 'Contract', isChildType: true, parentTypeIds: ['ProjectMaster'] },
    });

    const provider = await initializeMockWith((mock) => {
      mock.setContexts([contractA, contractB]);
      mock.setRelatedContexts(contractA.id, [contractB]);
    });
    const related = await provider.relatedContextsAsync({
      item: contractA,
      filter: { type: ['Contract'] },
    });

    expect(related).toEqual([contractB]);
  });

  it('resolves through the escape hatch when set', async () => {
    const special: ContextItem = { id: 'special', type: { id: 'ProjectMaster' }, value: {} };

    const provider = await initializeMockWith((mock) =>
      mock.setResolver((id) => (id === 'special' ? special : undefined)),
    );
    const resolved = await provider.setCurrentContextByIdAsync('special');

    expect(resolved).toEqual(special);
  });
});
