import { beforeEach } from 'vitest';

// Mock history and location
beforeEach(() => {
  // Reset history state
  window.history.pushState({}, '', '/');
  window.history.replaceState({}, '', '/');
});
