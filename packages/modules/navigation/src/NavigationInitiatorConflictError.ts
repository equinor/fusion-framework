import type { NavigationConflictSetting } from './NavigationInitiator.js';

/**
 * Thrown during startup when explicit app navigation configuration violates a
 * constraint required by the initiator. Both settings are identified so the
 * conflict can be resolved at its source; nothing is overridden silently.
 */
export class NavigationInitiatorConflictError extends Error {
  /** The conflicting navigation setting. */
  public readonly setting: NavigationConflictSetting;
  /** Value configured explicitly by the app. */
  public readonly explicit: string;
  /** Value required by the initiator. */
  public readonly required: string;

  /**
   * @param args - The conflicting setting with its explicit and required values
   */
  constructor(args: { setting: NavigationConflictSetting; explicit: string; required: string }) {
    super(
      `Navigation configuration conflict on '${args.setting}': ` +
        `explicit app setting (${args.explicit}) conflicts with required host setting (${args.required}) ` +
        `supplied by the navigation initiator (kind: 'host'). ` +
        `Remove the explicit '${args.setting}' setting or make it match the host.`,
    );
    this.name = 'NavigationInitiatorConflictError';
    this.setting = args.setting;
    this.explicit = args.explicit;
    this.required = args.required;
  }
}
