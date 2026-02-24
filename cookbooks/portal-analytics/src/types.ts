import type { z } from 'zod';
import type { LogEntrySchema, LogRecordSchema } from './schema';

export type LogEntry = z.infer<typeof LogEntrySchema>;
export type LogRecord = z.infer<typeof LogRecordSchema>;
