import {
  ApplicationInsights,
  type Snippet,
  type IPlugin,
} from '@microsoft/applicationinsights-web';

import { TelemetryType } from '../static';

import type {
  TelemetryAdapter,
  TelemetryItem,
  TelemetryException,
  TelemetryMetric,
} from '../types';

export type ApplicationInsightsClientConfig = {
  snippet: Snippet;
  identifier: string;
  /** filter function to determine if item should be processed */
  filter?: (item: TelemetryItem) => boolean;
  prefix?: string;
};

export class ApplicationInsightsAdapter implements TelemetryAdapter {
  readonly #identifier: string;
  readonly #client: ApplicationInsights;

  public get identifier(): string {
    return this.#identifier;
  }

  processItem: (item: TelemetryItem) => void;

  constructor(args: ApplicationInsightsClientConfig) {
    const { snippet, filter } = args;
    this.#client = new ApplicationInsights(snippet);

    this.#client.loadAppInsights();

    this.#identifier = args.identifier;

    this.processItem = (item: TelemetryItem) => {
      if (filter && !filter(item)) return;

      const name = args.prefix ? `${args.prefix}.${item.name}` : item.name;

      this._track({ ...item, name });
    };
  }

  public addPlugin(plugin: IPlugin): void {
    this.#client.addPlugin(plugin);
  }

  public setAuthenticatedUserContext(userId: string): void {
    this.#client.setAuthenticatedUserContext(userId);
  }

  protected _track(item: TelemetryItem): void {
    const { name, level, type } = item;
    const properties = {
      ...item.properties,
      metadata: item.metadata,
    };
    // process item by type
    switch (type) {
      case TelemetryType.Event: {
        this.#client.trackEvent({ name, properties });
        break;
      }
      case TelemetryType.Exception: {
        const { exception } = item as TelemetryException;
        this.#client.trackException({ exception, properties, severityLevel: level });
        break;
      }
      case TelemetryType.Metric: {
        const { value } = item as TelemetryMetric;
        this.#client.trackMetric({ name, properties, average: value });
        break;
      }
    }
  }
}
