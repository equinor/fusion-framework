import {
  BehaviorSubject,
  distinctUntilChanged,
  from,
  map,
  type Observable,
  pairwise,
  Subscription,
  takeWhile,
} from 'rxjs';

import type { ModuleType } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';

import type {
  AppConfig,
  AppManifest,
  AppReference,
  AppSettings,
  ConfigEnvironment,
  CurrentApp,
} from './types';

import { App, filterEmpty, type IApp } from './app/App';
import type { AppModuleConfig } from './AppConfigurator';
import type { AppBundleStateInitial } from './app/types';
import type { IAppClient } from './AppClient';
import { SemanticVersion } from '@equinor/fusion-framework-module';
import { version } from './version';

/**
 * Runtime provider for the app module.
 *
 * Exposes methods for fetching application manifests, configurations, and user
 * settings, and for setting or clearing the current active application. When an
 * {@link EventModule} is available, lifecycle events are dispatched as the
 * current app changes.
 *
 * @remarks
 * Only one application can be active (`current`) at a time. Setting a new current
 * app automatically disposes the previous one. Subscribe to {@link current$} for
 * reactive updates.
 */
export class AppModuleProvider {
  /**
   * Shallow-compares two app manifests by JSON serialization.
   *
   * @param a - First manifest to compare.
   * @param b - Second manifest to compare.
   * @returns `true` if the serialized manifests are identical.
   */
  static compareAppManifest<T extends AppManifest>(a?: T, b?: T): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  #appClient: IAppClient;

  #appBaseUri: string;

  #current$: BehaviorSubject<CurrentApp | null>;

  #subscription = new Subscription();

  #event?: ModuleType<EventModule>;

  /**
   * Get module version
   */
  get version(): SemanticVersion {
    return new SemanticVersion(version);
  }

  /**
   * The current active application instance.
   *
   * - `undefined` – no application has been set yet.
   * - `null` – the current application was explicitly cleared.
   * - `App` – an active application instance.
   */
  get current(): CurrentApp | null | undefined {
    return this.#current$.value;
  }

  /**
   * Observable that emits when the current application changes.
   *
   * Emits are deduplicated by `appKey`; re-setting the same app does not trigger
   * a new emission.
   */
  get current$(): Observable<CurrentApp | null> {
    return this.#current$.pipe(
      distinctUntilChanged((prev, next) => {
        if (prev && next) {
          return prev.appKey === next.appKey;
        }
        return prev === next;
      }),
    );
  }

  /**
   * Creates the app module provider.
   *
   * @param args - Object containing the resolved {@link AppModuleConfig} and an
   *   optional {@link EventModule} instance for dispatching lifecycle events.
   */
  constructor(args: { config: AppModuleConfig; event?: ModuleType<EventModule> }) {
    const { event, config } = args;

    this.#appClient = config.client;
    this.#event = event;

    this.#current$ = new BehaviorSubject<CurrentApp>(undefined);

    this.#appBaseUri = config.assetUri ?? '';

    this.#subscription.add(
      this.current$
        .pipe(
          pairwise(),
          takeWhile(() => !!event),
        )
        .subscribe(([previous, next]) => {
          event?.dispatchEvent('onCurrentAppChanged', {
            source: this,
            detail: { previous, next },
          });
        }),
    );

    this.#subscription.add(
      this.#current$
        .pipe(
          pairwise(),
          map(([previous]) => previous),
          filterEmpty(),
        )
        .subscribe((app) => app.dispose()),
    );
  }

  /**
   * Fetches the manifest for a single application by key.
   *
   * @param appKey - Unique application identifier.
   * @param tag - Optional version tag (defaults to latest).
   * @returns An observable that emits the resolved {@link AppManifest}.
   */
  public getAppManifest(appKey: string, tag?: string): Observable<AppManifest> {
    return from(this.#appClient.getAppManifest({ appKey, tag }));
  }

  /**
   * Fetches manifests for all registered applications.
   *
   * @param filter - Optional filter; set `filterByCurrentUser` to `true` to scope
   *   results to apps accessible by the authenticated user.
   * @returns An observable that emits an array of {@link AppManifest} objects.
   */
  public getAppManifests(filter?: { filterByCurrentUser: boolean }): Observable<AppManifest[]> {
    return from(this.#appClient.getAppManifests(filter));
  }

  /**
   * fetch all applications
   * @deprecated use `getAppManifests` instead
   */
  public getAllAppManifests(): Observable<AppManifest[]> {
    return this.getAppManifests();
  }

  /**
   * Fetches the runtime configuration for an application.
   *
   * @template TType - Shape of the `environment` record in the returned config.
   * @param appKey - Unique application identifier.
   * @param tag - Optional version tag.
   * @returns An observable that emits the resolved {@link AppConfig}.
   */
  public getAppConfig<TType extends ConfigEnvironment = ConfigEnvironment>(
    appKey: string,
    tag?: string,
  ): Observable<AppConfig<TType>> {
    return from(this.#appClient.getAppConfig<TType>({ appKey, tag }));
  }

  /**
   * Fetches per-user settings for an application.
   *
   * @param appKey - Unique application identifier.
   * @returns An observable that emits the {@link AppSettings} record.
   */
  public getAppSettings(appKey: string): Observable<AppSettings> {
    return from(this.#appClient.getAppSettings({ appKey }));
  }

  /**
   * Persists updated per-user settings for an application.
   *
   * @param appKey - Unique application identifier.
   * @param settings - The settings record to save.
   * @returns An observable that emits the persisted {@link AppSettings}.
   */
  public updateAppSettings(appKey: string, settings: AppSettings): Observable<AppSettings> {
    return from(this.#appClient.updateAppSettings({ appKey, settings }));
  }

  /**
   * Sets the current active application.
   *
   * Accepts an app key string, an {@link IApp} instance, or an {@link AppReference}
   * with both `appKey` and `tag`. Setting a new app disposes the previous one.
   *
   * @param appKeyOrApp - Application key, app reference, or an existing `IApp` instance.
   */
  public setCurrentApp(appKeyOrApp: string | IApp | AppReference): void {
    if (typeof appKeyOrApp === 'string') {
      const newApp = new App({ appKey: appKeyOrApp }, { provider: this, event: this.#event });
      this.#current$.next(newApp as CurrentApp);
      return;
    }

    if (appKeyOrApp.appKey && 'tag' in appKeyOrApp) {
      const newApp = new App(
        { appKey: appKeyOrApp.appKey, tag: appKeyOrApp.tag },
        { provider: this, event: this.#event },
      );
      this.#current$.next(newApp as CurrentApp);
      return;
    }

    this.#current$.next(appKeyOrApp as CurrentApp);
  }

  /**
   * Clears the current application, disposing its resources and emitting `null`
   * on {@link current$}.
   */
  public clearCurrentApp(): void {
    this.#current$.next(null);
  }

  /**
   * Base URI used for proxying application script imports.
   */
  public get assetUri(): string {
    return this.#appBaseUri;
  }

  /**
   * This should not be used, only for legacy creation backdoor
   * @deprecated
   */
  public createApp(value: AppBundleStateInitial): App {
    console.warn('AppModuleProvider.createApp is deprecated and should not be used.');
    return new App(value, { provider: this, event: this.#event });
  }

  /**
   * Tears down the provider, unsubscribing from all internal observables.
   */
  public dispose() {
    this.#subscription.unsubscribe();
  }
}

export default AppModuleProvider;
