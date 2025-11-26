import { useCallback } from 'react';
import { Form, useSearchParams, redirect } from 'react-router-dom';
import { Button, Search, Chip, Typography } from '@equinor/eds-core-react';
import { category } from '@equinor/eds-icons';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  ErrorElementProps,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';
import type { PersonSearchResult } from '../api';

export const handle = {
  route: {
    description: 'People search page with search functionality',
    search: {
      search: 'Search term to find people (name, email, or other identifiers)',
    },
  },
  navigation: {
    label: 'People API',
    icon: category,
    path: '/pages/people',
  },
} as const satisfies RouterHandle;

type PeoplePageLoaderData = {
  persons: PersonSearchResult[];
  searchTerm: string;
};

export async function clientLoader(props: LoaderFunctionArgs) {
  const { fusion, request } = props;
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('search') || '';

  // Use the unified API from context
  const { api } = fusion.context;

  // Use the API class method which handles caching via React Query
  const results = await api.people.searchPeople(searchTerm);

  return {
    persons: results || [],
    searchTerm,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const searchTerm = (formData.get('search') as string)?.trim() || '';

  if (!searchTerm) {
    return { error: 'Search term is required' };
  }

  // Redirect to same page with search parameter
  return redirect(`?search=${encodeURIComponent(searchTerm)}`);
}

const Styled = {
  ErrorContainer: styled.div`
    background-color: ${tokens.colors.ui.background__light.hex};
    padding: ${tokens.spacings.comfortable.large};
    border-radius: ${tokens.shape.corners.borderRadius};
    box-shadow: ${tokens.elevation.raised};
    border: 2px solid ${tokens.colors.interactive.danger__resting.hex};
  `,
  ErrorTitle: styled(Typography)`
    color: ${tokens.colors.interactive.danger__resting.hex};
    margin-bottom: ${tokens.spacings.comfortable.small};
  `,
  ErrorMessage: styled.div`
    font-size: ${tokens.typography.paragraph.body_short.fontSize};
    color: ${tokens.colors.text.static_icons__default.hex};
    margin-bottom: ${tokens.spacings.comfortable.medium};
    padding: ${tokens.spacings.comfortable.small};
    background-color: ${tokens.colors.ui.background__warning.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
  `,
  Title: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.medium};
  `,
  SearchForm: styled(Form)`
    margin-bottom: ${tokens.spacings.comfortable.large};
    display: flex;
    gap: ${tokens.spacings.comfortable.x_small};
    align-items: center;
    flex-wrap: wrap;
  `,
  SearchInput: styled(Search)`
    flex: 1;
    min-width: 200px;
  `,
  ErrorMessageBox: styled.div`
    color: ${tokens.colors.interactive.danger__resting.hex};
    margin-bottom: ${tokens.spacings.comfortable.small};
    padding: ${tokens.spacings.comfortable.medium};
    background-color: ${tokens.colors.ui.background__warning.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
  `,
  ResultsInfo: styled.div`
    margin-bottom: ${tokens.spacings.comfortable.small};
    padding: ${tokens.spacings.comfortable.medium};
    background-color: ${tokens.colors.ui.background__info.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    color: ${tokens.colors.interactive.primary__resting.hex};
  `,
  PersonList: styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
  `,
  PersonItem: styled.li`
    border: 1px solid ${tokens.colors.ui.background__medium.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    padding: ${tokens.spacings.comfortable.medium};
    margin-bottom: ${tokens.spacings.comfortable.small};
    background-color: ${tokens.colors.ui.background__light.hex};
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: ${tokens.elevation.raised};
    }
  `,
  PersonName: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.x_small};
  `,
  PersonEmail: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.medium};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
  `,
  PersonDetails: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${tokens.spacings.comfortable.x_small};
    margin-bottom: ${tokens.spacings.comfortable.medium};
  `,
  PersonDetail: styled.div`
    font-size: ${tokens.typography.paragraph.caption.fontSize};
    color: ${tokens.colors.text.static_icons__default.hex};
  `,
  EmptyState: styled.div`
    text-align: center;
    padding: ${tokens.spacings.comfortable.x_large};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
  `,
  EmptyStateTitle: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.x_small};
  `,
};

export function ErrorElement(props: ErrorElementProps) {
  const { error, fusion } = props;
  const onClick = useCallback(() => {
    // Remove the search parameter from the URL
    fusion.modules.navigation.navigate({ search: '' }, { replace: true });
  }, [fusion]);

  return (
    <Styled.ErrorContainer>
      <Styled.ErrorTitle variant="h2">⚠️ Error Encountered</Styled.ErrorTitle>
      <Styled.ErrorMessage>
        <strong>Error:</strong> {error.message}
      </Styled.ErrorMessage>
      <Button variant="contained" onClick={onClick}>
        Clear Search and Try Again
      </Button>
    </Styled.ErrorContainer>
  );
}

export default function PeoplePage(
  props: RouteComponentProps<PeoplePageLoaderData, { error: string }>,
) {
  const { loaderData, actionData } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const { persons, searchTerm } = loaderData;
  const currentSearch = searchParams.get('search') || '';

  const handleSearchChange = (value: string) => {
    // Update search params as user types (optional - can be removed if you prefer form submission only)
    if (value === '') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('search');
      setSearchParams(newParams);
    }
  };

  return (
    <>
      <Styled.Title variant="h1">People Search</Styled.Title>

      <Styled.SearchForm method="post">
        <Styled.SearchInput
          name="search"
          defaultValue={currentSearch}
          placeholder="Search for people (name, email, etc.)"
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Search
        </Button>
      </Styled.SearchForm>

      {actionData?.error && <Styled.ErrorMessageBox>{actionData.error}</Styled.ErrorMessageBox>}

      {searchTerm && (
        <Styled.ResultsInfo>
          {persons.length > 0 ? (
            <>
              Found <strong>{persons.length}</strong> result{persons.length !== 1 ? 's' : ''} for "
              <strong>{searchTerm}</strong>"
            </>
          ) : (
            <>
              No results found for "<strong>{searchTerm}</strong>"
            </>
          )}
        </Styled.ResultsInfo>
      )}

      {!searchTerm ? (
        <Styled.EmptyState>
          <Styled.EmptyStateTitle variant="h2">Search for People</Styled.EmptyStateTitle>
          <Typography variant="body_long">
            Enter a name, email, or other identifier to search for people.
          </Typography>
        </Styled.EmptyState>
      ) : persons.length === 0 ? (
        <Styled.EmptyState>
          <Styled.EmptyStateTitle variant="h2">No Results</Styled.EmptyStateTitle>
          <Typography variant="body_long">Try a different search term.</Typography>
        </Styled.EmptyState>
      ) : (
        <Styled.PersonList>
          {persons.map((person) => (
            <Styled.PersonItem key={person.azureUniqueId || person.mail}>
              <Styled.PersonName variant="h3">{person.name || 'Unknown'}</Styled.PersonName>
              {person.mail && (
                <Styled.PersonEmail variant="body_short">{person.mail}</Styled.PersonEmail>
              )}
              <Styled.PersonDetails>
                {person.jobTitle && <Chip variant="active">{person.jobTitle}</Chip>}
                {person.department && <Chip>{person.department}</Chip>}
                {person.accountType && <Chip variant="error">{person.accountType}</Chip>}
              </Styled.PersonDetails>
              {(person.mobilePhone || person.officeLocation) && (
                <Styled.PersonDetail>
                  {person.mobilePhone && <div>📱 {person.mobilePhone}</div>}
                  {person.officeLocation && <div>📍 {person.officeLocation}</div>}
                </Styled.PersonDetail>
              )}
              {person.fullDepartment && (
                <Styled.PersonDetail>
                  <small>Department: {person.fullDepartment}</small>
                </Styled.PersonDetail>
              )}
            </Styled.PersonItem>
          ))}
        </Styled.PersonList>
      )}
    </>
  );
}
