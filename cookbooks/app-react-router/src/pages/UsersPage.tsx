import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Chip, Typography } from '@equinor/eds-core-react';
import { work_outline } from '@equinor/eds-icons';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';
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
    title: 'Users',
    icon: work_outline,
    params: {},
    search: {
      page: 'Page number for pagination (default: 1)',
      limit: 'Number of users per page (default: 5)',
    },
  },
} as const satisfies RouterHandle;

export async function clientLoader({ request, fusion }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '5', 10);

  // Use the unified API from context
  const { api } = fusion.context;

  // Fetch paginated users
  const result = await api.user.getUsers({ page, limit });

  return result;
}

const Styled = {
  Title: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.medium};
  `,
  Controls: styled.div`
    display: flex;
    gap: ${tokens.spacings.comfortable.small};
    margin-bottom: ${tokens.spacings.comfortable.large};
    padding: ${tokens.spacings.comfortable.small};
    background-color: ${tokens.colors.ui.background__light.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    align-items: center;
    flex-wrap: wrap;
  `,
  FormGroup: styled.div`
    display: flex;
    flex-direction: column;
    gap: ${tokens.spacings.comfortable.x_small};
  `,
  Label: styled.label`
    font-size: ${tokens.typography.paragraph.caption.fontSize};
    font-weight: ${tokens.typography.paragraph.body_short_bold.fontWeight};
    color: ${tokens.colors.text.static_icons__default.hex};
  `,
  Input: styled.input`
    padding: ${tokens.spacings.comfortable.x_small};
    border-radius: ${tokens.shape.corners.borderRadius};
    border: 1px solid ${tokens.colors.ui.background__medium.hex};
    font-size: ${tokens.typography.paragraph.body_short.fontSize};
    width: 100px;
  `,
  Info: styled.div`
    margin-bottom: ${tokens.spacings.comfortable.small};
    padding: ${tokens.spacings.comfortable.medium};
    background-color: ${tokens.colors.ui.background__info.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    color: ${tokens.colors.interactive.primary__resting.hex};
  `,
  ChipContainer: styled.div`
    display: flex;
    gap: ${tokens.spacings.comfortable.x_small};
    flex-wrap: wrap;
  `,
  UserList: styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
  `,
  UserItem: styled.li`
    border: 1px solid ${tokens.colors.ui.background__medium.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    padding: ${tokens.spacings.comfortable.small};
    margin-bottom: ${tokens.spacings.comfortable.small};
    background-color: ${tokens.colors.ui.background__light.hex};
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: ${tokens.elevation.raised};
    }
  `,
  UserName: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.x_small};
  `,
  UserEmail: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.x_small};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
  `,
  UserChips: styled.div`
    display: flex;
    gap: ${tokens.spacings.comfortable.x_small};
    flex-wrap: wrap;
    margin-bottom: ${tokens.spacings.comfortable.small};
  `,
  Pagination: styled.div`
    display: flex;
    gap: ${tokens.spacings.comfortable.x_small};
    justify-content: center;
    align-items: center;
    margin-top: ${tokens.spacings.comfortable.large};
  `,
  PaginationInfo: styled(Typography)`
    padding: ${tokens.spacings.comfortable.x_small} ${tokens.spacings.comfortable.small};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
  `,
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

  const goToPage = useCallback(
    (newPage: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage.toString());
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('limit', newLimit.toString());
      newParams.set('page', '1'); // Reset to first page when changing limit
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const handleRemovePage = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleRemoveLimit = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('limit');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return (
    <div>
      <Styled.Title variant="h1">Users</Styled.Title>

      <Styled.Controls>
        <Styled.FormGroup>
          <Styled.Label htmlFor="limit">Items per page</Styled.Label>
          <Styled.Input
            id="limit"
            type="number"
            min="1"
            max="20"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
          />
        </Styled.FormGroup>
      </Styled.Controls>

      <Styled.Info>
        <div style={{ marginBottom: tokens.spacings.comfortable.x_small }}>
          Showing {users.length} of {total} users (Page {page} of {totalPages})
        </div>
        {(page > 1 || limit !== 5) && (
          <Styled.ChipContainer>
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
          </Styled.ChipContainer>
        )}
      </Styled.Info>

      <Styled.UserList>
        {users.map((user) => (
          <Styled.UserItem key={user.id}>
            <Styled.UserName variant="h3">{user.name}</Styled.UserName>
            <Styled.UserEmail variant="body_short">{user.email}</Styled.UserEmail>
            <Styled.UserChips>
              <Chip variant={getRoleChipVariant(user.role)}>{user.role}</Chip>
              <Chip variant={getDepartmentChipVariant(user.department)}>{user.department}</Chip>
            </Styled.UserChips>
            <Button variant="contained" as={Link} to={`/users/${user.id}`}>
              View Profile
            </Button>
          </Styled.UserItem>
        ))}
      </Styled.UserList>

      <Styled.Pagination>
        <Button variant="outlined" onClick={() => goToPage(page - 1)} disabled={!hasPrev}>
          Previous
        </Button>
        <Styled.PaginationInfo variant="body_short">
          Page {page} of {totalPages}
        </Styled.PaginationInfo>
        <Button variant="outlined" onClick={() => goToPage(page + 1)} disabled={!hasNext}>
          Next
        </Button>
      </Styled.Pagination>
    </div>
  );
}
