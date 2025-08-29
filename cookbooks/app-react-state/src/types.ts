/**
 * Shared TypeScript types for the State Module Cookbook
 */

/**
 * User profile data structure demonstrating object state management
 */
export type UserProfile = {
  /** User's display name */
  name: string;
  /** User's age in years */
  age: number;
  /** UI theme preference */
  theme: 'light' | 'dark';
  /** Whether the user is currently active */
  isActive: boolean;
};

/**
 * Supported language options for the application
 */
export type Language = 'en' | 'no' | 'es';
