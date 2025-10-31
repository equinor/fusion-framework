import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComponentRenderArgs } from '../create-component';
import type { Fusion } from '@equinor/fusion-framework-react';
import type { AppEnv } from '@equinor/fusion-framework-app';

// Mock dependencies before importing
vi.mock('../create-component', () => ({
  createComponent: vi.fn(),
}));

vi.mock('../render-component', () => ({
  renderComponent: vi.fn(),
}));

import { renderApp } from '../render-app';
import { createComponent } from '../create-component';
import { renderComponent } from '../render-component';

describe('renderApp', () => {
  let mockFusion: Fusion;
  let mockEnv: AppEnv;
  let mockElement: HTMLElement;
  let mockTeardown: () => void;
  let mockComponentRenderer: ReturnType<typeof createComponent>;
  let mockRenderFunction: ReturnType<typeof renderComponent>;

  beforeEach(() => {
    // Setup mock data
    mockFusion = {} as Fusion;
    mockEnv = {} as AppEnv;
    mockElement = document.createElement('div');
    mockTeardown = vi.fn();

    // Create a mock component renderer
    mockComponentRenderer = vi.fn(() => Promise.resolve({ default: () => null })) as unknown as ReturnType<
      typeof createComponent
    >;

    // Create a mock render function
    mockRenderFunction = vi.fn(() => mockTeardown) as unknown as ReturnType<typeof renderComponent>;

    // Mock renderComponent to return our mock render function
    vi.mocked(renderComponent).mockReturnValue(mockRenderFunction);

    // Mock createComponent to return our mock component renderer
    vi.mocked(createComponent).mockReturnValue(mockComponentRenderer);
  });

  it('should create a render function that calls createComponent with provided arguments', () => {
    const TestComponent = () => <div>Test</div>;
    const mockConfigure = vi.fn();

    renderApp(TestComponent, mockConfigure);

    expect(createComponent).toHaveBeenCalledWith(TestComponent, mockConfigure);
  });

  it('should create a render function that uses renderComponent with the component renderer', () => {
    const TestComponent = () => <div>Test</div>;
    const appRender = renderApp(TestComponent);

    // Call the render function
    const teardown = appRender(mockElement, { fusion: mockFusion, env: mockEnv });

    expect(renderComponent).toHaveBeenCalledWith(mockComponentRenderer);
    expect(mockRenderFunction).toHaveBeenCalledWith(mockElement, {
      fusion: mockFusion,
      env: mockEnv,
    });
    expect(teardown).toBe(mockTeardown);
  });

  it('should return a teardown function that unmounts the component', () => {
    const TestComponent = () => <div>Test</div>;
    const appRender = renderApp(TestComponent);

    const teardown = appRender(mockElement, { fusion: mockFusion, env: mockEnv });

    expect(typeof teardown).toBe('function');
    teardown();
    expect(mockTeardown).toHaveBeenCalled();
  });

  it('should work without a configure callback', () => {
    vi.clearAllMocks();
    const TestComponent = () => <div>Test</div>;
    const appRender = renderApp(TestComponent);

    // When no configure callback is provided, it may be called with just the component
    // or with undefined as the second parameter
    expect(createComponent).toHaveBeenCalled();
    const calls = vi.mocked(createComponent).mock.calls;
    expect(calls[calls.length - 1][0]).toBe(TestComponent);
    expect(calls[calls.length - 1][1]).toBeUndefined();

    const teardown = appRender(mockElement, { fusion: mockFusion, env: mockEnv });

    expect(teardown).toBe(mockTeardown);
  });

  it('should pass component renderer args correctly to renderComponent', () => {
    const TestComponent = () => <div>Test</div>;
    const appRender = renderApp(TestComponent);

    const args: ComponentRenderArgs = {
      fusion: mockFusion,
      env: mockEnv,
    };

    appRender(mockElement, args);

    expect(mockRenderFunction).toHaveBeenCalledWith(mockElement, args);
  });
});

