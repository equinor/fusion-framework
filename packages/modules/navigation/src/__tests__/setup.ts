import { beforeEach } from 'vitest'
import { vi } from 'vitest'

// Mock history and location
beforeEach(() => {
  // Reset history state
  window.history.pushState({}, '', '/')
  window.history.replaceState({}, '', '/')

  // Spy on history methods
//   vi.spyOn(window.history, 'pushState')
//   vi.spyOn(window.history, 'replaceState')
//   vi.spyOn(window.history, 'back')
//   vi.spyOn(window.history, 'forward')
//   vi.spyOn(window.history, 'go')
})