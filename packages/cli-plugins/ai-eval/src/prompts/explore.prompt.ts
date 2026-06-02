import type { ChatMessage } from '@equinor/fusion-framework-module-ai/lib';
import type { PlanStep } from '../types.js';

/**
 * Builds the Explorer system message for a single plan step.
 *
 * The Explorer is a tool-calling agent that drives `agent-browser` to navigate
 * the application and collect evidence. It should NOT make judgments about
 * whether the criterion is met — that is the Judge's job. The Explorer's only
 * responsibility is to collect the best possible evidence: DOM snapshot and
 * screenshot.
 *
 * @param step - The plan step to collect evidence for.
 * @param appUrl - Base URL of the running application.
 * @returns A two-element tuple: [system message, user message].
 */
export function buildExploreMessages(step: PlanStep, appUrl: string): [ChatMessage, ChatMessage] {
  const routeHint = step.route
    ? `\nThe likely starting route for this step is: ${appUrl}${step.route}`
    : `\nStart from the application base URL: ${appUrl}`;

  const system: ChatMessage = {
    role: 'system',
    content: `You are a browser interaction agent. The page has already been navigated to and loaded.

Fusion Framework context:
Applications run inside a dev-portal shell. The portal provides the outer chrome (header, navigation bar, sidebar, bookmarks panel). The actual application under test is mounted inside a <main data-app-key="..."> element. Treat everything inside that element as the app; treat everything outside it as portal infrastructure that is irrelevant to the test.

Your job: interact with the page if the step requires it, then collect targeted evidence for the criteria.

Available tools for evidence collection:
- browser_get_styles <selector>  — computed CSS for any element (use for color, layout checks)
- browser_get_text <selector>    — exact visible text of an element
- browser_is <state> <selector>  — check if element is visible/enabled/checked
- browser_get_html <selector>    — raw HTML of an element
- browser_errors                 — JavaScript console errors on the page
- browser_console                — all console output (log/warn/error/info)
- browser_eval_js <expression>   — arbitrary JS evaluation
- browser_snapshot               — full accessibility tree (use when selector is unknown)
- browser_click / browser_fill   — interact with the page if the step requires it

Rules:
1. The page is already loaded. Do NOT call browser_navigate or browser_wait.
2. Scope all selectors inside the app boundary: use "main[data-app-key] h1", "main[data-app-key] div", etc. Ignore portal chrome outside that element.
3. Use the most precise tool for each criterion. Prefer browser_get_styles for color/visual checks, browser_get_text for text checks, browser_errors for error checks.
4. Collect evidence for every criterion in the step description.
5. Do NOT take screenshots — that is handled automatically.
6. Do NOT make judgments. Just collect and return evidence.

Application URL: ${appUrl}${routeHint}`,
  };

  const user: ChatMessage = {
    role: 'user',
    content: `Collect evidence for this test step. The page is already loaded.

Criterion: ${step.criterion}
Instruction: ${step.description}

Use the available tools to gather precise evidence for every part of the criterion. The snapshot and screenshot are taken automatically — focus on targeted checks (styles, text, errors) that the snapshot alone cannot answer.`,
  };

  return [system, user];
}
