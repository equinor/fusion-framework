import { EMPTY, from, lastValueFrom, of, throwError } from 'rxjs';

import type { ModuleInitializerArgs } from '@equinor/fusion-framework-module';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import type { ServicesModule } from '@equinor/fusion-framework-module-services';

import { ContextModuleConfigurator } from '../ContextModuleConfigurator';
import type { ContextModuleConfig } from '../ContextModuleConfig';
import type { IContextModuleConfigurator } from '../ContextModuleConfigurator.interface';
import type { ContextItem } from '../types';

/**
 * Resolves a context item by id, or `undefined` if none matches.
 *
 * @remarks
 * The escape hatch for {@link ContextMockConfigurator.setResolver} — anything
 * the friendly seeding methods did not anticipate can be expressed here instead.
 */
export type ContextResolverFn = (id: string) => ContextItem | undefined;

/**
 * A {@link ContextModuleConfigurator} backed by in-memory context items instead
 * of a real context API, for seeding context in tests.
 *
 * @remarks
 * Two layers cover different needs, both running through the real
 * `ContextProvider` logic underneath — only the data source is substituted,
 * never `validateContext`, `resolveContext`, or parent-context propagation:
 *
 * - **Friendly layer** — {@link setCurrentContext}, {@link setContexts},
 *   {@link addContext}, {@link setRelatedContexts} — a small, context-domain
 *   vocabulary for the common case: seed a known item, get it back.
 * - **Escape hatch** — {@link setResolver} — a raw id-lookup function for a
 *   custom id-based resolution strategy or a shape the friendly layer did not
 *   cover. Only replaces id-based lookup (used by `setCurrentContextById` and
 *   the initial context); it does not affect related-context resolution by
 *   item, which always goes through {@link setRelatedContexts} instead.
 *
 * Seeding the initial context (via {@link setCurrentContext}) overrides
 * `resolveInitialContext` directly with the seeded item, so a test never needs
 * to construct a fake navigation module or parent framework instance to make an
 * app start up with a known context selected. Resolving a context id from a URL
 * path on startup is not covered — that needs a fake router, which is separate,
 * not-yet-built work.
 *
 * Seeded ids are never generated for you — every item is looked up and
 * returned exactly by the id it was seeded with, so a test never sees a
 * different id than the one it wrote. Use `createContextItemFactory` or
 * `createContextItems` for fixtures needing ids of their own, rather than a
 * random generator that would change on every run.
 *
 * Related-context resolution defaults to the same seeded pool, filtered to
 * whichever type(s) the query asked for — related context is the same
 * context, just a different type, exactly as `ContextProvider.resolveContext`
 * uses it to resolve an item of an unexpected type into one of the configured
 * type. Seed items of both types and resolution works with no extra wiring;
 * {@link setRelatedContexts} overrides that default for one specific item.
 *
 * @example Seed and select a known context item
 * ```ts
 * enableContextMock(configurator, (mock) => {
 *   mock.setCurrentContext({ id: 'my-ctx', type: { id: 'ProjectMaster' }, value: {} });
 * });
 * ```
 *
 * @example Resolve a child-typed item into its parent type
 * ```ts
 * enableContextMock(configurator, (mock) => {
 *   // no explicit wiring needed — relatedContexts filters this same pool by type
 *   mock.setContexts([project, facility]);
 * });
 * ```
 *
 * @example Override related contexts for one specific item
 * ```ts
 * enableContextMock(configurator, (mock) => {
 *   mock.addContext(project);
 *   mock.setRelatedContexts(project.id, [facilityA, facilityB]);
 * });
 * ```
 *
 * @example Escape hatch for a custom resolution need
 * ```ts
 * enableContextMock(configurator, (mock) => {
 *   mock.setResolver((id) => (id === 'special' ? specialContextItem : undefined));
 * });
 * ```
 */
export class ContextMockConfigurator extends ContextModuleConfigurator {
  #contexts = new Map<string, ContextItem>();
  #related = new Map<string, ContextItem[]>();
  #resolver?: ContextResolverFn;
  #pendingCurrentId?: string;

