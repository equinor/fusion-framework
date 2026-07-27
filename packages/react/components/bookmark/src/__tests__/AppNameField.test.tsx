import { isValidElement } from 'react';
import { Input, Progress } from '@equinor/eds-core-react';
import { describe, expect, it } from 'vitest';
import { AppNameField } from '../components/edit-bookmark/AppNameField';

describe('AppNameField', () => {
  it('shows an accessible progress indicator while the manifest is loading', () => {
    const field = AppNameField({ isLoading: true });
    const loadingIndicator = field.props.rightAdornments;

    expect(field.type).toBe(Input);
    expect(field.props['aria-busy']).toBe(true);
    expect(isValidElement(loadingIndicator)).toBe(true);

    // Guard the element shape before inspecting progress-specific props.
    if (!isValidElement(loadingIndicator)) {
      throw new Error('Expected a valid loading indicator');
    }

    expect(loadingIndicator.type).toBe(Progress.Circular);
    expect(loadingIndicator.props).toMatchObject({
      'aria-label': 'Loading app name',
      size: 16,
    });
  });

  it('shows the resolved display name without a progress indicator', () => {
    const field = AppNameField({
      displayName: 'My app',
      isLoading: false,
    });

    expect(field.props.value).toBe('My app');
    expect(field.props['aria-busy']).toBe(false);
    expect(field.props.rightAdornments).toBeUndefined();
  });
});
