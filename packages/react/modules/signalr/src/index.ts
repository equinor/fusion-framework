/**
 * React integration for the Fusion SignalR module.
 *
 * Provides hooks for subscribing to SignalR hub topics from React components.
 * Use {@link useTopic} for module-scoped access or {@link useSignalRProvider}
 * when injecting a provider explicitly.
 *
 * @see {@link enableSignalR} to enable the module in a configurator.
 *
 * @packageDocumentation
 */
export { useSignalRProvider as useProviderTopic } from './use-signalr-provider';
export { useTopic } from './use-signalr';

export { Topic, enableSignalR } from '@equinor/fusion-framework-module-signalr';

export type {
  ISignalRConfigurator,
  SignalRHubConfig,
  SignalRModule,
} from '@equinor/fusion-framework-module-signalr';
