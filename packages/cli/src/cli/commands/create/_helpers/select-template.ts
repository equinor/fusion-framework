import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { ProjectTemplate } from '../../../../bin/helpers/ProjectTemplate.js';
import { assert } from '../../../../lib/utils/assert.js';

/**
 * Selects a template from the available templates with intelligent fallback logic.
 * 
 * This function handles three scenarios:
 * 1. Pre-selected template: Returns the specified template if valid
 * 2. Single template: Automatically selects if only one template is available
 * 3. Multiple templates: Prompts user to choose from a list
 * 
 * @param templates - Array of available project templates
 * @param preSelectedTemplate - Optional pre-selected template name from CLI option
 * @param logger - Optional logger instance for debug output
 * @returns Promise resolving to the selected template
 * @throws {AssertionError} If templates array is empty or pre-selected template is invalid
 * 
 * @example
 * ```typescript
 * const templates = await repo.getAvailableTemplates();
 * const selected = await selectTemplate(templates, 'react-app', logger);
 * ```
 */
export async function selectTemplate(
  templates: ProjectTemplate[],
  preSelectedTemplate?: string,
  logger?: ConsoleLogger,
): Promise<ProjectTemplate> {
  assert(Array.isArray(templates), 'Templates must be an array');
  assert(templates.length > 0, 'No templates available');

  const templateNames = templates.map((t) => t.name);

  if (preSelectedTemplate) {
    assert(typeof preSelectedTemplate === 'string', 'Pre-selected template must be a string');
    assert(
      templateNames.includes(preSelectedTemplate),
      'Pre-selected template must be in the list of available templates',
    );

    logger?.debug(`Using pre-selected template: ${preSelectedTemplate}`);

    const selectedTemplate = templates.find((t) => t.name === preSelectedTemplate);
    assert(selectedTemplate, 'Pre-selected template not found');
    return selectedTemplate;
  }

  if (templates.length === 1) {
    logger?.debug(`Using single template: ${templates[0].name}`);
    return templates[0];
  }

  const { selectedTemplate } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTemplate',
      message: '🎨 Please select a template:',
      choices: templates.map((template) => ({
        name: `${template.name} - ${template.description}`,
        value: template,
      })),
      pageSize: 10,
      loop: false,
    },
  ]);

  return selectedTemplate;
}

export default selectTemplate;
