import { Link } from 'react-router-dom';
import type {
  LoaderFunctionArgs,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';
import { styles } from './UserPage.styles';
import { UserDetail } from '../components/user/UserDetail';
import type { User } from '../api/UserApi';

export const handle = {
  route: {
    description: 'User profile page',
    params: {
      id: 'User identifier',
    },
  },
} satisfies RouterHandle;

type UserPageLoaderData = {
  user: User;
};

export const clientLoader = async ({
  params,
  fusion,
}: LoaderFunctionArgs<{ id: string }>): Promise<UserPageLoaderData> => {
  if (!params.id) {
    throw new Response('User ID is required', { status: 400 });
  }
  const userId = parseInt(params.id, 10);

  // Use the unified API from context
  const { api } = fusion.context;

  try {
    const user = await api.user.getUser(userId);
    return { user };
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      throw new Response('User not found', { status: 404 });
    }
    throw new Response('Failed to fetch user', { status: 500 });
  }
};

export default function UserPage(props: RouteComponentProps<UserPageLoaderData>) {
  const { loaderData } = props;
  const { user } = loaderData;

  return (
    <>
      <Link to="/users" style={styles.backLink}>
        ← Back to Users
      </Link>
      <UserDetail user={user} />
    </>
  );
}
