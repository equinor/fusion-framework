import { BaseConfigBuilder } from '@equinor/fusion-framework-module';

import type { TelemetryAdapter } from './types.js';
import type { ITelemetryConfigurator, TelemetryConfig } from './TelemetryConfigurator.interface.js';

export class TelemetryConfigurator
  extends BaseConfigBuilder<TelemetryConfig>
  implements ITelemetryConfigurator
{
  #adapters: Record<string, TelemetryAdapter> = {};

  constructor() {
    super();
    this._set('adapters', async () => Object.values(this.#adapters));
  }

  public setAdapter(adapter: TelemetryAdapter): this {
    this.#adapters[String(adapter.identifier)] = adapter;
    return this;
  }

  public setMetadata(metadata: TelemetryConfig['metadata']) {
    this._set('metadata', metadata);
    return this;
  }

  public setDefaultScope(scope: string[]): this {
    this._set('defaultScope', scope);
    return this;
  }
}
