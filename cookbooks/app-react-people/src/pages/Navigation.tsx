import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@equinor/eds-core-react';
import { FlexGrid } from '../Styled';

export const Navigation = () => {
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
        </FlexGrid>
      </div>
      <Outlet></Outlet>
    </>
  );
};
