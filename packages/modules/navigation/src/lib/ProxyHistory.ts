import { Subscription } from 'rxjs';
import type { Observable } from 'rxjs';

import type {
  History,
  NavigateOptions,
  NavigationBlocker,
  NavigationListener,
  NavigationUpdate,
  Path,
  To,
} from './types';
import type { Actions } from './state/history.actions';

/**
 * A lightweight proxy that delegates every {@link History} operation to an
 * underlying target instance.
 *
 * Use this when you need to pass a conforming `History` object whose backing
 * implementation can be swapped or is not yet available at construction time,
 * or when you want a thin indirection layer without subclassing
 * {@link BaseHistory}.
 *
 * The proxy does **not** own the underlying history; disposing it only tears
 * down subscriptions and blockers registered through the proxy itself.
 *
 * @example
 * ```ts
 * const browser = createHistory('browser');
 * const proxy = new ProxyHistory(browser);
 * proxy.push('/dashboard'); // delegates to browser.push
 * ```
 */
export class ProxyHistory implements History {
  /** The underlying history instance all calls are forwarded to. */
  readonly #target: History;

  /** Teardowns owned by this proxy, cleaned up on dispose. */
  readonly #teardowns = new Subscription();

  /**
   * @param target - The history instance to delegate all operations to
   */
  constructor(target: History) {
    this.#target = target;
  }

  /** @inheritdoc */
  get state$(): Observable<NavigationUpdate> {
    return this.#target.state$;
  }

  /** @inheritdoc */
  get action$(): Observable<Actions> {
    return this.#target.action$;
  }

  /** @inheritdoc */
  get action(): History['action'] {
    return this.#target.action;
  }

  /** @inheritdoc */
  get location(): History['location'] {
    return this.#target.location;
  }

  /** @inheritdoc */
  createHref(to: To): string {
    return this.#target.createHref(to);
  }

  /** @inheritdoc */
  createURL(to: To): URL {
    return this.#target.createURL(to);
  }

  /** @inheritdoc */
  encodeLocation(to: To): Path {
    return this.#target.encodeLocation(to);
  }

  /** @inheritdoc */
  push(to: To, state?: unknown): void {
    this.#target.push(to, state);
  }

  /** @inheritdoc */
  replace(to: To, state?: unknown): void {
    this.#target.replace(to, state);
  }

  /** @inheritdoc */
  navigate(to: To, options?: NavigateOptions): void {
    this.#target.navigate(to, options);
  }

  /** @inheritdoc */
  go(delta: number): void {
    this.#target.go(delta);
  }

  /** @inheritdoc */
  listen(listener: NavigationListener): () => void {
    const unlisten = this.#target.listen(listener);
    this.#teardowns.add(unlisten);
    return () => {
      unlisten();
      this.#teardowns.remove(unlisten);
    };
  }

  /** @inheritdoc */
  block(blocker: NavigationBlocker): VoidFunction {
    const unblock = this.#target.block(blocker);
    this.#teardowns.add(unblock);
    return () => {
      unblock();
      this.#teardowns.remove(unblock);
    };
  }

  /**
   * Disposes all listeners and blockers registered through this proxy.
   * Does **not** dispose the underlying history.
   */
  [Symbol.dispose](): void {
    this.#teardowns.unsubscribe();
  }
}
