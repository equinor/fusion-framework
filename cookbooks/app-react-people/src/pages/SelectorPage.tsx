import { useCallback, useReducer } from 'react';
import {
    PersonInfo,
    PersonListItem,
    PersonSelect,
    PersonSelectEvent,
} from '@equinor/fusion-react-person';
import { styled } from 'styled-components';

import { Button, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
Icon.add({ delete_to_trash });

import { createReducer, createAction } from '@equinor/fusion-observable';

const Story = styled.article`
    margin: 3em 0;
`;

/** Actions for reducer cases */
const actions = {
    add: createAction('add_selected', (person: PersonInfo) => ({ payload: person })),
    remove: createAction('remove_person', (id: string) => ({ payload: id })),
    clear: createAction('clear_selected'),
};

/** initial users to display in reducer */
const initial: Record<string, PersonInfo> = {
    'f59e967d-8422-41ae-8980-a47f3ac0b70c': {
        mail: 'handah@equinor.com',
        name: 'Hans Våga Dahle',
        jobTitle: 'Prin Analyst Digital SW Arch',
        department: 'FOS FOIT PDP',
        mobilePhone: '+47 93042741',
        officeLocation: 'ST-FV E3',
        upn: 'HANDAH@equinor.com',
        accountType: 'Employee',
        azureId: 'f59e967d-8422-41ae-8980-a47f3ac0b70c',
    },
    'cbc6480d-12c1-467e-b0b8-cfbb22612daa': {
        mail: 'OROC@equinor.com',
        name: 'Odin Thomas Rochmann (Bouvet ASA)',
        jobTitle: 'X-Bouvet ASA (PX)',
        department: 'FOIT CON PDP',
        mobilePhone: '+47 97574503',
        upn: 'OROC@equinor.com',
        accountType: 'Consultant',
        managerAzureUniqueId: '0c30c249-2f02-4fbc-abfa-77cbddeb4230',
        azureId: 'cbc6480d-12c1-467e-b0b8-cfbb22612daa',
    },
};
/** Reducer attched to useReducer hook, */
const reducer = createReducer(initial, (builder) => {
    builder.addCase(actions.add, (state, action) => {
        state[action.payload.azureId] = action.payload;
    });
    builder.addCase(actions.remove, (state, action) => {
        delete state[action.payload];
    });
    builder.addCase(actions.clear, () => {});
});

export const SelectorPage = () => {
    /** Init reducer */
    const [selected, dispatch] = useReducer(reducer, reducer.getInitialState());

    const selectPersonCallback = useCallback(
        (e: PersonSelectEvent) => {
            const { selected: sel } = e.nativeEvent.detail;
            if (sel) {
                console.log('Selecting =>', sel);
                dispatch(actions.add(sel));
            }
        },
        [dispatch],
    );

    return (
        <>
            <h2>PersonSelect Component</h2>
            <section>
                <Story>
                    <p>Standard</p>
                    <PersonSelect placeholder="Search away matey"></PersonSelect>
                </Story>
                <Story>
                    <p>Property: selectedPerson upn</p>
                    <PersonSelect selectedPerson={'handah@equinor.com'}></PersonSelect>
                </Story>
                <Story>
                    <p>Property: selectedPerson azureId</p>
                    <PersonSelect
                        selectedPerson={'cbc6480d-12c1-467e-b0b8-cfbb22612daa'}
                    ></PersonSelect>
                </Story>
                <Story>
                    <p>Controlled component:</p>
                    <PersonSelect
                        selectedPerson={null}
                        onSelect={selectPersonCallback}
                    ></PersonSelect>
                    <p>Selected persons:</p>
                    <ul
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gridGap: '1em',
                            listStyle: 'none',
                            padding: 0,
                        }}
                    >
                        {Object.values(selected).map((person) => (
                            <li key={person.azureId}>
                                <PersonListItem dataSource={person}>
                                    <Button
                                        variant="ghost_icon"
                                        onClick={() => dispatch(actions.remove(person.azureId))}
                                    >
                                        <Icon name="delete_to_trash" />
                                    </Button>
                                </PersonListItem>
                            </li>
                        ))}
                    </ul>
                </Story>
            </section>
        </>
    );
};
