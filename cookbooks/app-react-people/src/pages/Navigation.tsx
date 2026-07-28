import { Outlet, useNavigate } from '@equinor/fusion-framework-react-router';
import { Button } from '@equinor/eds-core-react';
import { FlexGrid } from '../flex-grid';

/**
 * Renders the sticky navigation used to switch between people component examples.
 *
 * @returns Navigation controls followed by the active route outlet.
 */
const Navigation = () => {
  const navigate = useNavigate();
  return (
    <>
      <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
        <h1>People Components</h1>
        <FlexGrid>
          <Button onClick={() => navigate('')}>Home</Button>
          <Button onClick={() => navigate('avatar')}>PersonAvatar</Button>
          <Button onClick={() => navigate('card')}>PersonCard</Button>
          <Button onClick={() => navigate('list-item')}>PersonListItem</Button>
          <Button onClick={() => navigate('selector')}>PersonSelect</Button>
          <Button onClick={() => navigate('people-concepts')}>PeopleConcepts</Button>
        </FlexGrid>
      </div>
      <Outlet />
    </>
  );
};

export default Navigation;
