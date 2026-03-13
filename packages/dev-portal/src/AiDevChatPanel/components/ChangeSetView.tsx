import { edit } from '@equinor/eds-icons';
import { Icon, Typography } from '@equinor/eds-core-react';
import { Styled } from '../styles.js';
import type { PendingChangeSet } from '../types.js';

Icon.add({ edit });

interface ChangeSetViewProps {
  readonly changeSet: PendingChangeSet;
}

interface PatchStats {
  additions: number;
  deletions: number;
}

type PatchLineTone = 'default' | 'meta' | 'addition' | 'deletion';

function getPatchStats(patch: string): PatchStats {
  let additions = 0;
  let deletions = 0;

  for (const line of patch.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) {
      continue;
    }

    if (line.startsWith('+')) {
      additions += 1;
      continue;
    }

    if (line.startsWith('-')) {
      deletions += 1;
    }
  }

  return { additions, deletions };
}

function getPatchLineTone(line: string): PatchLineTone {
  if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('@@')) {
    return 'meta';
  }

  if (line.startsWith('+')) {
    return 'addition';
  }

  if (line.startsWith('-')) {
    return 'deletion';
  }

  return 'default';
}

/**
 * Pending changeset display with file diffs and apply/reject buttons.
 */
export function ChangeSetView(props: ChangeSetViewProps): JSX.Element {
  return (
    <Styled.ChangeSetCard>
      <Styled.ChangeSetHeader>
        <Styled.ChangeSetTitle>Files Changed</Styled.ChangeSetTitle>
        <Typography variant="caption" color="secondary">
          {props.changeSet.files.length} file{props.changeSet.files.length === 1 ? '' : 's'}
        </Typography>
      </Styled.ChangeSetHeader>

      <Styled.FileList>
        {props.changeSet.files.map((file) => {
          const stats = getPatchStats(file.patch);

          return (
            <Styled.FileCard key={file.path}>
              <Styled.FileSummaryRow>
                <Styled.FileSummaryLeft>
                  <Styled.FileIcon>
                    <Icon data={edit} size={14} />
                  </Styled.FileIcon>
                  <Styled.FileEditedTag>Edit</Styled.FileEditedTag>
                  <Styled.FilePath>{file.path}</Styled.FilePath>
                </Styled.FileSummaryLeft>
                <Styled.FileSummaryStats>
                  <Styled.FileAdded>+{stats.additions}</Styled.FileAdded>
                  <Styled.FileRemoved>-{stats.deletions}</Styled.FileRemoved>
                </Styled.FileSummaryStats>
              </Styled.FileSummaryRow>

              <Styled.FilePatchDetails>
                <Styled.FilePatchSummary>Show patch</Styled.FilePatchSummary>
                <Styled.Patch>
                  {file.patch.split('\n').map((line, index) => (
                    <Styled.PatchLine
                      key={`${file.path}-${String(index)}-${line}`}
                      $tone={getPatchLineTone(line)}
                    >
                      {line}
                    </Styled.PatchLine>
                  ))}
                </Styled.Patch>
              </Styled.FilePatchDetails>
            </Styled.FileCard>
          );
        })}
      </Styled.FileList>
    </Styled.ChangeSetCard>
  );
}
