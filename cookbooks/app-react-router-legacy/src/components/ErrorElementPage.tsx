/**
 * Provides fallback content for the route whose loader always fails.
 * @returns The fallback route content, normally hidden by the error element.
 */
export function ErrorElementPage() {
  // This component never renders because clientLoader always throws.
  return <p>This text should never appear.</p>;
}
