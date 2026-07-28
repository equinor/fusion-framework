import { Link, Outlet } from '@equinor/fusion-framework-react-router';
import { Provider } from './Provider';
import { BookmarkAppNavigation } from './BookmarkAppNavigation';
import Create from './Create';

/** Renders the provider-backed layout used by the advanced bookmark example. */
export default function Root() {
  return (
    <Provider>
      <BookmarkAppNavigation>
        <section style={{ display: 'inline-flex', gap: 10 }}>
          <Link to={''}>Home</Link>
          <Link to={'page1'}>Page 1</Link>
          <Link to={'page2'}>Page 2</Link>
        </section>

        <Outlet />

        <Create />
      </BookmarkAppNavigation>
    </Provider>
  );
}
