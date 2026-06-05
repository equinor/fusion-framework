import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationPluginArgs } from '../plugin';

import { activeAppNavigationEvents$ } from '../operators/active-app-navigation-events';

describe('activeAppNavigationEvents$', () => {
  it('emits when app, instance, and navigation state are all present', () => {
    const appModules = { context: {} } as unknown as AppModulesInstance<[ContextModule]>;
    const navigationState$ = new Subject<unknown>();

    const currentApp$ = new BehaviorSubject({
      appKey: 'my-app',
      instance$: new BehaviorSubject(appModules),
    });

    const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
    const navigation = {
      state$: navigationState$,
    } as unknown as ContextNavigationPluginArgs['navigation'];

    const emissions: unknown[] = [];
    const sub = activeAppNavigationEvents$(app, navigation).subscribe((val) => emissions.push(val));

    navigationState$.next({});

    expect(emissions).toHaveLength(1);
    expect(emissions[0]).toEqual({ appKey: 'my-app', appModules });

    sub.unsubscribe();
  });

  it('does not emit when currentApp is null', () => {
    const navigationState$ = new Subject<unknown>();
    const currentApp$ = new BehaviorSubject(null);

    const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
    const navigation = {
      state$: navigationState$,
    } as unknown as ContextNavigationPluginArgs['navigation'];

    const emissions: unknown[] = [];
    const sub = activeAppNavigationEvents$(app, navigation).subscribe((val) => emissions.push(val));

    navigationState$.next({});

    expect(emissions).toHaveLength(0);
    sub.unsubscribe();
  });

  it('does not emit when app instance is null', () => {
    const navigationState$ = new Subject<unknown>();
    const currentApp$ = new BehaviorSubject({
      appKey: 'my-app',
      instance$: new BehaviorSubject(null),
    });

    const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
    const navigation = {
      state$: navigationState$,
    } as unknown as ContextNavigationPluginArgs['navigation'];

    const emissions: unknown[] = [];
    const sub = activeAppNavigationEvents$(app, navigation).subscribe((val) => emissions.push(val));

    navigationState$.next({});

    expect(emissions).toHaveLength(0);
    sub.unsubscribe();
  });

  it('re-emits on each navigation state change', () => {
    const appModules = { context: {} } as unknown as AppModulesInstance<[ContextModule]>;
    const navigationState$ = new Subject<unknown>();

    const currentApp$ = new BehaviorSubject({
      appKey: 'my-app',
      instance$: new BehaviorSubject(appModules),
    });

    const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
    const navigation = {
      state$: navigationState$,
    } as unknown as ContextNavigationPluginArgs['navigation'];

    const emissions: unknown[] = [];
    const sub = activeAppNavigationEvents$(app, navigation).subscribe((val) => emissions.push(val));

    navigationState$.next({});
    navigationState$.next({});
    navigationState$.next({});

    expect(emissions).toHaveLength(3);
    sub.unsubscribe();
  });

  it('switches to new app when current app changes', () => {
    const appModulesA = { context: { name: 'A' } } as unknown as AppModulesInstance<
      [ContextModule]
    >;
    const appModulesB = { context: { name: 'B' } } as unknown as AppModulesInstance<
      [ContextModule]
    >;
    const navigationState$ = new Subject<unknown>();

    const currentApp$ = new BehaviorSubject<unknown>({
      appKey: 'app-a',
      instance$: new BehaviorSubject(appModulesA),
    });

    const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
    const navigation = {
      state$: navigationState$,
    } as unknown as ContextNavigationPluginArgs['navigation'];

    const emissions: Array<{ appKey: string }> = [];
    const sub = activeAppNavigationEvents$(app, navigation).subscribe((val) => emissions.push(val));

    navigationState$.next({});
    expect(emissions[0]?.appKey).toBe('app-a');

    currentApp$.next({ appKey: 'app-b', instance$: new BehaviorSubject(appModulesB) });
    navigationState$.next({});
    expect(emissions[1]?.appKey).toBe('app-b');

    sub.unsubscribe();
  });
});
