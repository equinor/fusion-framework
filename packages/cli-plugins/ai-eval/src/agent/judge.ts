import type { IModel } from '@equinor/fusion-framework-module-ai/lib';
import type { AzureOpenAIModel } from '@equinor/fusion-framework-module-ai/azure';
import { type Proof, type Verdict, VerdictSchema } from '../types.js';
import { buildJudgeMessages } from '../prompts/judge.prompt.js';
import type { AgentOptions } from './types.js';

/**
 * Runs the Judge phase: evaluates all sanitised proofs against the user story
 * and returns a structured verdict.
 *
 * Uses `model.llm.withStructuredOutput(VerdictSchema)` to guarantee structured
 * JSON output. The Judge receives only {@link Proof} records — no tool call
 * history, no explorer observations.
 *
 * @param proofs - Sanitised proof records, one per plan step.
 * @param storyMarkdown - The original user story Markdown.
 * @param model - Initialized AI model instance (must be an `AzureOpenAIModel` at runtime).
 * @param options - Agent options (verbose, etc.).
 * @returns The validated {@link Verdict}.
 * @throws {Error} When the model returns output that fails Zod validation.
 */
export async function judge(
  proofs: Proof[],
  storyMarkdown: string,
  model: IModel,
  options: AgentOptions = {},
): Promise<Verdict> {
  if (options.verbose) {
    console.log(`\n⚖️  Judge: evaluating ${proofs.length} proof(s) against user story…`);
  }

  const messages = buildJudgeMessages(proofs, storyMarkdown);

  // Cast to AzureOpenAIModel to access the .llm getter for withStructuredOutput.
  const azureModel = model as unknown as AzureOpenAIModel;
  const structured = azureModel.llm.withStructuredOutput(VerdictSchema, {
    name: 'verdict',
    method: 'functionCalling',
  });

  const raw = await structured.invoke(messages);
  const verdict = VerdictSchema.parse(raw);

  if (options.verbose) {
    const icon = verdict.result === 'PASS' ? '✅' : verdict.result === 'FAIL' ? '❌' : '❓';
    console.log(`  ${icon} Verdict: ${verdict.result}`);
    console.log(`  ${verdict.summary}`);
  }

  return verdict;
}
