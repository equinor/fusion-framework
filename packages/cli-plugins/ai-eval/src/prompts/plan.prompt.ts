import type { ChatMessage } from '@equinor/fusion-framework-module-ai/lib';

/**
 * Builds the Planner message pair from a user story Markdown string.
 *
 * The Planner extracts Given/When/Then scenarios from the `## Scenarios`
 * section of the story and returns a structured {@link Plan}. The messages
 * returned here are passed to `model.llm.withStructuredOutput(PlanSchema)`.
 *
 * @param storyMarkdown - Raw Markdown content of the eval user story file.
 * @returns A two-element tuple: [system message, user message].
 */
export function buildPlanMessages(storyMarkdown: string): [ChatMessage, ChatMessage] {
  const system: ChatMessage = {
    role: 'system',
    content: `You are a test planning agent for a Fusion Framework web application.

Your task is to read a user story written in Markdown and extract a structured test plan.

Rules:
1. Extract the persona from the "As a..." line in the ## Story section.
2. Extract the goal from the "I want to..." line in the ## Story section.
3. Extract each scenario from the ## Scenarios section. Each scenario is a checkbox line beginning with "- [ ]" and containing Given/When/Then text.
4. GROUP scenarios that can be verified on the same page/route into a SINGLE plan step.
   - If all scenarios require only navigating to the same URL and observing the result, produce ONE step.
   - Only create separate steps when different navigation or interaction is required (e.g. clicking a button to reach a new state, navigating to a different route).
   - The criterion for a grouped step should summarise all the things to verify: e.g. "Heading reads X, background color is Y, and no console errors are present".
   - The description should list all the things the Explorer must check.
   - The route: your best guess at the app route — optional, leave empty if unknown.
   - visual: true if ANY grouped scenario requires visual inspection (colors, layout, images).
5. Use the ## Functional requirements and ## Context sections for additional context when interpreting ambiguous scenarios.
6. Do NOT include non-goals from the ## Non-goals section as steps.
7. Every scenario from ## Scenarios must be covered by at least one step — do not omit any.`,
  };

  const user: ChatMessage = {
    role: 'user',
    content: `Extract a structured test plan from this user story:\n\n${storyMarkdown}`,
  };

  return [system, user];
}
