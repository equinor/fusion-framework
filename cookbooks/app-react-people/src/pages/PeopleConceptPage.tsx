import { useCallback, useMemo, useState } from 'react';
import {
  PeoplePicker,
  PeopleViewer,
  type PersonAddedEvent,
  type PersonRemovedEvent,
} from '@equinor/fusion-react-person';

type PersonInfo = {
  azureId: string;
};

export const PeopleConceptPage = () => {
  const [selected, setSelected] = useState<PersonInfo[]>([]);

  // list of ids to resolve on mount, including edge cases like expired and non-existing users.
  const resolvePeople = useMemo(() => {
    return [
      'jones@equinor.com',
      '0b6dfe7d-69b2-42ca-920b-c0e4e6a1a633',
      '49132c24-6ea4-41fe-8221-112f314573f0',
      'cbc6480d-12c1-467e-b0b8-cfbb22612daa',
      '2a424f0d-ae50-4f2b-b203-ba4ca60c378e', // expired
      '2a424f0d-ae50-4f2b-b203-ba4ca60c378f', // 404
      '06f8b423-dd89-4482-892b-a78fccaeaaf5',
      '0a14f828-adb9-460c-9a30-0dfa6f312a28',
      'a68f76e4-8092-4464-a079-c393d29016f0',
      '05f25990-3ba3-4795-b6f8-36efb5834ec7',
      '000248d4-bb4f-4056-a9ac-9a0dd855cbd4',
    ];
  }, []);

  const handlePersonAdded = useCallback((event: PersonAddedEvent) => {
    setSelected((prev) => [...prev, event.detail]);
  }, []);

  const handlePersonRemoved = useCallback((event: PersonRemovedEvent) => {
    setSelected((prev) => prev.filter((p) => p.azureId !== event.detail.azureId));
  }, []);

  return (
    <div>
      <h2>People Concept Page</h2>
      <div style={{ marginBottom: '1em' }}>
        <p>
          This page demonstrates the concept of PeoplePicker and PeopleViewer components. The
          PeoplePicker allows users to search and select people, while the PeopleViewer displays
          information about people.
        </p>
      </div>
      <div style={{ margin: '3em 0' }}>
        <h3>People Picker</h3>
        <p>
          The PeoplePicker component resolves persons from the given resolveIds property on mount,
          and adds/removes people on user interaction, updating the selected people state through
          the onPersonAdded and onPersonRemoved callback props.
        </p>
        <PeoplePicker
          // PS: resolveIds are resolved on mount only so don't keep pushing to that array.
          resolveIds={resolvePeople}
          onPersonAdded={handlePersonAdded}
          onPersonRemoved={handlePersonRemoved}
        />
      </div>
      <div>
        <h3>People Viewer</h3>
        <p>
          The PeopleViewer component displays information about the selected people in the selected
          state.
        </p>
        <PeopleViewer
          // selected people state from People Picker
          people={selected}
          display="table"
        />
      </div>
    </div>
  );
};

export default PeopleConceptPage;
