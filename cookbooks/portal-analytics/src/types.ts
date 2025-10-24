import type { z } from 'zod';
import type { LogEntrySchema } from './schema';

export type LogEntry = z.infer<typeof LogEntrySchema>;
