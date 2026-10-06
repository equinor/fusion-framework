/**
 * @packageDocumentation
 *
 * Fusion Framework module for real-time communication via
 * [SignalR](https://learn.microsoft.com/aspnet/core/signalr/introduction).
 *
 * Provides an RxJS-based API for connecting to SignalR hubs, subscribing to
 * server-side methods, and sending messages. Hub connections are reference-counted
 * and automatically stopped when no subscribers remain.
 *
 * @see {@link enableSignalR} for the quickest way to register the module.
 * @see {@link ISignalRProvider.connect} for subscribing to hub methods at runtime.
 */

export {
  ISignalRConfigurator,
  SignalRConfig,
  SignalRHubConfig,
  SignalRModuleConfigBuilder,
  SignalRModuleConfigBuilderCallback,
} from './SignalRModuleConfigBuilder.js';

export { SignalRConfigurator } from './SignalRConfigurator.js';

export { ISignalRProvider, SignalRModuleProvider } from './SignalRModuleProvider.js';

export { Topic } from './lib/Topic.js';

export { enableSignalR } from './lib/utils/enable-signalr.js';

export { default, module, moduleKey, SignalRModule, SignalRModuleKey } from './SignalRModule.js';
