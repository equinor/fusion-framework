import { describe, it, expect } from 'vitest';

import { TestScheduler } from 'rxjs/testing';

import { mapProp } from '../../src/operators';

describe('mapProp', () => {
  it('should pick an property from a object', () => {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
    const values = {
      a: { foo: { bar: 'test1' } },
      b: { foo: { bar: 'test2' } },
    };
    const marble = '-a-b|';
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const subject = cold(marble, values);
      // Verify mapProp extracts a single-level property
      expectObservable(subject.pipe(mapProp('foo'))).toBe(marble, {
        a: values.a.foo,
        b: values.b.foo,
      });
      // Verify mapProp extracts a nested property via dot-path notation
      expectObservable(subject.pipe(mapProp('foo.bar'))).toBe(marble, {
        a: values.a.foo.bar,
        b: values.b.foo.bar,
      });
    });
  });
});
