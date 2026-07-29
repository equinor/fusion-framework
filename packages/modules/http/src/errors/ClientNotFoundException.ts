/**
 * Thrown when `createClient(name)` is called with an unknown client key.
 *
 * This is only used when the provided string is neither a registered client name
 * nor an absolute `http:` or `https:` URL.
 */
export class ClientNotFoundException extends Error {}

export default ClientNotFoundException;
