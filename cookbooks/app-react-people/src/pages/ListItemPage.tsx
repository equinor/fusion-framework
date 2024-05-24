import { PersonListItem } from '@equinor/fusion-react-person';
import { FlexGridColumn } from '../Styled';
import { useSearchPersons, type ApiPersonSearchResultV2 } from '../api/person-search';

const demoSearch = 'FOIT CON PDL';

/**
 * Maps an `ApiPersonSearchResultV2` object to a `PersonListItem` component.
 *
 * Since the person object is provided, the `dataSource` property on `PersonListItem` used,
 * this wil skip the request for resolving the provided person.
 *
 * @param person - The `ApiPersonSearchResultV2` object to map.
 * @returns A `PersonListItem` component with the data from the `person` object.
 */
const mapPersonToListItem = (person: ApiPersonSearchResultV2) => (
    <PersonListItem
        key={person.azureUniqueId}
        dataSource={{
            azureId: person.azureUniqueId!,
            name: person.name,
            mail: person.mail,
            jobTitle: person.jobTitle,
            department: person.department,
            mobilePhone: person.mobilePhone,
            officeLocation: person.officeLocation,
            upn: person.upn,
            accountType: person.accountType,
        }}
    />
);
/**
 * Renders a page that displays a list of persons based on a search query.
 *
 * This component fetches and displays a list of persons using the `useSearchPersons` hook.
 * If there is an error fetching the data, an error message is displayed.
 * If the data is still being fetched, a loading message is displayed.
 * Otherwise, the list of persons is rendered using the `mapPersonToListItem` function.
 *
 * This example will use a custom search query and map the results to a `PersonListItem` component.
 *
 * @returns A React component that renders the list of persons.
 */
export const ListItemPage = () => {
    // Fetch and handle search results for persons
    const { persons, error, isSearching } = useSearchPersons(demoSearch);

    // Display error message if there was an issue fetching the data
    if (error) {
        return (
            <div>
                <p>
                    {error.name}: {error.message}
                </p>
                <pre>{JSON.stringify(error.data ?? error.cause, null, 2)}</pre>
            </div>
        );
    }

    // Display loading message while fetching data
    if (isSearching) {
        return <div>Fetching demo data for [{demoSearch}] ...</div>;
    }

    // Render the list of persons
    return (
        <>
            <h2>PersonListItems ({demoSearch})</h2>
            <FlexGridColumn>
                {persons.map(mapPersonToListItem)}
                {/*
                  // Alternative way of mapping components, where the host people resolver is used.
                  // Note this will cause the host to re-resolve each person and use the data from the host api. 
                  persons.map(person => (<PersonListItem key={person.azureUniqueId} azureId={person.azureUniqueId} />))
                 */}
            </FlexGridColumn>
        </>
    );
};
