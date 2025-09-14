import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { TemplateResource, TemplateItem } from './project-templates.schema.js';
import { copyFileSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Represents a template for creating Fusion Framework applications
 */
export class ProjectTemplate {
  #item: TemplateItem;
  #logger?: ConsoleLogger;
  #source: string;

  /** The name of the template */
  public get name(): string {
    return this.#item.name;
  }

  /** The description of the template */
  public get description(): string {
    return this.#item.description;
  }

  /** The resources included in this template */
  public get resources(): TemplateResource[] {
    return this.#item.resources;
  }

  constructor(item: TemplateItem, source: string, options: { logger?: ConsoleLogger }) {
    this.#item = item;
    this.#source = source;
    this.#logger = options.logger;
  }

  copyTo(targetDir: string): void {
    this.#logger?.debug(`Copying template resources to ${targetDir}`);
    for (const resource of this.#item.resources) {
      this.#logger?.debug(`Copying resource ${resource.path}`, { resource });
      
      const sourcePath = join(this.#source, resource.path);
      const targetPath = join(targetDir, resource.target ?? resource.path);
      
      // Check if source exists before attempting to copy
      if (!existsSync(sourcePath)) {
        this.#logger?.warn(`Source resource does not exist, skipping: ${sourcePath}`);
        continue;
      }
      
      try {
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
