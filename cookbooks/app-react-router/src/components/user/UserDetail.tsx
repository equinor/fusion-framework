import { Chip, Typography } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';

const Styled = {
  Header: styled.div`
    border-bottom: 2px solid ${tokens.colors.ui.background__medium.hex};
    padding-bottom: ${tokens.spacings.comfortable.large};
    margin-bottom: ${tokens.spacings.comfortable.large};
  `,
  Title: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.x_small};
    color: ${tokens.colors.text.static_icons__default.hex};
  `,
  Email: styled(Typography)`
    color: ${tokens.colors.text.static_icons__tertiary.hex};
    margin-bottom: ${tokens.spacings.comfortable.medium};
  `,
  ChipContainer: styled.div`
    display: flex;
    gap: ${tokens.spacings.comfortable.x_small};
    flex-wrap: wrap;
  `,
  Section: styled.section`
    margin-bottom: ${tokens.spacings.comfortable.large};
  `,
  SectionTitle: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.medium};
    color: ${tokens.colors.text.static_icons__default.hex};
    border-bottom: 1px solid ${tokens.colors.ui.background__medium.hex};
    padding-bottom: ${tokens.spacings.comfortable.x_small};
  `,
  InfoGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${tokens.spacings.comfortable.medium};
  `,
  InfoItem: styled.div`
    padding: ${tokens.spacings.comfortable.medium};
    background-color: ${tokens.colors.ui.background__light.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
  `,
  InfoLabel: styled.div`
    font-size: ${tokens.typography.paragraph.caption.fontSize};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
    margin-bottom: ${tokens.spacings.comfortable.x_small};
    text-transform: uppercase;
  `,
  InfoValue: styled.div`
    font-size: ${tokens.typography.paragraph.body_short.fontSize};
    color: ${tokens.colors.text.static_icons__default.hex};
    font-weight: ${tokens.typography.paragraph.body_short_bold.fontWeight};
  `,
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  location: string;
  joinDate: string;
};

interface UserDetailProps {
  user: User;
}

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

/**
 * User detail component displaying user information
 * @param user - User object to display
 */
export function UserDetail({ user }: UserDetailProps) {
  return (
    <>
      <Styled.Header>
        <Styled.Title variant="h1">{user.name}</Styled.Title>
        <Styled.Email variant="body_short">{user.email}</Styled.Email>
        <Styled.ChipContainer>
          <Chip variant={getRoleChipVariant(user.role)}>{user.role}</Chip>
          <Chip variant={getDepartmentChipVariant(user.department)}>{user.department}</Chip>
        </Styled.ChipContainer>
      </Styled.Header>

      <Styled.Section>
        <Styled.SectionTitle variant="h2">Contact Information</Styled.SectionTitle>
        <Styled.InfoGrid>
          <Styled.InfoItem>
            <Styled.InfoLabel>Email</Styled.InfoLabel>
            <Styled.InfoValue>{user.email}</Styled.InfoValue>
          </Styled.InfoItem>
          <Styled.InfoItem>
            <Styled.InfoLabel>Phone</Styled.InfoLabel>
            <Styled.InfoValue>{user.phone}</Styled.InfoValue>
          </Styled.InfoItem>
          <Styled.InfoItem>
            <Styled.InfoLabel>Location</Styled.InfoLabel>
            <Styled.InfoValue>{user.location}</Styled.InfoValue>
          </Styled.InfoItem>
          <Styled.InfoItem>
            <Styled.InfoLabel>Join Date</Styled.InfoLabel>
            <Styled.InfoValue>{user.joinDate}</Styled.InfoValue>
          </Styled.InfoItem>
        </Styled.InfoGrid>
      </Styled.Section>

      <Styled.Section>
        <Styled.SectionTitle variant="h2">Role & Department</Styled.SectionTitle>
        <Styled.InfoGrid>
          <Styled.InfoItem>
            <Styled.InfoLabel>Role</Styled.InfoLabel>
            <Styled.InfoValue>{user.role}</Styled.InfoValue>
          </Styled.InfoItem>
          <Styled.InfoItem>
            <Styled.InfoLabel>Department</Styled.InfoLabel>
            <Styled.InfoValue>{user.department}</Styled.InfoValue>
          </Styled.InfoItem>
        </Styled.InfoGrid>
      </Styled.Section>
    </>
  );
}