  /**
   * Registers the in-memory client up front, so `createConfig` never falls
   * back to building one from a real `ServicesModule` — a mock needs neither
   * an API provider nor a network to answer `get`/`query`/`related`.
   */
  constructor() {
    super();
    this.addConfigBuilder((builder) => {
      builder.setContextClient({
        get: (args) => {
          const item = this.#resolve(args.id);
          // a caller asking for an unseeded id gets a clear error, not a silent miss
          return item
            ? of(item)
            : throwError(
                () =>
                  new Error(
                    `ContextMockConfigurator: no context item resolves for id "${args.id}" — seed it with setCurrentContext/setContexts/addContext, or provide setResolver.`,
                  ),
              );
        },
        query: () => of([...this.#contexts.values()]),
        related: (args) => {
          const override = this.#related.get(args.item.id);
          // an explicit override for this exact item always wins
          if (override) return of(override);
          const types = args.filter?.type;
          // otherwise: related context is the same seeded pool, filtered to the requested type(s)
          return of(
            [...this.#contexts.values()].filter(
              (item) => item.id !== args.item.id && (!types || types.includes(item.type.id)),
            ),
          );
        },
      });
    });
  }

  /**
   * Seeds a context item and selects it as the context the app resolves on startup.
   *
   * @param item - The context item to seed and select.
   * @returns This configurator, for chaining.
   */
  public setCurrentContext(item: ContextItem): this {
    this.#contexts.set(item.id, item);
    this.#pendingCurrentId = item.id;
    return this;
  }

  /**
   * Seeds multiple context items, making each resolvable by id.
   *
   * @remarks
   * Does not select any of them as current — pair with {@link setCurrentContext}
   * for that.
   *
   * @param items - The context items to seed.
   * @returns This configurator, for chaining.
   */
  public setContexts(items: ContextItem[]): this {
    // seed every item so each is individually resolvable by id
    for (const item of items) this.#contexts.set(item.id, item);
    return this;
  }

  /**
   * Seeds a single context item, making it resolvable by id.
   *
   * @param item - The context item to seed.
   * @returns This configurator, for chaining.
   */
  public addContext(item: ContextItem): this {
    this.#contexts.set(item.id, item);
    return this;
  }

  /**
   * Overrides related-context resolution for one specific source item.
   *
   * @remarks
   * Without this, `relatedContexts` filters the seeded pool by the requested
   * type(s) — this is only needed when a test wants a specific item to resolve
   * something other than that default (e.g. no related items at all).
   *
   * @param itemId - The id of the item relations are being overridden for.
   * @param items - The context items to return from `relatedContexts` for that item.
   * @returns This configurator, for chaining.
   */
  public setRelatedContexts(itemId: string, items: ContextItem[]): this {
    this.#related.set(itemId, items);
    return this;
  }

  /**
   * Escape hatch: overrides id-based context resolution directly.
   *
   * @remarks
   * For a custom id-lookup strategy or a shape the friendly seeding methods
   * above did not cover — reaching for this means they were already tried
   * and did not fit. Only replaces lookup by id (used by
   * `setCurrentContextById` and the seeded initial context) — related-context
   * resolution by item always goes through {@link setRelatedContexts} instead,
   * regardless of this setting.
   *
   * @param fn - Resolves a context item by id, or returns `undefined` if none matches.
   * @returns This configurator, for chaining.
   */
  public setResolver(fn: ContextResolverFn): this {
    this.#resolver = fn;
    return this;
  }

  /**
   * Resolves an id through the escape hatch if one is set, otherwise the seeded map.
   *
   * @param id - The context id to resolve.
   * @returns The matching context item, or `undefined`.
   */
  #resolve(id: string): ContextItem | undefined {
    // the escape hatch, when set, replaces the seeded map entirely
    return this.#resolver ? this.#resolver(id) : this.#contexts.get(id);
  }

  /**
   * Defaults `resolveInitialContext` from the seeded/resolved state, once the
   * real config has been assembled.
   *
   * @param config - The context module config assembled by the base configurator.
   * @param init - Module initializer arguments.
   * @returns The context module configuration, backed by seeded/resolved data.
   */
  protected override async _processConfig(
    config: Partial<ContextModuleConfig>,
    init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule, NavigationModule]>,
  ): Promise<ContextModuleConfig> {
    // the base default is a plain Observable (`of(...)`), not a thenable — unwrap it explicitly
    const resolved = await lastValueFrom(from(super._processConfig(config, init)));
    const id = this.#pendingCurrentId;

    // The base default resolves from the URL path or a parent framework, and
    // throws when neither is present — the common case for an isolated mock.
    // Resolve the seeded item when one was selected, otherwise resolve none.
    resolved.resolveInitialContext = id ? () => of(this.#resolve(id)) : () => EMPTY;

    return resolved;
  }
}

export default ContextMockConfigurator;
