import {
  ApplicationInsights,
  type Snippet,
  type IPlugin,
} from '@microsoft/applicationinsights-web';

import {
  TelemetryType,
  BaseTelemetryAdapter,
  type TelemetryItem,
  type TelemetryException,
  type TelemetryMetric,
} from '@equinor/fusion-framework-module-telemetry';

/**
 * Configuration options for the Application Insights client.
 *
 * @property snippet - The Application Insights snippet configuration.
 * @property plugins - Optional array of plugins to extend Application Insights functionality.
 * @property identifier - Optional unique identifier for the client instance, defaults to 'application-insights'.
 * @property filter - Optional filter function to determine if a telemetry item should be processed.
 * @property prefix - Optional prefix to prepend to telemetry item names.
 */
export type ApplicationInsightsClientConfig = {
  snippet: Snippet;
  plugins?: IPlugin[];
  identifier?: string;
  /** filter function to determine if item should be processed */
  filter?: (item: TelemetryItem) => boolean;
  prefix?: string;
};

/**
 * Adapter class for integrating Application Insights telemetry into the framework.
 *
 * @remarks
 * This adapter extends {@link BaseTelemetryAdapter} and provides methods to send telemetry data
 * such as events, exceptions, and metrics to Application Insights. It supports optional prefixing
 * of telemetry item names and allows for plugin registration.
 *
 * @example
 * ```typescript
 * const adapter = new ApplicationInsightsAdapter({
 *   snippet: { /* Application Insights config *\/ },
 *   prefix: 'myApp',
 *   plugins: [myPlugin],
 * });
 * ```
 *
 * @public
 */
export class ApplicationInsightsAdapter extends BaseTelemetryAdapter {
  static readonly Identifier = 'application-insights';

  readonly #client: ApplicationInsights;
  readonly #preFix?: string;

  constructor(args: ApplicationInsightsClientConfig) {
    super(args.identifier ?? ApplicationInsightsAdapter.Identifier, args.filter);
    this.#client = new ApplicationInsights(args.snippet);
    this.#client.loadAppInsights();
    this.#preFix = args.prefix;
    for (const plugin of args.plugins ?? []) {
      this.#client.addPlugin(plugin);
    }
  }

  /**
   * Sets the authenticated user context for telemetry data.
   *
   * Associates all subsequent telemetry events with the specified user ID,
   * allowing for user-specific tracking and analysis in Application Insights.
   *
   * @param userId - The unique identifier of the authenticated user.
   */
  public setAuthenticatedUserContext(userId: string): void {
    this.#client.setAuthenticatedUserContext(userId);
  }

  /**
   * Processes a telemetry item by applying a prefix to its name (if configured)
   * and forwarding it to the Application Insights client for tracking.
   *
   * @param item - The telemetry item to be processed, containing details such as name, level, type, and additional properties.
   *
   * @internal
   * @protected
   */
  protected _processItem(item: TelemetryItem): void {
    const name = this.#preFix ? `${this.#preFix}.${item.name}` : item.name;
    this._track({ ...item, name });
  }

  /**
   * Tracks a telemetry item by processing it according to its type and forwarding it to the Application Insights client.
   *
   * @param item - The telemetry item to be tracked, containing details such as name, level, type, and additional properties.
   *
   * @remarks
   * - For `TelemetryType.Event`, tracks an event with the specified name and properties.
   * - For `TelemetryType.Exception`, tracks an exception with the provided exception object, properties, and severity level.
   * - For `TelemetryType.Metric`, tracks a metric with the specified name, properties, and value as the average.
   *
   * @internal
   * @protected
   */
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
