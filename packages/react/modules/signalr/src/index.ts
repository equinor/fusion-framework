/**
 * React integration for the Fusion SignalR module.
 *
 * Provides hooks for subscribing to SignalR hub topics from React components.
 * Use {@link useTopic} for module-scoped access or {@link useProviderTopic}
 * when injecting a provider explicitly.
 *
 * @see {@link enableSignalR} to enable the module in a configurator.
 *
 * @packageDocumentation
 */
export { useSignalRProvider as useProviderTopic } from './useSignalRProvider';
export { useTopic } from './useTopic';

export { Topic, enableSignalR } from '@equinor/fusion-framework-module-signalr';

export type {
  ISignalRConfigurator,
  SignalRHubConfig,
  SignalRModule,
} from '@equinor/fusion-framework-module-signalr';
