/**
 * Task stage values derived from Copilot progress text.
 */
export type TaskStage =
  | 'reasoning'
  | 'loading'
  | 'processing'
  | 'analyzing'
  | 'refining'
  | 'applying';

/**
 * Parsed timeline operation from Copilot stream output.
 */
export interface ParsedOperationLine {
  operation: 'glob' | 'list' | 'search' | 'read' | 'edit' | 'detail';
  kind?: 'info' | 'warning' | 'error';
  message: string;
  target?: string;
  additions?: number;
  deletions?: number;
}

/**
 * Detects a task stage from a progress message.
 * @param message - Progress message from Copilot output.
 * @returns Matching task stage, or null when no stage can be inferred.
 */
export function detectTaskStage(message: string): TaskStage | null {
  const lower = message.toLowerCase();

  if (/reason|think|consider|plan/i.test(lower)) {
    return 'reasoning';
  }
  if (/load|fetch|read|retriev/i.test(lower)) {
    return 'loading';
  }
  if (/process|generat|build|transform/i.test(lower)) {
    return 'processing';
  }
  if (/analyz|inspect|check|review|evaluat/i.test(lower)) {
    return 'analyzing';
  }
  if (/refin|improv|adjust|optim|polish/i.test(lower)) {
    return 'refining';
  }
  if (/apply|writ|creat|updat/i.test(lower)) {
    return 'applying';
  }

  return null;
}

/**
 * Maps a task stage to a compact user-facing message.
 * @param stage - Task stage value.
 * @returns Human-readable status label.
 */
export function toTaskStatusMessage(stage: TaskStage): string {
  switch (stage) {
    case 'reasoning':
      return 'Thinking';
    case 'loading':
      return 'Gathering context';
    case 'processing':
      return 'Working';
    case 'analyzing':
      return 'Analyzing';
    case 'refining':
      return 'Refining';
    case 'applying':
      return 'Applying changes';
  }
}

/**
 * Removes empty and known noise lines from Copilot stream output.
 * @param line - Raw stream line.
 * @returns Sanitized line, or empty string when the line should be ignored.
 */
export function sanitizeCopilotOutputLine(line: string): string {
  const cleaned = line.trimEnd();
  if (!cleaned) {
    return '';
  }

  if (cleaned === 'null' || cleaned === 'undefined') {
    return '';
  }

  if (/^summary:\s*$/i.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * Parses a Copilot line into a timeline operation event payload.
 * @param line - Sanitized stream line.
 * @returns Parsed operation payload, or null when line is narrative text.
 */
export function parseOperationLine(line: string): ParsedOperationLine | null {
  const withoutAnsi = stripAnsiCsi(line);
  const trimmed = withoutAnsi.trim();
  const markerMatch = /^([●✗✓])\s*(.+)$/.exec(trimmed);
  const marker = markerMatch?.[1];
  const content = markerMatch?.[2] ?? trimmed;
  const kind: ParsedOperationLine['kind'] = marker === '✗' ? 'error' : 'info';

  const listMatch = /^list\s+directory\s+(.+)$/i.exec(content);
  if (listMatch) {
    return {
      operation: 'list',
      kind,
      message: content,
      target: listMatch[1].trim(),
    };
  }

  const globMatch = /^glob\s+(.+)$/i.exec(content);
  if (globMatch) {
    return {
      operation: 'glob',
      kind,
      message: content,
      target: globMatch[1].trim(),
    };
  }

  const readMatch = /^read\s+(.+?)(?:\s+lines?\s+\d+[-:]\d+)?$/i.exec(content);
  if (readMatch) {
    return {
      operation: 'read',
      kind,
      message: content,
      target: readMatch[1].trim(),
    };
  }

  const grepMatch = /^grep\s+(.+)$/i.exec(content);
  if (grepMatch) {
    return {
      operation: 'search',
      kind,
      message: content,
      target: grepMatch[1].trim(),
    };
  }

  const editMatch = /^edit\s+(.+?)(?:\s+\(\+(\d+)\s+-\s*(\d+)\))?$/i.exec(content);
  if (editMatch) {
    return {
      operation: 'edit',
      kind,
      message: content,
      target: editMatch[1].trim(),
      additions: editMatch[2] ? Number(editMatch[2]) : undefined,
      deletions: editMatch[3] ? Number(editMatch[3]) : undefined,
    };
  }

  const detailMatch = /^└\s+(.+)$/i.exec(trimmed);
  if (detailMatch) {
    return {
      operation: 'detail',
      kind,
      message: detailMatch[1].trim(),
    };
  }

  if (/^no match found$/i.test(content)) {
    return {
      operation: 'detail',
      kind: 'error',
      message: content,
    };
  }

  if (
    /^(?:now|next|then)\s+(?:update|edit|change|modify|adjust|refactor|create|read|search|grep|glob)\b/i.test(
      content,
    ) ||
    /^i(?:'ll| will)\s+(?:update|edit|change|modify|adjust|refactor|create|read|search|grep|glob)\b/i.test(
      content,
    )
  ) {
    return {
      operation: 'detail',
      kind,
      message: content,
    };
  }

  if (markerMatch) {
    return {
      operation: 'detail',
      kind,
      message: content,
    };
  }

  return null;
}

function stripAnsiCsi(input: string): string {
  let output = '';
  let index = 0;

  while (index < input.length) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '\u001b' && next === '[') {
      index += 2;
      while (index < input.length && input[index] !== 'm') {
        index += 1;
      }
      if (index < input.length && input[index] === 'm') {
        index += 1;
      }
      continue;
    }

    output += char;
    index += 1;
  }

  return output;
}

/**
 * Emits assistant text as smaller chunks to improve UI streaming fluency.
 * @param text - Raw assistant text.
 * @param onAssistantChunk - Chunk callback.
 */
export function streamAssistantText(
  text: string,
  onAssistantChunk: (chunk: string) => void,
): void {
  for (const token of tokenize(text)) {
    onAssistantChunk(token);
  }
}

/**
 * Splits text into token-like chunks while preserving whitespace tokens.
 * @param text - Text to split.
 * @returns Token array.
 */
export function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}
