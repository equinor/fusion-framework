import type { Module } from '@equinor/fusion-framework-module';

import {
  StateModuleConfigurator,
  type IStateModuleConfigurator,
} from './StateModuleConfigurator.js';

import type { IStateProvider } from './StateProvider.interface.js';
import StateProvider from './StateProvider.js';
import { name } from './name.js';

/**
 * Represents a module for managing application state within the Fusion framework.
 *
 * @typeParam name - The name of the module.
 * @typeParam IStateProvider - The interface for the state provider implementation.
 * @typeParam IStateModuleConfigurator - The interface for configuring the state module.
 *
 * @see Module
 */
export type StateModule = Module<typeof name, IStateProvider, IStateModuleConfigurator>;

/**
 * Represents the State module definition for the Fusion framework.
 *
 * @remarks
 * This module provides configuration and initialization logic for state management.
 *
 * @property {string} name - The name of the module.
 * @property {() => StateModuleConfigurator} configure - Returns a new instance of the state module configurator.
 * @property {(init: any) => Promise<StateProvider>} initialize - Asynchronously initializes the state provider using the configuration.
 */
