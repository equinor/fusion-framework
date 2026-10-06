/**
 * Resolves the analytics table an event is stored in, from its OpenTelemetry `eventName`, the way
 * Fusion's analytics pipeline names its per-event tables.
 *
 * @remarks
 * Mirrors `sanitize` in the `nb_fcore_featurelogs` notebook: lowercase, every run of characters
 * other than `a-z` and `0-9` becomes `_`, leading and trailing `_` are removed, and an empty result
 * becomes `unknown`. The table name is `event_` followed by that suffix.
 *
 * @param eventName - The event's `eventName`, or `null` when it has none.
 * @returns The table name, for example `event_app_feature` for `app-feature`.
 *
 * @example
 * ```typescript
 * toAnalyticsTableName('helpcenter:opened'); // → 'event_helpcenter_opened'
 * ```
 */
export function toAnalyticsTableName(eventName: string | null): string {
  const suffix = (eventName ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `event_${suffix || 'unknown'}`;
}

export default toAnalyticsTableName;
