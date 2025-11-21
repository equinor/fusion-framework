import { Link, useSearchParams } from 'react-router-dom';
import { Button, Chip } from '@equinor/eds-core-react';
import { work_outline } from '@equinor/eds-icons';
import type {
  LoaderFunctionArgs,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';
import type { User } from '../api/UserApi';

type UsersPageLoaderData = {
  users: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const handle = {
  route: {
    description: 'Users list page with pagination',
    params: {},
    search: {
      page: 'Page number for pagination (default: 1)',
      limit: 'Number of users per page (default: 5)',
    },
  },
  navigation: {
    label: 'Users',
    icon: work_outline,
    path: '/users',
  },
} satisfies RouterHandle;

export const clientLoader = async ({ request, fusion }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '5', 10);

  // Use the unified API from context
  const { api } = fusion.context;

  // Fetch paginated users
  const result = await api.user.getUsers({ page, limit });

  return result;
};

const styles = {
  title: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    color: '#1a1a1a',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    width: '100px',
  },
  info: {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    color: '#1976d2',
  },
  userList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  userItem: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#fff',
    transition: 'box-shadow 0.2s',
  },
  userItemHover: {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  userName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  userEmail: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  userDetails: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: '#333',
  },
  userDetail: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  },
  pagination: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2rem',
  },
  paginationInfo: {
    padding: '0.5rem 1rem',
    color: '#666',
  },
};

// Helper functions to get chip variants based on role and department
const getRoleChipVariant = (role: string): 'active' | 'error' | undefined => {
  switch (role.toLowerCase()) {
    case 'developer':
      return 'active';
    case 'designer':
      return undefined;
    case 'manager':
      return 'error';
    case 'analyst':
      return undefined;
    default:
      return undefined;
  }
};

const getDepartmentChipVariant = (department: string): 'active' | 'error' | undefined => {
  switch (department.toLowerCase()) {
    case 'engineering':
      return 'active';
    case 'design':
      return undefined;
    case 'operations':
      return 'error';
    case 'finance':
      return undefined;
    default:
      return undefined;
  }
};

export default function UsersPage(props: RouteComponentProps<UsersPageLoaderData>) {
  const { loaderData } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, page, limit, total, totalPages, hasNext, hasPrev } = loaderData;

  const goToPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const setLimit = (newLimit: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', newLimit.toString());
    newParams.set('page', '1'); // Reset to first page when changing limit
    setSearchParams(newParams);
  };

  const handleRemovePage = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleRemoveLimit = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('limit');
    setSearchParams(newParams);
  };

  return (
    <div>
      <h1 style={styles.title}>Users</h1>

      <div style={styles.controls}>
        <div style={styles.formGroup}>
          <label htmlFor="limit" style={styles.label}>
            Items per page
          </label>
          <input
            id="limit"
            type="number"
            min="1"
            max="20"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.info}>
        <div style={{ marginBottom: '0.5rem' }}>
          Showing {users.length} of {total} users (Page {page} of {totalPages})
        </div>
        {(page > 1 || limit !== 5) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {page > 1 && (
              <Chip variant="active" onDelete={handleRemovePage}>
                {`Page: ${page}`}
              </Chip>
            )}
            {limit !== 5 && (
              <Chip variant="active" onDelete={handleRemoveLimit}>
                {`Limit: ${limit}`}
              </Chip>
            )}
          </div>
        )}
      </div>

      <ul style={styles.userList}>
        {users.map((user) => (
          <li key={user.id} style={styles.userItem}>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userEmail}>{user.email}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <Chip variant={getRoleChipVariant(user.role)}>{user.role}</Chip>
              <Chip variant={getDepartmentChipVariant(user.department)}>{user.department}</Chip>
            </div>
            <Button variant="contained" as={Link} to={`/users/${user.id}`}>
              View Profile
            </Button>
          </li>
        ))}
      </ul>

      <div style={styles.pagination}>
        <Button variant="outlined" onClick={() => goToPage(page - 1)} disabled={!hasPrev}>
          Previous
        </Button>
        <span style={styles.paginationInfo}>
          Page {page} of {totalPages}
        </span>
        <Button variant="outlined" onClick={() => goToPage(page + 1)} disabled={!hasNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
