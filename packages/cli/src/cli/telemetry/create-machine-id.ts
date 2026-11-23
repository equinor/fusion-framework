import { createHash } from 'node:crypto';
import { hostname, networkInterfaces } from 'node:os';

/**
 * Returns a stable, one-way machine identifier, so usage can be counted per machine without
 * exporting host names or hardware addresses.
 *
 * @param interfaces - Network interfaces; defaults to the host's.
 * @param host - Host name used when no hardware address exists; defaults to the host's.
 * @returns Hex SHA-256 of the first external hardware address, or of the host name.
 */
export const createMachineId = (
  interfaces: ReturnType<typeof networkInterfaces> = networkInterfaces(),
  host: string = hostname(),
): string => {
  // Select an external non-zero MAC; the host name is only a fallback for isolated machines.
  const mac = Object.values(interfaces)
    .flat()
    .find(
      (entry) => entry && !entry.internal && entry.mac && entry.mac !== '00:00:00:00:00:00',
    )?.mac;
  return createHash('sha256')
    .update(`fusion-framework-cli:${mac ?? host}`)
    .digest('hex');
};
