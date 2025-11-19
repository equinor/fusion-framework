import { Chip } from '@equinor/eds-core-react';
import { styles } from './UserDetail.styles';

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
      <div style={styles.header}>
        <h1 style={styles.title}>{user.name}</h1>
        <div style={styles.email}>{user.email}</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Chip variant={getRoleChipVariant(user.role)}>{user.role}</Chip>
          <Chip variant={getDepartmentChipVariant(user.department)}>{user.department}</Chip>
        </div>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Contact Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Email</div>
            <div style={styles.infoValue}>{user.email}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Phone</div>
            <div style={styles.infoValue}>{user.phone}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Location</div>
            <div style={styles.infoValue}>{user.location}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Join Date</div>
            <div style={styles.infoValue}>{user.joinDate}</div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Role & Department</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Role</div>
            <div style={styles.infoValue}>{user.role}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Department</div>
            <div style={styles.infoValue}>{user.department}</div>
          </div>
        </div>
      </section>
    </>
  );
}
