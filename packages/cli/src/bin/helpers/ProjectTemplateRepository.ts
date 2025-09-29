import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ResetMode, simpleGit, type SimpleGit } from 'simple-git';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import assert from 'node:assert';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { ProjectTemplate } from './ProjectTemplate.js';
import { parseTemplatesManifest } from './project-templates.schema.js';
import { validateSafePath, safeRmSync } from '../../lib/utils/path-security.js';

/**
 * Git protocol options for repository operations.
 * Supports both HTTPS and SSH authentication methods.
 */
export type GitClientProtocol = 'https' | 'ssh';

/**
 * Manages a Git repository containing project templates.
 *
 * This class handles cloning, updating, and managing a template repository
 * that contains project templates defined in a templates.json manifest.
 * It provides methods for initializing the repository, fetching templates,
 * and cleaning up temporary files.
 *
 * @example
 * ```typescript
 * const repo = new ProjectTemplateRepository('equinor/fusion-app-template', {
 *   baseDir: '/tmp/templates',
 *   log: logger,
 *   protocol: 'https',
 *   branch: 'main'
 * });
 * await repo.initialize();
 * const templates = await repo.getAvailableTemplates();
 * ```
 */
export class ProjectTemplateRepository {
  #initialized = false;
  #git: SimpleGit;
  #baseDir: string;
  #log?: ConsoleLogger;
  #protocol: GitClientProtocol;
  #branch: string;

  /**
   * Gets the current Git protocol being used for repository operations.
   * @returns The current protocol ('https' or 'ssh')
   */
  public get protocol(): 'https' | 'ssh' {
    return this.#protocol;
  }

  /**
   * Sets the Git protocol for repository operations.
   * @param protocol - The protocol to use ('https' or 'ssh')
   * @throws {AssertionError} If protocol is not 'https' or 'ssh'
   */
  public set protocol(protocol: GitClientProtocol) {
    assert(protocol === 'https' || protocol === 'ssh', 'Protocol must be either https or ssh');
    this.#protocol = protocol;
  }

  /**
   * Gets the current branch being used for repository operations.
   * @returns The current branch name
   */
  public get branch(): string {
    return this.#branch;
  }

  /**
   * Gets the full GitHub URL for the repository based on the current protocol.
   * @returns The complete GitHub URL (HTTPS or SSH format)
   */
  private get repoUrl(): string {
    return this.#protocol === 'ssh'
      ? `git@github.com:${this.repo}.git`
      : `https://github.com/${this.repo}.git`;
  }

  /**
   * Sets the branch for repository operations.
   * If the repository is already initialized, it will checkout the new branch.
   * @param branch - The branch name to use
   */
  public set branch(branch: string) {
    this.#branch = branch;
    if (this.#initialized) {
      this._checkoutBranch();
    }
  }

  /**
   * Creates a new ProjectTemplateRepository instance.
   *
   * @param repo - The repository name (e.g., 'equinor/fusion-app-template')
   * @param options - Configuration options for the repository
   * @param options.baseDir - Base directory for the repository (defaults to temp directory)
   * @param options.log - Optional logger instance for output
   * @param options.protocol - Git protocol to use (auto-detected if not specified)
   * @param options.branch - Branch to checkout (defaults to 'main')
   */
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
    this.#log = options.log;
    this.#branch = options.branch ?? 'main';
    // Initialize git instance lazily to avoid issues with non-existent directories
    this.#git = simpleGit();
    // Auto-detect protocol based on SSH configuration (will be set properly in initialize)
    this.#protocol = options.protocol ?? 'https';
  }

  /**
   * Initializes the repository by cloning or updating it.
   *
   * This method handles the complete repository setup process:
   * - Creates the base directory if it doesn't exist
   * - Clones the repository if it's not already initialized
   * - Updates the repository if it already exists
   * - Checks out the specified branch
   *
   * @throws {Error} If repository initialization fails
   */
  async initialize(): Promise<void> {
    if (this.#initialized) {
      return;
    }

    try {
      this.#log?.debug('Checking if repository directory exists...', this.#baseDir);
      if (!existsSync(this.#baseDir)) {
        this.#log?.info('Repository directory does not exist, creating...');
        mkdirSync(this.#baseDir, { recursive: true });
        this.#log?.succeed('Repository directory created successfully!');
      }

      // Initialize git instance with the correct base directory
      this.#git = simpleGit({ baseDir: this.#baseDir });
      this._setupOutputHandler();

      // Auto-detect protocol based on SSH configuration now that git is properly initialized
      if (!this.#protocol) {
        try {
          const sshCommand = await this.#git.getConfig('core.sshCommand');
          this.#protocol = sshCommand ? 'ssh' : 'https';
        } catch {
          // If we can't detect SSH config, default to https
          this.#protocol = 'https';
        }
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

  /**
   * Retrieves all available project templates from the repository.
   *
   * This method reads the templates.json manifest file from the repository
   * and parses it to create ProjectTemplate instances. It combines global
   * resources with template-specific resources to create complete templates.
   *
   * @returns Promise resolving to an array of available project templates
   * @throws {Error} If templates.json cannot be read or parsed
   *
   * @example
   * ```typescript
   * const templates = await repo.getAvailableTemplates();
   * console.log(`Found ${templates.length} templates`);
   * ```
   */
  async getAvailableTemplates(): Promise<ProjectTemplate[]> {
    let templatesRaw: string;
    try {
      const templatesJsonPath = join(this.#baseDir, 'templates.json');
      // Read the templates.json manifest file from the repository root
      this.#log?.debug('Reading template manifest file...', templatesJsonPath);
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

      // Create ProjectTemplate instances, combining global and template-specific resources
      const templateItems = manifest.templates.map((template) => {
        const resources = [...(manifest.resources ?? []), ...template.resources];
        return new ProjectTemplate({ ...template, resources }, this.#baseDir, {
          logger: this.#log,
        });
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

      // Validate the base directory path for security
      const validatedBaseDir = validateSafePath(this.#baseDir, tmpdir());
      safeRmSync(validatedBaseDir, { recursive: true, force: true }, tmpdir());

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
        repoUrl: this.repoUrl,
        baseDir: this.#baseDir,
        branch: this.#branch,
        protocol: this.#protocol,
      });

      await this.#git.clone(this.repoUrl, this.#baseDir, [
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
      this.#log?.debug('Fetching repo...', { repo: this.repo, repoUrl: this.repoUrl });
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
