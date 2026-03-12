import { Button, Typography } from '@equinor/eds-core-react';
import { Styled } from '../styles.js';
import type { PendingChangeSet } from '../types.js';

interface ChangeSetViewProps {
  readonly changeSet: PendingChangeSet;
  readonly onApply: () => void;
  readonly onReject: () => void;
}

/**
 * Pending changeset display with file diffs and apply/reject buttons.
 */
export function ChangeSetView(props: ChangeSetViewProps): JSX.Element {
  return (
    <Styled.ChangeSetCard>
      <Styled.ChangeSetHeader>
        <Styled.ChangeSetTitle>Pending Change Set</Styled.ChangeSetTitle>
        <Typography variant="caption" color="secondary">
          {props.changeSet.changeSetId}
        </Typography>
      </Styled.ChangeSetHeader>

      <Styled.FileList>
        {props.changeSet.files.map((file) => (
          <Styled.FileCard key={file.path}>
            <Styled.FilePath>{file.path}</Styled.FilePath>
            <Styled.Patch>{file.patch}</Styled.Patch>
          </Styled.FileCard>
        ))}
      </Styled.FileList>

      <Styled.ChangeSetActions>
        <Button variant="outlined" onClick={props.onReject}>
          Reject
        </Button>
        <Button variant="contained" onClick={props.onApply}>
          Apply
        </Button>
      </Styled.ChangeSetActions>
    </Styled.ChangeSetCard>
  );
}
