import { Link } from '@equinor/fusion-framework-react-router';
import type {
  LoaderFunctionArgs,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';
import { UserDetail } from '../../../components/user/UserDetail';
import type { User } from '../../../api/UserApi';

export const handle = {
  route: {
    description: 'User profile page',
    params: {
      id: 'User identifier',
    },
  },
} as const satisfies RouterHandle;

const Styled = {
  BackLink: styled(Link)`
    display: inline-block;
    margin-bottom: ${tokens.spacings.comfortable.small};
    color: ${tokens.colors.interactive.primary__resting.hex};
    text-decoration: none;
    font-size: ${tokens.typography.paragraph.caption.fontSize};
  `,
};

type UserPageLoaderData = {
  user: User;
};

/**
 * Loads one user profile from the identifier in the route path.
 * @param params - Route parameters containing the user identifier.
 * @param fusion - Fusion context containing the shared user API.
 * @returns The loaded user profile.
 * @throws {Response} When the identifier is missing, invalid, or cannot be loaded.
 */
export async function clientLoader({
  params,
  fusion,
}: LoaderFunctionArgs<{ id: string }>): Promise<UserPageLoaderData> {
  // Fail early because the detail route cannot identify a user without its path parameter.
  if (!params.id) {
    throw new Response('User ID is required', { status: 400 });
  }
  const userId = parseInt(params.id, 10);
  // Reject non-numeric path values before calling the users API.
  if (!Number.isFinite(userId)) {
    throw new Response('Invalid user ID', { status: 400 });
  }

  // Use the unified API from context
  const { api } = fusion.context;

  try {
    const user = await api.user.getUser(userId);
    return { user };
  } catch (error) {
    // Preserve the API's not-found condition as a route-level 404 response.
    if (error instanceof Error && error.message === 'User not found') {
      throw new Response('User not found', { status: 404 });
    }
    throw new Response('Failed to fetch user', { status: 500 });
  }
}

/**
 * Renders the selected user's profile details.
 * @param props - Route props containing the loaded user.
 * @returns The user detail page.
 */
export default function UserPage(props: RouteComponentProps<UserPageLoaderData>) {
  const { loaderData } = props;
  const { user } = loaderData;

  return (
    <>
      <Styled.BackLink to="/users">← Back to Users</Styled.BackLink>
      <UserDetail user={user} />
    </>
  );
}
