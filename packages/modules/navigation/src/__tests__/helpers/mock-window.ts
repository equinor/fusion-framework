import { vi } from 'vitest';

export interface MockWindowOptions {
  /** Initial pathname (default: '/') */
  pathname?: string;
  /** Initial search (default: '') */
  search?: string;
  /** Initial hash (default: '' for browser, '#/' for hash) */
  hash?: string;
  /** Origin (default: 'http://localhost') */
  origin?: string;
  /** Whether to include defaultView and document (default: true) */
  includeDefaultView?: boolean;
  /** Whether to spy on history methods (default: true) */
  spyHistory?: boolean;
  /** Whether to spy on event listeners (default: true) */
  spyEventListeners?: boolean;
}

/**
 * Creates a mock window object for testing.
 * Supports different configurations for browser history, hash history, etc.
 */
export function createMockWindow(options: MockWindowOptions = {}): Window {
  const {
    pathname = '/',
    search = '',
    hash = '',
    origin = 'http://localhost',
    includeDefaultView = true,
    spyHistory = true,
    spyEventListeners = true,
  } = options;

  const href = `${origin}${pathname}${search}${hash}`;

  const mockWindow = {
    location: {
      pathname,
      search,
      hash,
      origin,
      href,
    },
    history: {
      state: null,
      pushState: spyHistory ? vi.fn() : (() => {}),
      replaceState: spyHistory ? vi.fn() : (() => {}),
      go: spyHistory ? vi.fn() : (() => {}),
      length: 1,
    },
    addEventListener: spyEventListeners ? vi.fn() : (() => {}),
    removeEventListener: spyEventListeners ? vi.fn() : (() => {}),
    ...(includeDefaultView && {
      defaultView: null as Window | null,
      document: {
        defaultView: null as Window | null,
      },
    }),
  } as unknown as Window;

  if (includeDefaultView) {
    // @ts-expect-error - defaultView is not a property of Window
    mockWindow.defaultView = mockWindow;
    // @ts-expect-error - defaultView is not a property of Window
    mockWindow.document.defaultView = mockWindow;
  }

  return mockWindow;
}

/**
 * Creates a mock window for hash history tests.
 */
export function createMockHashWindow(options: Omit<MockWindowOptions, 'hash'> = {}): Window {
  return createMockWindow({
    hash: '#/',
    ...options,
  });
}

