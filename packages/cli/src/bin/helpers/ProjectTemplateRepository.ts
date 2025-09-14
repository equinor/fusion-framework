import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ResetMode, simpleGit, type SimpleGit } from 'simple-git';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import assert from 'node:assert';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { ProjectTemplate } from './ProjectTemplate.js';
import { parseTemplatesManifest } from './project-templates.schema.js';

export type GitClientProtocol = 'https' | 'ssh';

export class ProjectTemplateRepository {
  #initialized = false;
  #git: SimpleGit;
  #baseDir: string;
  #log?: ConsoleLogger;
  #protocol: GitClientProtocol;
  #branch: string;

  public get protocol(): 'https' | 'ssh' {
    return this.#protocol;
  }

  public set protocol(protocol: GitClientProtocol) {
    assert(protocol === 'https' || protocol === 'ssh', 'Protocol must be either https or ssh');
    this.#protocol = protocol;
  }

  public get branch(): string {
    return this.#branch;
  }

  public set branch(branch: string) {
    this.#branch = branch;
    if (this.#initialized) {
      this._checkoutBranch();
    }
  }

  constructor(
    public readonly repo: string,
    options: {
      baseDir?: string;
      log?: ConsoleLogger;
      protocol?: GitClientProtocol;
      branch?: string;
    },
  ) {
    this.#baseDir = options.baseDir ?? join(tmpdir(), 'ffc', 'repo', repo);
    this.#git = simpleGit({ baseDir: this.#baseDir });
    this.#log = options.log;
    this.#protocol =
      (options.protocol ?? !!this.#git.getConfig('core.sshCommand')) ? 'ssh' : 'https';
    this.#branch = options.branch ?? 'main';
  }

  async initialize(): Promise<void> {
    if (this.#initialized) {
      return;
    }

    this._setupOutputHandler();

    try {
      this.#log?.debug('Checking if repository directory exists...', this.#baseDir);
      if (!existsSync(this.#baseDir)) {
        this.#log?.info('Repository directory does not exist, creating...');
        mkdirSync(this.#baseDir, { recursive: true });
        this.#log?.succeed('Repository directory created successfully!');
      }
      this.#log?.debug('Checking if repository is initialized...');
      const isRepo = await this.#git.checkIsRepo();
      if (!isRepo) {
        this.#log?.info('Git is not initialized, cloning repo...');
        await this._cloneRepo();
        this.#log?.succeed('Repo cloned successfully!');
      } else {
        this.#log?.info('Git is initialized, checking out branch...');
        await this._checkoutBranch();
        this.#log?.succeed('Branch checked out successfully!');
      }
      this.#log?.succeed('Repository initialized successfully!');
      this.#initialized = true;
    } catch (error) {
      this.#log?.fail('Repository initialization failed!');
      this.#log?.error(error);
      throw error;
    }
  }

  async getAvailableTemplates(): Promise<ProjectTemplate[]> {
    let templatesRaw: string;
    try {
      const templatesJsonPath = join(this.#baseDir, 'templates.json');
      // read the templates.json file from the root of the repository
      this.#log?.debug('Reading temaplate manifest file...', templatesJsonPath);
      templatesRaw = readFileSync(templatesJsonPath, 'utf8');
    } catch (cause) {
      throw new Error('Failed to read templates.json file from the root of the repository...', {
        cause,
      });
    }
    try {
      this.#log?.debug('Parsing and validating template content...');
      const manifest = parseTemplatesManifest(templatesRaw);
      this.#log?.debug('Parsed template content...', manifest);
      const templateItems = manifest.templates.map((template) => {
        const resources = [...(manifest.resources ?? []), ...template.resources];
        return new ProjectTemplate({ ...template, resources }, this.#baseDir, { logger: this.#log });
      });
      return templateItems;
    } catch (cause) {
      throw new Error('Failed to parse templates.json content', {
        cause,
      });
    }
  }

  /**
   * Clean up the repository directory by removing it from the filesystem.
   * This is useful for cleaning up temporary template repositories.
   * 
   * @returns Promise resolving to true if cleanup was performed, false if failed
   */
  async cleanup(): Promise<boolean> {
    try {
      this.#log?.debug(`Removing repository directory: ${this.#baseDir}`);
      rmSync(this.#baseDir, { recursive: true, force: true });
      this.#log?.succeed('Repository directory cleaned up successfully!');
      
      // Reset initialization state since directory is removed
      this.#initialized = false;
      return true;
    } catch (error) {
      this.#log?.error(`Failed to remove repository directory: ${this.#baseDir}`, error);
      return false;
    }
  }

  async _cloneRepo(): Promise<void> {
    try {
      this.#log?.debug('Cloning repo...', {
        repo: this.repo,
        baseDir: this.#baseDir,
        branch: this.#branch,
      });
      await this.#git.clone(this.repo, this.#baseDir, [
        '--single-branch',
        '--branch',
        this.#branch,
      ]);
    } catch (cause) {
      throw new Error('Failed to clone repo...', { cause });
    }
  }

  async _checkoutBranch(): Promise<void> {
    try {
      this.#log?.debug('Fetching repo...', this.repo);
      await this.#git.fetch();
      this.#log?.debug('Checking out branch...', this.#branch);
      const response = await this.#git.checkout(this.#branch);
      if (response.includes('branch is up to date')) {
        this.#log?.debug('Branch is up to date!');
      } else {
        this.#log?.info('Branch is not up to date, updating to latest changes...');
        await this.#git.reset(ResetMode.HARD).pull();
        this.#log?.debug('Branch updated successfully!');
      }
    } catch (cause) {
      throw new Error('Failed to checkout branch...', { cause });
    }
  }

  _setupOutputHandler(): void {
    this.#git.outputHandler((_command, stdout, stderr): void => {
      stdout.on('data', (data) => {
        this.#log?.debug('🐙', String(data));
      });
      stderr.on('data', (data) => {
        this.#log?.error('🐙', String(data));
      });
    });
  }
}
