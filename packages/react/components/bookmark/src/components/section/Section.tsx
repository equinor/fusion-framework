import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Icon, Typography } from '@equinor/eds-core-react';
import { chevron_down, chevron_right } from '@equinor/eds-icons';

import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';

const Styled = {
  Button: styled(Button)`
        width: 100%;
        padding: 0;
        padding-top: 0.5rem;
        margin-bottom: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: none;
        border: none;
        color: ${tokens.colors.infographic.primary__moss_green_100.hex};
        cursor: pointer;
        :hover {
            background: none;
        }
    `,
  List: styled.ol`
        margin-left: 0.7rem;
        padding-left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        border-left: 1px solid ${tokens.colors.infographic.primary__moss_green_100.hex};
    `,
};

Icon.add({
  chevron_down,
  chevron_right,
});

type SectionProps = {
  readonly name: string;
  readonly children: ReactNode;
};
export const Section = ({ children, name }: SectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <Styled.Button variant="ghost" onClick={() => setIsExpanded((s) => !s)}>
        <Icon name={isExpanded ? chevron_down.name : chevron_right.name} />
        <Typography variant="h6">{name}</Typography>
      </Styled.Button>
      {isExpanded && <Styled.List>{children}</Styled.List>}
    </div>
  );
};
