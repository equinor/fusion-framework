import { z } from 'zod';

/**
 * Zod schema for the content of an app or widget bundle, as the HTTP client's blob selector
 * delivers it.
 *
 * Bundle endpoints serve archives and static assets rather than JSON, so their success body is
 * read as a blob and the schema validates the selector result instead of a parsed document.
 */
export const ApiBundleContentSchemaV1 = z
  .object({
    /** File name the service published in the `content-disposition` header, when it sent one. */
    filename: z
      .string()
      .optional()
      .describe(
        'File name the service published in the `content-disposition` header, when it sent one.',
      ),
    /** The bundle content itself, as delivered by the response body. */
    blob: z
      .instanceof(Blob)
      .describe('The bundle content itself, as delivered by the response body.'),
  })
  .describe(
    "The content of an app or widget bundle, as the HTTP client's blob selector delivers it.",
  );

/**
 * The content of an app or widget bundle: the response blob and the file name the service
 * published for it.
 *
 * Apps API 1.0 model inferred from {@link ApiBundleContentSchemaV1}, so `ApiBundleContentV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiBundleContentV1 = z.infer<typeof ApiBundleContentSchemaV1>;
