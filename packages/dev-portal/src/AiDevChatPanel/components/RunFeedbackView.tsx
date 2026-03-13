import {
  autorenew,
  done,
  edit,
  error_outlined,
  folder,
  info_circle,
  play,
  search,
  settings,
  warning_outlined,
} from '@equinor/eds-icons';
import { Icon } from '@equinor/eds-core-react';
import { Styled } from '../styles.js';
import type { PendingChangeSet } from '../types.js';
import type { RunFeedbackEntry, RunFeedbackKind, RunFeedbackState } from '../runFeedback.js';

Icon.add({
  info_circle,
  warning_outlined,
  error_outlined,
  edit,
  done,
  search,
  folder,
  play,
  settings,
  autorenew,
});

type DetailedStage =
  | 'system'
  | 'reasoning'
  | 'loading'
  | 'processing'
  | 'analyzing'
  | 'refining'
  | 'applying';

interface FeedbackLine {
  readonly key: string;
  readonly kind: RunFeedbackKind;
  readonly action: string;
  readonly detail?: string;
  readonly fileHint?: string;
  readonly stage: DetailedStage;
  readonly editSummary?: {
    readonly file: string;
    readonly additions: number;
    readonly deletions: number;
  };
}

interface StageGroup {
  readonly stage: DetailedStage;
  readonly items: FeedbackLine[];
}

interface CompactFeedback {
  readonly action: string;
  readonly detail?: string;
  readonly kind: RunFeedbackKind;
}

interface RunFeedbackViewProps {
  readonly runFeedback: RunFeedbackState;
  readonly pendingChangeSet: PendingChangeSet | null;
}

const STAGE_LABELS: Record<DetailedStage, string> = {
  system: 'Runtime',
  reasoning: 'Reasoning',
  loading: 'Loading',
  processing: 'Processing',
  analyzing: 'Analyzing',
  refining: 'Refining',
  applying: 'Applying',
};

const STAGE_ICONS: Record<DetailedStage, typeof info_circle> = {
  system: info_circle,
  reasoning: search,
  loading: autorenew,
  processing: play,
  analyzing: search,
  refining: settings,
  applying: edit,
};

function resolveIconData(line: FeedbackLine): typeof info_circle {
  if (line.kind === 'error') {
    return error_outlined;
  }

  if (line.kind === 'warning') {
    return warning_outlined;
  }

  if (line.editSummary) {
    return edit;
  }

  if (line.stage === 'reasoning' || line.stage === 'analyzing') {
    return search;
  }

  if (line.stage === 'loading') {
    return autorenew;
  }

  if (line.stage === 'processing') {
    return play;
  }

  if (line.stage === 'refining') {
    return settings;
  }

  if (line.stage === 'applying') {
    return edit;
  }

  if (line.fileHint) {
    return folder;
  }

  return info_circle;
}

function resolveCompactIcon(kind: RunFeedbackKind): typeof info_circle {
  if (kind === 'error') {
    return error_outlined;
  }

  if (kind === 'warning') {
    return warning_outlined;
  }

  return info_circle;
}

