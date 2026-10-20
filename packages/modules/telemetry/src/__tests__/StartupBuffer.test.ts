import { describe, expect, it } from 'vitest';
import { StartupBuffer } from '../lib/StartupBuffer.js';
import { TelemetryLevel, TelemetryType } from '../static.js';
import type { TelemetryItem } from '../types.js';

/** Creates a minimal record at the given level. */
function record(name: string, level = TelemetryLevel.Information): TelemetryItem {
  return { name, type: TelemetryType.Event, level, scope: [] };
}

describe('startup buffer', () => {
  it('retains records up to 255 and counts what it drops', () => {
    const buffer = new StartupBuffer();
    for (let index = 0; index < 260; index++) {
      buffer.push(record(`success-${index}`));
    }
    const { items, dropped } = buffer.drain();
    expect(items).toHaveLength(255);
    expect(items[0].name).toBe('success-0');
    expect(dropped).toBe(5);
  });

  it('lets failures replace lower-severity records at capacity, but not other failures', () => {
    const buffer = new StartupBuffer(2);
    buffer.push(record('first-failure', TelemetryLevel.Error));
    buffer.push(record('success'));
    buffer.push(record('second-failure', TelemetryLevel.Error));
    buffer.push(record('third-failure', TelemetryLevel.Error));
    const { items, dropped } = buffer.drain();
    expect(items.map((item) => item.name)).toEqual(['first-failure', 'second-failure']);
    expect(dropped).toBe(2);
  });

  it('empties on drain', () => {
    const buffer = new StartupBuffer();
    buffer.push(record('retained'));
    buffer.drain();
    expect(buffer.drain()).toEqual({ items: [], dropped: 0 });
  });
});
