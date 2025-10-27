import { type ReactElement, useState } from 'react';
import { BasicExample, ChartsExample } from './tabs';
import { Tabs, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

const Styled = {
  Container: styled.div`
    padding: 3rem 2rem;
  `,
  Tabs: styled(Tabs.List)`
    margin: 2rem 0 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
};

export const App = (): ReactElement => {
  // Tab state for switching between examples
  const [activeTab, setActiveTab] = useState<number | string>(0);

  const handleChange = (index: number | string) => {
    setActiveTab(index);
  };

  return (
    <Styled.Container>
      <Typography group="heading" variant="h2">
        Fusion Framework AG Grid Cookbook
      </Typography>
      <Tabs activeTab={activeTab} onChange={handleChange}>
        <Styled.Tabs>
          <Tabs.Tab>Basic Example</Tabs.Tab>
          <Tabs.Tab>Charts Example</Tabs.Tab>
        </Styled.Tabs>
        <Tabs.Panels conditionalRender>
          <Tabs.Panel>
            <BasicExample />
          </Tabs.Panel>
          <Tabs.Panel>
            <ChartsExample />
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    </Styled.Container>
  );
};

export default App;
