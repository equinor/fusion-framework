import {
  BaseTelemetryAdapter,
  TelemetryType,
  TelemetryLevel,
  type TelemetryItem,
  type TelemetryException,
  type TelemetryMetric,
} from '@equinor/fusion-framework-module-telemetry';

export type ConsoleAdapterConfig = {
  identifier?: string;
  filter?: (item: TelemetryItem) => boolean;
  title?: string;
};

export class ConsoleAdapter extends BaseTelemetryAdapter {
  static readonly Identifier = 'console-adapter';

  #title: string;

  constructor(config?: ConsoleAdapterConfig) {
    super(config?.identifier ?? ConsoleAdapter.Identifier, config?.filter);
    this.#title = config?.title ?? 'Fusion';
  }

  _generateTitle(name: string): string[] {
    return [
      '%c%s%c%s%c',
      'background: rgb(179, 13, 47); color: white; padding: 1px;',
      this.#title,
      'background: rgb(244, 244, 244); color: rgb(36, 55, 70); padding: 1px;',
      name,
      'background: none; color: inherit',
    ];
  }

  protected _processItem(item: TelemetryItem): void {
    const { name, type, level, properties, metadata } = item;

    switch (type) {
      case TelemetryType.Event:
        this._log(level, name, { ...properties, metadata });
        break;
      case TelemetryType.Exception: {
        const exception = (item as TelemetryException).exception;
        this._log(level, name, { ...properties, metadata }, exception);
        break;
      }
      case TelemetryType.Metric: {
        const metric = (item as TelemetryMetric).value;
        this._log(level, name, { metric }, { ...properties, metadata });
        break;
      }
    }
  }

  protected _log(lvl: TelemetryLevel, title: string, ...msg: unknown[]): void {
    switch (lvl) {
      case TelemetryLevel.Error:
        console.error(...this._generateTitle(title), ...msg);
        break;
      case TelemetryLevel.Warning:
        console.warn(...this._generateTitle(title), ...msg);
        break;
      case TelemetryLevel.Information:
        console.info(...this._generateTitle(title), ...msg);
        break;
      case TelemetryLevel.Debug:
        console.debug(...this._generateTitle(title), ...msg);
        break;
      default:
        console.log(...this._generateTitle(title), ...msg);
    }
  }
}

export default ConsoleAdapter;
