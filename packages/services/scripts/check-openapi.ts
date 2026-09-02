/**
 * Executable that checks a service's OpenAPI contract against the snapshots in this package.
 *
 * Usage: `node scripts/check-openapi.ts <service>`, which checks every API version registered
 * for the service in `openapi-services.ts`. Requires network access, and never writes a
 * snapshot: adopting a changed contract is a manual task.
 *
 * Exit codes: `0` in sync, `1` drift detected, `2` the check could not run — a missing, extra,
 * or unknown service argument, an unreachable URL, or a document that is not the contract.
 *
 * @packageDocumentation
 */

import { argv, exit } from 'node:process';

import { checkOpenApiContract } from './check-open-api-contract.ts';
import { OPENAPI_SERVICES } from './openapi-services.ts';

/** Exit code used when the check could not run at all. */
const EXIT_FAILURE = 2;

const [name, ...rest] = argv.slice(2);
// Names are unique, so the first match is the service to check.
const service = OPENAPI_SERVICES.find((candidate) => candidate.name === name);

// A missing, extra, or unknown argument is a usage error, not a contract failure.
if (service === undefined || rest.length > 0) {
  // The registry is listed back, so a typo does not need a trip to the README.
  const names = OPENAPI_SERVICES.map((candidate) => candidate.name).join(', ');
  console.error(
    `✗ Expected exactly one known service, got "${argv.slice(2).join(' ')}".\n\nUsage: node` +
      ` scripts/check-openapi.ts <service>\n\nAvailable services: ${names}\n\nExample: pnpm` +
      ' --filter @equinor/fusion-services check:openapi roles',
  );
  exit(EXIT_FAILURE);
}

try {
  const report = await checkOpenApiContract(service);
  // Drift belongs on stderr so a CI log shows the report next to the failure.
  if (report.exitCode === 0) console.log(report.output);
  else console.error(report.output);
  exit(report.exitCode);
} catch (error) {
  console.error(`✗ ${error instanceof Error ? error.message : error}`);
  exit(EXIT_FAILURE);
}
