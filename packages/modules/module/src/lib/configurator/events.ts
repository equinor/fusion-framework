/** Shared base segment for module configurator lifecycle event names. */
export const ModuleConfiguratorEventBaseName = 'ModuleConfigurator';

/**
 * Event names emitted by `ModulesConfigurator` and its lifecycle phase helpers.
 *
 * Use this map instead of inline string literals when emitting or filtering
 * configurator lifecycle events. Each value follows the
 * `ModuleConfigurator.{name}.{state}` convention. The emitted names are still
 * prefixed by `ModulesConfigurator::_registerEvent` at runtime.
 */
export const ModuleConfiguratorEventName = {
  ModuleConfigAdded: `${ModuleConfiguratorEventBaseName}.module.configAdded`,
  OnConfiguredAdded: `${ModuleConfiguratorEventBaseName}.onConfigured.added`,
  OnInitializedAdded: `${ModuleConfiguratorEventBaseName}.onInitialized.added`,
  PluginAdded: `${ModuleConfiguratorEventBaseName}.plugin.added`,
  InitializeConfigLoaded: `${ModuleConfiguratorEventBaseName}.config.loaded`,
  InitializeInstanceInitialized: `${ModuleConfiguratorEventBaseName}.instance.initialized`,
  Initialize: `${ModuleConfiguratorEventBaseName}.initialize.complete`,

  ConfiguratorCreated: `${ModuleConfiguratorEventBaseName}.configurator.created`,
  ConfiguratorFailed: `${ModuleConfiguratorEventBaseName}.configurator.failed`,
  ModulePostConfigured: `${ModuleConfiguratorEventBaseName}.module.postConfigured`,
  ModulePostConfigureError: `${ModuleConfiguratorEventBaseName}.module.postConfigureError`,
  PostConfigureHooks: `${ModuleConfiguratorEventBaseName}.postConfigureHooks.started`,
  PostConfigureHooksComplete: `${ModuleConfiguratorEventBaseName}.postConfigureHooks.complete`,
  PostConfigureHooksError: `${ModuleConfiguratorEventBaseName}.postConfigureHooks.error`,

  ModuleInitializeError: `${ModuleConfiguratorEventBaseName}.module.initializeError`,
  ModuleInitializing: `${ModuleConfiguratorEventBaseName}.module.initializing`,
  ProviderNotBaseModuleProvider: `${ModuleConfiguratorEventBaseName}.provider.invalidBase`,
  ProviderVersionWarning: `${ModuleConfiguratorEventBaseName}.provider.versionMissing`,
  ModuleInitialized: `${ModuleConfiguratorEventBaseName}.module.initialized`,
  RequireInstanceModuleNotDefined: `${ModuleConfiguratorEventBaseName}.requireInstance.moduleNotDefined`,
  RequireInstanceModuleAlreadyInitialized: `${ModuleConfiguratorEventBaseName}.requireInstance.moduleAlreadyInitialized`,
  RequireInstanceAwaitingModule: `${ModuleConfiguratorEventBaseName}.requireInstance.awaitingModule`,
  RequireInstanceTimeout: `${ModuleConfiguratorEventBaseName}.requireInstance.timeout`,
  RequireInstanceModuleResolved: `${ModuleConfiguratorEventBaseName}.requireInstance.moduleResolved`,
  ModuleInitializeComplete: `${ModuleConfiguratorEventBaseName}.modules.initializeComplete`,
  InitializeComplete: `${ModuleConfiguratorEventBaseName}.initialize.instanceComplete`,

  ConfiguratorPostInitializeStart: `${ModuleConfiguratorEventBaseName}.postInitialize.started`,
  ModulePostInitializeStart: `${ModuleConfiguratorEventBaseName}.modulePostInitialize.started`,
  ModulePostInitializeComplete: `${ModuleConfiguratorEventBaseName}.modulePostInitialize.complete`,
  ModulePostInitializeError: `${ModuleConfiguratorEventBaseName}.modulePostInitialize.error`,
  PostInitializeComplete: `${ModuleConfiguratorEventBaseName}.postInitialize.complete`,
  PostInitializeCompleteNoHooks: `${ModuleConfiguratorEventBaseName}.postInitialize.noHooks`,
  PostInitializeHooks: `${ModuleConfiguratorEventBaseName}.postInitializeHooks.started`,
  PostInitializeHooksComplete: `${ModuleConfiguratorEventBaseName}.postInitializeHooks.complete`,
  PostInitializeHooksError: `${ModuleConfiguratorEventBaseName}.postInitializeHooks.error`,

  PluginsRegister: `${ModuleConfiguratorEventBaseName}.plugins.registering`,
  PluginRegistered: `${ModuleConfiguratorEventBaseName}.plugin.registered`,
  PluginRegisterError: `${ModuleConfiguratorEventBaseName}.plugin.registerError`,
  PluginsRegistered: `${ModuleConfiguratorEventBaseName}.plugins.registered`,

  Dispose: `${ModuleConfiguratorEventBaseName}.dispose.started`,
  PluginsDisposing: `${ModuleConfiguratorEventBaseName}.plugins.disposing`,
  PluginDisposed: `${ModuleConfiguratorEventBaseName}.plugin.disposed`,
  PluginDisposeError: `${ModuleConfiguratorEventBaseName}.plugin.disposeError`,
  ModulesDispose: `${ModuleConfiguratorEventBaseName}.modules.disposing`,
  ModuleDisposed: `${ModuleConfiguratorEventBaseName}.module.disposed`,
  ModuleDisposeError: `${ModuleConfiguratorEventBaseName}.module.disposeError`,
  ModulesDisposed: `${ModuleConfiguratorEventBaseName}.modules.disposed`,
} as const;

/** Event name value emitted by the module configurator lifecycle. */
export type ModuleConfiguratorEventName =
  (typeof ModuleConfiguratorEventName)[keyof typeof ModuleConfiguratorEventName];
