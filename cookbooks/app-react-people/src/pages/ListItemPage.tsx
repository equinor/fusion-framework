import { useEffect, useState } from 'react';
import { PersonListItem, type PersonInfo } from '@equinor/fusion-react-person';
import { FlexGridColumn } from '../Styled';

/** DEMO HACK */
const useDemoData = (search: string) => {
    const [persons, setPersons] = useState<PersonInfo[]>([]);

    useEffect(() => {
        const providerEl = document.querySelector('fwc-person-provider');
        if (providerEl) {
            const controller = new AbortController();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            providerEl.resolver
                .search({ search, signal: controller.signal })
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                .then(setPersons);
            return () => controller.abort();
        }
    }, [search]);

    return persons;
};

export const ListItemPage = () => {
    const persons = useDemoData('FOIT CON PDL');

    return (
        <>
            <h2>PersonListItem</h2>
            <FlexGridColumn>
                {persons.length === 0 ? (
                    <>
                        <PersonListItem azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa" />
                        <PersonListItem upn="handah@equinor.com" />
                    </>
                ) : (
                    persons.map((person) => (
                        <PersonListItem key={person.azureId} dataSource={person} />
                    ))
                )}
            </FlexGridColumn>
        </>
    );
};
