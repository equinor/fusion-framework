/**
 * Throws during loading so the route's errorElement handling can be demonstrated.
 * @returns A promise that never resolves because the loader always throws.
 * @throws {Error} Always, to exercise the legacy errorElement route.
 */
export async function clientLoader(): Promise<never> {
  throw new Error('Loader blew up — errorElement should catch this');
}