function parseEntry(entry: Exclude<RunFeedbackEntry, { type: 'status' }>): FeedbackLine {
  if (entry.type === 'operation') {
    if (entry.operation === 'edit') {
      return {
        key: entry.id,
        kind: entry.kind,
        action: 'Edit',
        stage: 'applying',
        editSummary:
          entry.target && typeof entry.additions === 'number' && typeof entry.deletions === 'number'
            ? {
                file: entry.target,
                additions: entry.additions,
                deletions: entry.deletions,
              }
            : undefined,
        detail:
          entry.target &&
          !(typeof entry.additions === 'number' && typeof entry.deletions === 'number')
            ? entry.target
            : undefined,
      };
    }

    if (entry.operation === 'glob') {
      return {
        key: entry.id,
        kind: entry.kind,
        action: 'Glob',
        stage: 'loading',
        detail: entry.target,
      };
    }

    if (entry.operation === 'list') {
      return {
        key: entry.id,
        kind: entry.kind,
        action: 'List directory',
        stage: 'loading',
        detail: entry.target,
      };
    }

    if (entry.operation === 'search') {
      return {
        key: entry.id,
        kind: entry.kind,
        action: 'Grep',
        stage: 'analyzing',
        detail: entry.target,
      };
    }

    if (entry.operation === 'read') {
      return {
        key: entry.id,
        kind: entry.kind,
        action: 'Read',
        fileHint: entry.target,
        stage: 'loading',
      };
    }

    return {
      key: entry.id,
      kind: entry.kind,
      action: entry.message,
      stage: 'system',
    };
  }

  const payload = entry.message;
  const splitMatch = payload.match(/^([^:.-]+[:.-]?)(?:\s+)(.+)$/);
  const legacyEditMatch = payload.match(/^edited\s+(.+?)\s+\+(\d+)\s+-\s*(\d+)$/i);
  const compactEditMatch = payload.match(
    /^(edit|edited|create|created|update|updated)\s+(.+?)\s*\(\+(\d+)\s+-\s*(\d+)\)$/i,
  );
  const readMatch = payload.match(/^read\s+(.+?)(?:,\s*(.+))?$/i);
  const patchMatch = payload.match(/^generating\s+patch\s*\(([^)]+)\)\s+in\s+(.+)$/i);

  if (patchMatch) {
    return {
      key: entry.id,
      kind: entry.kind,
      action: 'Generating patch',
      detail: patchMatch[1].trim(),
      fileHint: patchMatch[2].trim(),
      stage: entry.type === 'stage' ? entry.stage : 'system',
    };
  }

  if (readMatch) {
    return {
      key: entry.id,
      kind: entry.kind,
      action: 'Read',
      fileHint: readMatch[1].trim(),
      detail: readMatch[2]?.trim(),
      stage: entry.type === 'stage' ? entry.stage : 'system',
    };
  }

  return {
    key: entry.id,
    kind: entry.kind,
    action:
      legacyEditMatch || compactEditMatch ? 'Edited' : splitMatch ? splitMatch[1].trim() : payload,
    detail:
      legacyEditMatch || compactEditMatch
        ? undefined
        : splitMatch
          ? splitMatch[2].trim()
          : undefined,
    stage: entry.type === 'stage' ? entry.stage : 'system',
    editSummary:
      legacyEditMatch || compactEditMatch
        ? {
            file: (compactEditMatch?.[2] ?? legacyEditMatch?.[1] ?? '').trim(),
            additions: Number(compactEditMatch?.[3] ?? legacyEditMatch?.[2] ?? '0'),
            deletions: Number(compactEditMatch?.[4] ?? legacyEditMatch?.[3] ?? '0'),
          }
        : undefined,
  };
}

function toStageGroups(lines: FeedbackLine[]): StageGroup[] {
  const groups: StageGroup[] = [];

  for (const line of lines) {
    const previousGroup = groups.at(-1);

    if (!previousGroup || previousGroup.stage !== line.stage) {
      groups.push({ stage: line.stage, items: [line] });
      continue;
    }

    previousGroup.items.push(line);
  }

  return groups;
}

function shouldUseDetailedFeedback(
  entries: Exclude<RunFeedbackEntry, { type: 'status' }>[],
  pendingChangeSet: PendingChangeSet | null,
): boolean {
  const stageEntries = entries.filter(
    (entry): entry is Extract<RunFeedbackEntry, { type: 'stage' }> => entry.type === 'stage',
  );

  return (
    Boolean(pendingChangeSet) ||
    entries.some((entry) => entry.type === 'operation') ||
    entries.some((entry) => entry.kind !== 'info') ||
    stageEntries.some((entry) => entry.stage === 'applying') ||
    stageEntries.length > 2
  );
}

function resolveCompactFeedback(entries: RunFeedbackEntry[]): CompactFeedback | null {
  const latestEntry = entries.at(-1);
  if (!latestEntry) {
    return null;
  }

  if (latestEntry.type === 'status') {
    return {
      action: latestEntry.message,
      kind: latestEntry.kind,
    };
  }

  const parsed = parseEntry(latestEntry);
  return {
    action: parsed.action,
    detail: parsed.detail ?? parsed.fileHint,
    kind: parsed.kind,
  };
}

/**
 * Renders either a one-line status row or a detailed progress timeline.
 * Simple prompts stay compact, while multi-step or file-changing work expands.
 */
