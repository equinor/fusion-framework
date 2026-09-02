import { z } from 'zod';

import type { ApiVersionContract } from '../../types';

import { SyntheticApiVersion } from './synthetic-api-version';

/**
 * Two-version contract whose versions deliberately share no argument or response
 * fields, so any leakage between versions shows up as a type-test failure.
 *
 * Mirrors the production endpoint shape: one entry per concrete version, each
 * pairing the arguments that version accepts with the response it publishes.
 */
export const SyntheticVersionContract = {
  [SyntheticApiVersion.v1]: {
    /** Arguments accepted by synthetic version 1.0. */
    args: z.object({ roleIdentifier: z.string() }),
    /** Response published by synthetic version 1.0. */
    response: z.object({ id: z.string(), name: z.string() }),
  },
  [SyntheticApiVersion.v2]: {
    /** Arguments accepted by synthetic version 2.0. */
    args: z.object({ roleId: z.string(), scope: z.string() }),
    /** Response published by synthetic version 2.0. */
    response: z.object({ identifier: z.string(), title: z.string(), scope: z.string() }),
  },
} as const satisfies ApiVersionContract;
