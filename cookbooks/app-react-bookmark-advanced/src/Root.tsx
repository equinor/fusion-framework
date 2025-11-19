import { Link, Outlet } from 'react-router-dom';
import { Provider } from './Provider';
import { BookmarkAppNavigation } from './BoomarkAppNavigation';
import Create from './Create';

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
