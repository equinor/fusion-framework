/** An app registered with Octopus. */
export interface RegisteredApp {
  appKey: string;
  /** Where the app's dev server runs, e.g. `http://localhost:5173`. */
  url: string;
  /** Mock server the app's own dev page uses, when the app runs in mock mode. */
  mockUrl?: string;
  /** Identifies the dev server process, so one process cannot remove another's entry. */
  instanceId: string;
  /** When the dev server started; the most recently started one is active. */
  startedAt: number;
  /** When the dev server first registered, in milliseconds since the epoch. */
  registeredAt: number;
  /** When the dev server last registered or sent a heartbeat. */
  lastSeen: number;
}

/** What an app sends when it registers or renews its entry. */
export interface Registration {
  url: string;
  mockUrl?: string;
  instanceId: string;
  /** When the dev server started. Defaults to when it first registered. */
  startedAt?: number;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Checks that an address points at this machine, since Octopus only proxies to local dev servers.
 *
 * @param url - Address to check.
 * @returns The parsed URL, or `undefined` when it is invalid or not local.
 */
export const parseLocalUrl = (url: unknown): URL | undefined => {
  if (typeof url !== 'string') {
    return undefined;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' && LOCAL_HOSTS.has(parsed.hostname) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Gets the port of an HTTP address. `URL` leaves the port empty when it is the protocol's
 * default, so `http://localhost` and `http://localhost:80` both give 80.
 *
 * @param url - An `http:` address, as accepted by {@link parseLocalUrl}.
 * @returns The port number.
 */
export const portOf = (url: URL): number => Number(url.port || 80);

/**
 * Keeps track of which apps are served where.
 *
 * An app key can have several dev servers at once, e.g. a normal one and one in mock mode. The
 * one that started last is active, also after Octopus restarts and they register again in any
 * order; heartbeats only keep the others alive. When the active one stops, the next most recent
 * takes over.
 */
export class Registry {
  readonly #instances = new Map<string, Map<string, RegisteredApp>>();
  // Dev server processes removed by hand; their heartbeats are refused until they restart.
  readonly #blocked = new Set<string>();
  // Orders registrations made within the same millisecond.
  #sequence = 0;
  readonly #order = new Map<string, number>();
  readonly #now: () => number;

  /**
   * @param now - Current time; replaceable in tests.
   */
  constructor(now: () => number = Date.now) {
    this.#now = now;
  }

  /**
   * Registers a dev server, or renews its entry. A newly registered dev server becomes the
   * active one for its app key.
   *
   * @param appKey - App being served.
   * @param registration - Where it is served, and by which process.
   * @returns The entry; whether it is new rather than a heartbeat; and the previously active
   *   entry, when this registration took over from another dev server.
   */
  register(
    appKey: string,
    { url, mockUrl, instanceId, startedAt }: Registration,
  ): { app: RegisteredApp; created: boolean; replaced?: RegisteredApp } {
    const now = this.#now();
    const previous = this.get(appKey);
    const instances = this.#instances.get(appKey) ?? new Map<string, RegisteredApp>();
    const existing = instances.get(instanceId);

    const app: RegisteredApp = {
      appKey,
      url,
      ...(mockUrl ? { mockUrl } : {}),
      instanceId,
      startedAt: existing?.startedAt ?? startedAt ?? now,
      registeredAt: existing?.registeredAt ?? now,
      lastSeen: now,
    };
    instances.set(instanceId, app);
    this.#instances.set(appKey, instances);
    if (!existing) {
      this.#order.set(instanceId, ++this.#sequence);
    }

    const active = this.get(appKey);
    const replaced =
      previous && previous.instanceId !== active?.instanceId && active?.instanceId === instanceId
        ? previous
        : undefined;
    return { app, created: !existing, replaced };
  }

  /**
   * Removes one dev server's entry, or every entry of the app when no instance is given.
   *
   * @param appKey - App to remove.
   * @param instanceId - When given, only removes this process's entry.
   * @returns The removed active entry, or `undefined` when nothing was removed.
   */
  unregister(appKey: string, instanceId?: string): RegisteredApp | undefined {
    const instances = this.#instances.get(appKey);
    if (!instances) {
      return undefined;
    }
    if (instanceId === undefined) {
      const active = this.get(appKey);
      this.#instances.delete(appKey);
      return active;
    }
    const removed = instances.get(instanceId);
    instances.delete(instanceId);
    if (instances.size === 0) {
      this.#instances.delete(appKey);
    }
    return removed;
  }

  /**
   * Removes an app by hand: every dev server serving it, and refuses their further
   * registrations, so the app stays unregistered until they restart.
   *
   * @param appKey - App to remove.
   * @returns The removed active entry, or `undefined` when the app was not registered.
   */
  block(appKey: string): RegisteredApp | undefined {
    for (const { instanceId } of this.#instances.get(appKey)?.values() ?? []) {
      this.#blocked.add(instanceId);
    }
    return this.unregister(appKey);
  }

  /**
   * Checks whether a dev server process was unregistered by hand.
   *
   * @param instanceId - Dev server process.
   * @returns `true` when its registrations are refused.
   */
  isBlocked(instanceId: string): boolean {
    return this.#blocked.has(instanceId);
  }

  /**
   * Gets the active dev server for an app: the one that started last.
   *
   * @param appKey - App to look up.
   * @returns The entry, or `undefined` when the app is not registered.
   */
  get(appKey: string): RegisteredApp | undefined {
    let active: RegisteredApp | undefined;
    for (const app of this.#instances.get(appKey)?.values() ?? []) {
      if (!active || this.#isNewer(app, active)) {
        active = app;
      }
    }
    return active;
  }

  /**
   * Lists the active dev server of each app.
   *
   * @returns Entries sorted by app key.
   */
  list(): RegisteredApp[] {
    return [...this.#instances.keys()]
      .map((appKey) => this.get(appKey) as RegisteredApp)
      .sort((a, b) => a.appKey.localeCompare(b.appKey));
  }

  /**
   * Lists every dev server, including those standing by behind a more recent one.
   *
   * @returns All entries.
   */
  instances(): RegisteredApp[] {
    return [...this.#instances.values()].flatMap((instances) => [...instances.values()]);
  }

  /**
   * Lists dev servers that have not sent a heartbeat for a while, e.g. after a crash.
   *
   * @param ttlMs - How long an entry lives without a heartbeat.
   * @returns The stale entries.
   */
  stale(ttlMs: number): RegisteredApp[] {
    const cutoff = this.#now() - ttlMs;
    return this.instances().filter(({ lastSeen }) => lastSeen < cutoff);
  }

  /**
   * Removes dev servers that have not sent a heartbeat for a while, e.g. after a crash.
   *
   * @param ttlMs - How long an entry lives without a heartbeat.
   * @returns The removed entries.
   */
  expire(ttlMs: number): RegisteredApp[] {
    const expired = this.stale(ttlMs);
    for (const { appKey, instanceId } of expired) {
      this.unregister(appKey, instanceId);
    }
    return expired;
  }

  #isNewer(app: RegisteredApp, other: RegisteredApp): boolean {
    if (app.startedAt !== other.startedAt) {
      return app.startedAt > other.startedAt;
    }
    return (this.#order.get(app.instanceId) ?? 0) > (this.#order.get(other.instanceId) ?? 0);
  }
}
