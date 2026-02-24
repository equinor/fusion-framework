import { useCallback, useState } from 'react';
import {
  PeoplePickerElement,
  PeopleViewerElement,
  type PersonAddedEvent,
  type PersonRemovedEvent,
} from '@equinor/fusion-wc-people';
import { useRef } from 'react';
import { useEffect } from 'react';
PeoplePickerElement;
PeopleViewerElement;

type PersonInfo = {
  azureId: string;
};

export const PeopleConceptPage = () => {
  const [selected, setSelected] = useState<PersonInfo[]>([]);
  const eventRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = useCallback((e: PersonAddedEvent) => {
    const person = e.detail;
    console.log('handleSelect', person);
    setSelected((prev) => [...prev, person]);
  }, []);

  const handleDeSelect = useCallback((e: PersonRemovedEvent) => {
    const person = e.detail;
    console.log('handleDeSelect', person);
    setSelected((prev) => {
      return prev.filter((p) => p.azureId !== person.azureId);
    });
  }, []);

  useEffect(() => {
    const current = eventRef.current;
    if (current) {
      current.addEventListener('person-added', handleSelect as EventListener);
      current.addEventListener('person-removed', handleDeSelect as EventListener);
    }
    return () => {
      if (current) {
        current.removeEventListener('person-added', handleSelect as EventListener);
        current.removeEventListener('person-removed', handleDeSelect as EventListener);
      }
    };
  }, [handleSelect, handleDeSelect]);

  return (
    <div ref={eventRef}>
      <h2>People Concept Page</h2>
      <div style={{ marginBottom: '3em' }}>
        <h3>People Picker</h3>
        <p>
          The People Picker component resolves persons from the given resolveIds property, and adds
          them to selected people state by listening to "person-added" event.
        </p>
        <fwc-people-picker></fwc-people-picker>
      </div>
      <div>
        <h3>People Viewer</h3>
        <fwc-people-viewer
          people={JSON.stringify(selected)}
          resolveIds={[
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
          ]}
        />
      </div>
    </div>
  );
};