export function RunFeedbackView({
  runFeedback,
  pendingChangeSet,
}: RunFeedbackViewProps): JSX.Element | null {
  const detailedEntries = runFeedback.entries.filter(
    (entry): entry is Exclude<RunFeedbackEntry, { type: 'status' }> => entry.type !== 'status',
  );
  const showDetailedFeedback = shouldUseDetailedFeedback(detailedEntries, pendingChangeSet);
  const compactFeedback = resolveCompactFeedback(runFeedback.entries);

  if (showDetailedFeedback && detailedEntries.length > 0) {
    const stageGroups = toStageGroups(detailedEntries.map(parseEntry));

    return (
      <Styled.RunFeedbackCard $status={runFeedback.status === 'error' ? 'error' : 'running'}>
        <Styled.RunFeedbackBody>
          <Styled.RunFeedbackTimeline>
            {stageGroups.map((group, groupIndex) => (
              <Styled.RunFeedbackStage key={`${group.stage}-${String(groupIndex)}`}>
                <Styled.RunFeedbackStageHeader>
                  <Styled.RunFeedbackStageDot $active={groupIndex === stageGroups.length - 1} />
                  <Styled.RunFeedbackStageIcon>
                    <Icon data={STAGE_ICONS[group.stage]} size={16} />
                  </Styled.RunFeedbackStageIcon>
                  <Styled.RunFeedbackStageTitle>
                    {STAGE_LABELS[group.stage]}
                  </Styled.RunFeedbackStageTitle>
                </Styled.RunFeedbackStageHeader>

                {group.items.map((line) => (
                  <Styled.RunFeedbackTimelineItem key={line.key}>
                    <Styled.RunFeedbackIcon $kind={line.kind}>
                      <Icon data={resolveIconData(line)} size={16} />
                    </Styled.RunFeedbackIcon>
                    <Styled.RunFeedbackContent>
                      {line.editSummary ? (
                        <Styled.RunFeedbackEditRow>
                          <Styled.RunFeedbackAction>{line.action}</Styled.RunFeedbackAction>
                          <Styled.RunFeedbackEditFile>
                            {line.editSummary.file}
                          </Styled.RunFeedbackEditFile>
                          <Styled.RunFeedbackEditAdded>
                            +{line.editSummary.additions}
                          </Styled.RunFeedbackEditAdded>
                          <Styled.RunFeedbackEditRemoved>
                            -{line.editSummary.deletions}
                          </Styled.RunFeedbackEditRemoved>
                        </Styled.RunFeedbackEditRow>
                      ) : line.fileHint ? (
                        <Styled.RunFeedbackActionRow>
                          <Styled.RunFeedbackAction>{line.action}</Styled.RunFeedbackAction>
                          <Styled.RunFeedbackFilePill>{line.fileHint}</Styled.RunFeedbackFilePill>
                          {line.detail ? (
                            <Styled.RunFeedbackInlineMeta>
                              {line.detail}
                            </Styled.RunFeedbackInlineMeta>
                          ) : null}
                        </Styled.RunFeedbackActionRow>
                      ) : (
                        <Styled.RunFeedbackAction>{line.action}</Styled.RunFeedbackAction>
                      )}
                      {line.detail && !line.fileHint ? (
                        <Styled.RunFeedbackDetail>{line.detail}</Styled.RunFeedbackDetail>
                      ) : null}
                    </Styled.RunFeedbackContent>
                  </Styled.RunFeedbackTimelineItem>
                ))}
              </Styled.RunFeedbackStage>
            ))}
          </Styled.RunFeedbackTimeline>
        </Styled.RunFeedbackBody>
      </Styled.RunFeedbackCard>
    );
  }

  if (!compactFeedback) {
    return null;
  }

  return (
    <Styled.RunFeedbackCompactCard>
      <Styled.RunFeedbackCompactIcon $kind={compactFeedback.kind}>
        <Icon data={resolveCompactIcon(compactFeedback.kind)} size={16} />
      </Styled.RunFeedbackCompactIcon>
      <Styled.RunFeedbackCompactText>
        <Styled.RunFeedbackCompactAction>{compactFeedback.action}</Styled.RunFeedbackCompactAction>
        {compactFeedback.detail ? (
          <Styled.RunFeedbackCompactDetail>
            {compactFeedback.detail}
          </Styled.RunFeedbackCompactDetail>
        ) : null}
      </Styled.RunFeedbackCompactText>
    </Styled.RunFeedbackCompactCard>
  );
}
