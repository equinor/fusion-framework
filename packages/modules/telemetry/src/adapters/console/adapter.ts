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

  protected _generateTitleBackground(lvl: TelemetryLevel): string {
    switch (lvl) {
      case TelemetryLevel.Error:
        return 'rgb(250, 138, 161)';
      case TelemetryLevel.Warning:
        return 'rgb(251, 203, 131)';
      case TelemetryLevel.Information:
        return 'rgb(200, 200, 200)';
      case TelemetryLevel.Debug:
        return 'rgb(150, 150, 150)';
      default:
        return 'none';
    }
  }

  protected _formatMetric = (value: number): string => {
    if (value < 1000) {
      return `${Math.round(value)}ms`;
    }
    if (value < 60000) {
      return `${(value / 1000).toFixed(1)}s`;
    }
    const minutes = Math.floor(value / 60000);
    const seconds = Math.floor((value % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  protected _generateTitle(name: string, lvl: TelemetryLevel): string[] {
    return [
      '%c %s %c %s %c',
      'background: rgb(179, 13, 47); color: white; padding: 1px;',
      this.#title,
      `background: ${this._generateTitleBackground(lvl)}; color: rgb(50, 50, 50); padding: 1px;`,
      name,
      'background: none; color: inherit',
    ];
  }

  protected _processItem(item: TelemetryItem): void {
    const { name, type, level, properties, metadata, scope } = item;

    const baseData = {
      properties,
      metadata,
      scope,
    };

    switch (type) {
      case TelemetryType.Event:
        this._log(level, name, baseData);
        break;
      case TelemetryType.Exception: {
        const exception = (item as TelemetryException).exception;
        this._log(level, name, baseData, exception);
        break;
      }
      case TelemetryType.Metric: {
        const metric = (item as TelemetryMetric).value;
        this._log(level, name, `⏱️${this._formatMetric(metric)}`, baseData);
        break;
      }
    }
  }

  protected _log(lvl: TelemetryLevel, title: string, ...msg: unknown[]): void {
    switch (lvl) {
      case TelemetryLevel.Error:
        console.error(...this._generateTitle(title, lvl), ...msg);
        break;
      case TelemetryLevel.Warning:
        console.warn(...this._generateTitle(title, lvl), ...msg);
        break;
      case TelemetryLevel.Information:
        console.info(...this._generateTitle(title, lvl), ...msg);
        break;
      case TelemetryLevel.Debug:
        console.debug(...this._generateTitle(title, lvl), ...msg);
        break;
      default:
        console.log(...this._generateTitle(title, lvl), ...msg);
    }
  }
}

export default ConsoleAdapter;
