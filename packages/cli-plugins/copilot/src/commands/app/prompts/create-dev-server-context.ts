import type { RuntimeExecutionContext } from '../types.js';

/**
 * Creates the Fusion dev-server–specific system prompt supplement.
 *
 * Describes the DOM structure of a Fusion Framework application served
 * by the local dev server / dev-portal so the agent knows where to
 * find app content in the page.
 *
 * @param ctx - Runtime context with the application URL
 * @returns The dev-server DOM context block to append to the system prompt
 */
export const createDevServerContext = (ctx: RuntimeExecutionContext): string => {
  return `
Fusion dev-server DOM:
- App content lives inside <section id="app-section" style="display:contents">.
- While loading, #app-section contains an EquinorLoader spinner — wait for it to disappear.
- Once loaded, the app renders in an anonymous <div> child of #app-section.
- Target #app-section for assertions, not <body>.
- URL pattern: /apps/{appKey} → ${ctx.url}
  `.trim();
};
