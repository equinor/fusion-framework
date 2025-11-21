import { useCallback } from 'react';
import { Form, useSearchParams, redirect } from 'react-router-dom';
import { Button, Search, Chip } from '@equinor/eds-core-react';
import { category } from '@equinor/eds-icons';
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
} satisfies RouterHandle;

type PeoplePageLoaderData = {
  persons: PersonSearchResult[];
  searchTerm: string;
};

export const clientLoader = async (props: LoaderFunctionArgs) => {
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
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const searchTerm = (formData.get('search') as string)?.trim() || '';

  if (!searchTerm) {
    return { error: 'Search term is required' };
  }

  // Redirect to same page with search parameter
  return redirect(`.?search=${encodeURIComponent(searchTerm)}`);
};

export function ErrorElement(props: ErrorElementProps) {
  const { error, fusion } = props;
  const onClick = useCallback(() => {
    // Remove the search parameter from the URL
    fusion.modules.navigation.navigate({ search: '' }, { replace: true });
  }, [fusion]);

  const styles = {
    container: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '2px solid #f44336',
    },
    title: {
      fontSize: '1.5rem',
      color: '#f44336',
      marginBottom: '1rem',
    },
    message: {
      fontSize: '1rem',
      color: '#333',
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: '#ffebee',
      borderRadius: '4px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚠️ Error Encountered</h2>
      <div style={styles.message}>
        <strong>Error:</strong> {error.message}
      </div>
      <Button variant="contained" onClick={onClick}>
        Clear Search and Try Again
      </Button>
    </div>
  );
}

const styles = {
  title: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    color: '#1a1a1a',
  },
  searchForm: {
    marginBottom: '2rem',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
  },
  errorMessage: {
    color: '#f44336',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  },
  resultsInfo: {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    color: '#1976d2',
  },
  personList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  personItem: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    backgroundColor: '#fff',
    transition: 'box-shadow 0.2s',
  },
  personItemHover: {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  personName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  personEmail: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '0.75rem',
  },
  personDetails: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  personDetail: {
    fontSize: '0.9rem',
    color: '#333',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#666',
  },
  emptyStateTitle: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
};

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
      <h1 style={styles.title}>People Search</h1>

      <Form method="post" style={styles.searchForm}>
        <Search
          name="search"
          defaultValue={currentSearch}
          placeholder="Search for people (name, email, etc.)"
          style={styles.searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Search
        </Button>
      </Form>

      {actionData?.error && <div style={styles.errorMessage}>{actionData.error}</div>}

      {searchTerm && (
        <div style={styles.resultsInfo}>
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
        </div>
      )}

      {!searchTerm ? (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyStateTitle}>Search for People</h2>
          <p>Enter a name, email, or other identifier to search for people.</p>
        </div>
      ) : persons.length === 0 ? (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyStateTitle}>No Results</h2>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <ul style={styles.personList}>
          {persons.map((person) => (
            <li key={person.azureUniqueId || person.mail} style={styles.personItem}>
              <div style={styles.personName}>{person.name || 'Unknown'}</div>
              {person.mail && <div style={styles.personEmail}>{person.mail}</div>}
              <div style={styles.personDetails}>
                {person.jobTitle && <Chip variant="active">{person.jobTitle}</Chip>}
                {person.department && <Chip>{person.department}</Chip>}
                {person.accountType && <Chip variant="error">{person.accountType}</Chip>}
              </div>
              {(person.mobilePhone || person.officeLocation) && (
                <div style={styles.personDetail}>
                  {person.mobilePhone && <div>📱 {person.mobilePhone}</div>}
                  {person.officeLocation && <div>📍 {person.officeLocation}</div>}
                </div>
              )}
              {person.fullDepartment && (
                <div style={styles.personDetail}>
                  <small>Department: {person.fullDepartment}</small>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
