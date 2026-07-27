import { ab } from './agent-browser.js';

/**
 * Clears the MSAL `interaction.status` flag from `sessionStorage` in the
 * running browser via `agent-browser eval`.
 */
export function clearMsalInteraction(): void {
  try {
    ab(['eval', 'sessionStorage.removeItem("msal.interaction.status")'], 5_000);
  } catch {
    // Browser may not be ready yet — non-fatal
  }
}
