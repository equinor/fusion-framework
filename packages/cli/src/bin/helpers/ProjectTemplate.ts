import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { TemplateResource, TemplateItem } from './project-templates.schema.js';
import { copyFileSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Represents a template for creating Fusion Framework applications.
 * 
 * This class encapsulates a project template definition and provides methods
 * for copying template resources to a target directory. Templates are defined
 * in the templates.json manifest and can include files, directories, and other
 * resources that make up a complete project structure.
 * 
 * @example
 * ```typescript
 * const template = new ProjectTemplate(templateItem, '/path/to/source', { logger });
 * template.copyTo('/path/to/target');
 * ```
 */
export class ProjectTemplate {
  #item: TemplateItem;
  #logger?: ConsoleLogger;
  #source: string;

  /**
   * The name of the template as defined in the manifest.
   * Used for template identification and selection.
   */
  public get name(): string {
    return this.#item.name;
  }

  /**
   * The description of the template as defined in the manifest.
   * Provides human-readable information about what the template creates.
   */
  public get description(): string {
    return this.#item.description;
  }

  /**
   * The resources included in this template.
   * Each resource defines a file or directory to be copied to the target.
   */
  public get resources(): TemplateResource[] {
    return this.#item.resources;
  }

  /**
   * Creates a new ProjectTemplate instance.
   * 
   * @param item - The template item definition from the manifest
   * @param source - The source directory path where template files are located
   * @param options - Configuration options including optional logger
   */
  constructor(item: TemplateItem, source: string, options: { logger?: ConsoleLogger }) {
    this.#item = item;
    this.#source = source;
    this.#logger = options.logger;
  }

  /**
   * Copies all template resources to the specified target directory.
   * 
   * This method iterates through all resources defined in the template and copies
   * them to the target directory. Files are copied using copyFileSync, while
   * directories are copied using cpSync with optional recursive copying.
   * 
   * @param targetDir - The target directory where resources should be copied
   * @throws {Error} If any resource fails to copy
   * 
   * @example
   * ```typescript
   * const template = new ProjectTemplate(templateItem, '/source', { logger });
   * template.copyTo('/path/to/new/project');
   * ```
   */
  copyTo(targetDir: string): void {
    this.#logger?.debug(`Copying template resources to ${targetDir}`);
    
    // Process each resource defined in the template
    for (const resource of this.#item.resources) {
      this.#logger?.debug(`Copying resource ${resource.path}`, { resource });
      
      // Build source and target paths
      const sourcePath = join(this.#source, resource.path);
      const targetPath = join(targetDir, resource.target ?? resource.path);
      
      // Verify source exists before attempting to copy
      if (!existsSync(sourcePath)) {
        this.#logger?.warn(`Source resource does not exist, skipping: ${sourcePath}`);
        continue;
      }
      
      try {
        // Handle different resource types
        if (resource.type === 'file') {
          copyFileSync(sourcePath, targetPath);
          this.#logger?.debug(`Copied file: ${resource.path} -> ${targetPath}`);
        } else if (resource.type === 'dir') {
          cpSync(sourcePath, targetPath, { recursive: resource.recursive ?? false });
          this.#logger?.debug(`Copied directory: ${resource.path} -> ${targetPath}`);
        } else {
          this.#logger?.debug('Resource is not a file or directory, skipping', { resource });
        }
      } catch (error) {
        this.#logger?.error(`Failed to copy resource ${resource.path}:`, error);
        throw error;
      }
    }
  }
}
