import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { IModel } from '@equinor/fusion-framework-module-ai/lib';
import type { AzureOpenAIModel } from '@equinor/fusion-framework-module-ai/azure';
import { type Plan, PlanSchema } from '../types.js';
import { buildPlanMessages } from '../prompts/plan.prompt.js';
import type { AgentOptions } from './types.js';

/**
 * Runs the Planner phase: reads the user story and returns a structured plan.
 *
 * Uses `model.llm.withStructuredOutput(PlanSchema)` to guarantee the output
 * matches the Zod schema. The plan is returned to the caller who is responsible
 * for writing it to `plan.json`.
 *
 * @param storyMarkdown - Raw Markdown content of the eval user story file.
 * @param model - Initialized AI model instance (must be an `AzureOpenAIModel` at runtime).
 * @param options - Agent options (verbose, etc.).
 * @returns The validated {@link Plan}.
 * @throws {Error} When the model returns output that fails Zod validation.
 */
export async function plan(
  storyMarkdown: string,
  model: IModel,
  options: AgentOptions = {},
): Promise<Plan> {
  const [systemMsg, userMsg] = buildPlanMessages(storyMarkdown);

  if (options.verbose) {
    console.log('\n🧠 Planner: extracting plan from user story…');
  }

  // Cast to AzureOpenAIModel to access the .llm getter which exposes withStructuredOutput.
  // This is intentional: the POC targets Azure OpenAI exclusively.
  const azureModel = model as unknown as AzureOpenAIModel;
  const structured = azureModel.llm.withStructuredOutput(PlanSchema, {
    name: 'plan',
    method: 'functionCalling',
  });

  const messages = [
    new SystemMessage(systemMsg.content),
    new HumanMessage(userMsg.content),
  ];

  const raw = await structured.invoke(messages);
  const result = PlanSchema.parse(raw);

  if (options.verbose) {
    console.log(`  ✅ Plan extracted: ${result.steps.length} step(s) for persona "${result.persona}"`);
    for (const step of result.steps) {
      console.log(`    ${step.id}: ${step.criterion}`);
    }
  }

  return result;
}
