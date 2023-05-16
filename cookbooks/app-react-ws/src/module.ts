import {
  Module,
  ModuleInitializerArgs,
  IModulesConfigurator,
} from '@equinor/fusion-framework-module';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export const moduleKey = 'WS';

export interface WSModuleConfig {
  endpoint: string;
}

export interface IWSProvider<MessageDataType = string> {
  readonly config: WSModuleConfig;
  readonly messages$: Observable<Message<MessageDataType>>;
  send(data: MessageDataType): void;
}

export interface IWSConfigurator {
  setEndpoint(endpoint: string): void;
}

type MessageType = 'recieved' | 'sent';

export interface Message<T = string> {
  type: MessageType;
  msg: T;
}

export class WSProvider<MessageDataType = string> implements IWSProvider<MessageDataType> {
  config: WSModuleConfig;
  subject$: WebSocketSubject<Message<MessageDataType>>;

  public get messages$() {
    return this.subject$.asObservable();
  }

  constructor(config: WSModuleConfig) {
    this.config = config;

    this.subject$ = webSocket<Message<MessageDataType>>({
      url: this.config.endpoint,
      deserializer: (e: MessageEvent) => {
        const obj = JSON.parse(e.data) as Message<MessageDataType>;
        obj.type = 'recieved';
        return obj;
      },
    });
  }

  send(data: MessageDataType) {
    this.subject$.next({
      type: 'sent',
      msg: data,
    });
  }
}

export class WSConfigurator implements IWSConfigurator {
  constructor(protected config: WSModuleConfig) {}

  setEndpoint(endpoint: string): void {
    this.config.endpoint = endpoint;
  }

  async createConfig(_: ModuleInitializerArgs<IWSConfigurator>): Promise<WSModuleConfig> {
    if (!this.config.endpoint) {
      throw new Error('You need to provide an endpoint');
    }

    return this.config;
  }
}

export type WSModule<MessageDataType = string> = Module<
  typeof moduleKey,
  IWSProvider<MessageDataType>,
  IWSConfigurator
>;

export const module: WSModule = {
  name: moduleKey,
  configure: () => new WSConfigurator({} as WSModuleConfig),
  initialize: async (args) => {
    const config = await (args.config as WSConfigurator).createConfig(args);
    return new WSProvider(config);
  },
};

export const enableWS = (
  configurator: IModulesConfigurator<any, any>,
  onConfigure?: (configurator: IWSConfigurator) => void
): void => {
  configurator.addConfig({
    module,
    configure: (WSConfigurator) => {
      if (onConfigure) {
        onConfigure(WSConfigurator);
      }
    },
  });
};

export default module;
