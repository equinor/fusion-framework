import { mkdirSync, readFileSync } from 'node:fs';
import { basename, extname, join, relative, resolve, sep } from 'node:path';

import type { ToolResultObject } from '@github/copilot-sdk';

import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Resolves the requested screenshot format to a supported CLI value.
 *
 * @param format - Optional model-provided image format
 * @returns Validated format string, defaulting to `jpeg`
 */
function resolveScreenshotFormat(format: string | undefined): 'jpeg' | 'png' {
  return format === 'png' ? 'png' : 'jpeg';
}

/**
 * Ensures the screenshot artifact filename extension matches the selected image format.
 *
 * @param requestedPath - Optional model-provided filename
 * @param format - Selected image format
 * @returns Safe filename with the correct extension, or `undefined` when no path was provided
 */
function resolveScreenshotArtifactName(
  requestedPath: string | undefined,
  format: 'jpeg' | 'png',
): string | undefined {
  if (!requestedPath) return undefined;
  const fileName = basename(requestedPath);
  const currentExtension = extname(fileName).toLowerCase();
  const expectedExtension = format === 'jpeg' ? '.jpg' : '.png';

  if (currentExtension === expectedExtension) {
    return fileName;
  }

  if (currentExtension.length > 0) {
    return `${fileName.slice(0, -currentExtension.length)}${expectedExtension}`;
  }

  return `${fileName}${expectedExtension}`;
}

/**
 * Resolves an optional screenshot directory to a safe location within the eval evidence directory.
 *
 * @param evidenceDir - Base evidence directory for the current eval run
 * @param requestedDirectory - Optional model-provided screenshot directory
 * @returns Absolute screenshot directory constrained to the evidence directory tree
 */
function resolveScreenshotDirectory(
  evidenceDir: string,
  requestedDirectory: string | undefined,
): string {
  if (!requestedDirectory) {
    return evidenceDir;
  }

  const resolvedDirectory = resolve(evidenceDir, requestedDirectory);
  const relativeDirectory = relative(evidenceDir, resolvedDirectory);
  const isOutsideEvidenceDirectory =
    relativeDirectory === '..' || relativeDirectory.startsWith(`..${sep}`);

  return isOutsideEvidenceDirectory ? evidenceDir : resolvedDirectory;
}

/**
 * Builds a binary screenshot tool result that multimodal models can inspect directly.
 *
 * @param screenshotPath - Saved screenshot artifact path
 * @param format - Image format used for the screenshot
 * @returns Tool result object containing both text and inline image data
 */
function buildScreenshotResult(
  screenshotPath: string,
  format: 'jpeg' | 'png',
): ToolResultObject {
  return {
    textResultForLlm: `Saved screenshot to ${screenshotPath}. Inspect the attached image for visual evidence.`,
    binaryResultsForLlm: [
      {
        data: readFileSync(screenshotPath, 'base64'),
        mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
        type: 'image',
        description: `Screenshot artifact: ${basename(screenshotPath)}`,
      },
    ],
    resultType: 'success',
    toolTelemetry: {},
  };
}

/**
 * Creates the screenshot capture tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for saving an image screenshot and returning it to the model
 */
export function createScreenshotTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_screenshot', {
    description:
      'Capture a screenshot of the current page and return the image to the model. Use this for visual assertions such as colors, spacing, and layout.',
    parameters: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Optional filename for the screenshot artifact (for example: "landing-page.jpg")',
        },
        annotate: {
          type: 'boolean',
          description: 'Overlay numbered labels on interactive elements in the screenshot.',
        },
        format: {
          type: 'string',
          description: 'Image format: "jpeg" (default) or "png"',
        },
        quality: {
          type: 'number',
          description: 'JPEG quality from 0-100. Recommended/default is 60 when format is "jpeg".',
        },
        screenshotDir: {
          type: 'string',
          description: 'Default screenshot output directory, scoped inside the eval evidence folder.',
        },
      },
    },
    handler: async (args) => {
      const { path, annotate, format, quality, screenshotDir } = args as {
        path?: string;
        annotate?: boolean;
        format?: string;
        quality?: number;
        screenshotDir?: string;
      };
      const screenshotFormat = resolveScreenshotFormat(format);
      const screenshotDirectory = resolveScreenshotDirectory(
        context.evidenceDir,
        screenshotDir,
      );
      mkdirSync(screenshotDirectory, { recursive: true });
      const artifactName = resolveScreenshotArtifactName(path, screenshotFormat);
      const screenshotPath = join(
        screenshotDirectory,
        artifactName ?? `screenshot-${Date.now()}.${screenshotFormat === 'jpeg' ? 'jpg' : 'png'}`,
      );
      const command = [
        'screenshot',
        '--screenshot-format',
        screenshotFormat,
        '--screenshot-dir',
        screenshotDirectory,
      ];

      if (annotate) {
        command.push('--annotate');
      }

      if (screenshotFormat === 'jpeg') {
        const screenshotQuality = Math.min(100, Math.max(0, quality ?? 60));
        command.push('--screenshot-quality', String(screenshotQuality));
      }

      command.push(screenshotPath);
      context.runAb(command, 60_000);

      return buildScreenshotResult(screenshotPath, screenshotFormat);
    },
  });
}