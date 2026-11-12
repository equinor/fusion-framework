import { z } from 'zod';

/**
 * Static, lowercase kebab-case label used for operational source kinds, modules and operations.
 * Open-ended so any host or module can define its own labels, while the character set
 * prevents URLs, user names, paths or payload fragments from becoming exported labels.
 */
export const operationalIdentifier = z.string().regex(/^[a-z][a-z0-9-]*$/);
