import { z } from 'zod';

/**
 * Schema for the API application configuration.
 *
 * This schema validates the structure of the configuration object used for the API application.
 *
 * Properties:
 * - `environment` (optional): A record of key-value pairs where the value can be of any type. Defaults to an empty object.
 * - `endpoints` (optional): A record where each key maps to an object containing:
 *   - `url`: A string representing the endpoint URL.
 *   - `scopes` (optional): An array of strings representing the scopes. Defaults to an empty array.
 */
export const ApiAppConfigSchema = z.object({
  environment: z.record(z.string(), z.any()).optional().default({}),
  endpoints: z
    .record(
      z.string(),
      z.object({
        url: z.string(),
        scopes: z.array(z.string()).optional().default([]),
      }),
    )
    .optional(),
});

export type ApiAppConfig = z.infer<typeof ApiAppConfigSchema>;

/**
 * Schema for validating an API application person object.
 *
 * Properties:
 * - `azureUniqueId` (string): The unique identifier for the person in Azure.
 * - `displayName` (string): The display name of the person.
 * - `mail` (string | nullish): The email address of the person, which can be null or undefined.
 * - `upn` (string | nullish): The User Principal Name (UPN) of the person, which can be null or undefined.
 * - `accountType` (string): The type of account the person has.
 * - `accountClassification` (string | nullish): The classification of the account, which can be null or undefined.
 * - `isExpired` (boolean | nullish): Indicates whether the account is expired, which can be null or undefined.
 */
const ApiApplicationPersonSchema = z.object({
  azureUniqueId: z.string({ message: 'The unique identifier for the person in Azure.' }),
  displayName: z.string({ message: 'The display name of the person.' }),
  mail: z
    .string({ message: 'The email address of the person, which can be null or undefined.' })
    .nullish(),
  upn: z
    .string({
      message: 'The User Principal Name (UPN) of the person, which can be null or undefined.',
    })
    .nullish(),
  accountType: z.string({ message: 'The type of account the person has.' }),
  accountClassification: z
    .string({ message: 'The classification of the account, which can be null or undefined.' })
    .nullish(),
  isExpired: z
    .boolean({
      message: 'Indicates whether the account is expired, which can be null or undefined.',
    })
    .nullish(),
});

/**
 * Schema for validating the structure of an API application build.
 *
 * Properties:
 * - `version`: The version of the application build.
 * - `entryPoint`: The entry point of the application.
 * - `tags`: An optional array of tags associated with the build.
 * - `tag`: An optional tag indicating the build type, either 'latest' or 'preview'.
 * - `assetPath`: An optional path to the build assets.
 * - `configUrl`: An optional URL to the build configuration.
 * - `timestamp`: An optional timestamp of the build.
 * - `commitSha`: An optional commit SHA of the build.
 * - `githubRepo`: An optional GitHub repository associated with the build.
 * - `projectPage`: An optional project page URL.
 * - `allowedExtensions`: An optional array of allowed extensions for the build.
 * - `uploadedBy`: An optional schema for the person who uploaded the build.
 */
export const ApiApplicationBuildSchema = z.object({
  version: z.string(),
  entryPoint: z.string(),
  tags: z.array(z.string()).nullish(),
  tag: z.enum(['latest', 'preview']).nullish(),
  assetPath: z.string().nullish(),
  configUrl: z.string().nullish(),
  timestamp: z.string().nullish(),
  commitSha: z.string().nullish(),
  githubRepo: z.string().nullish(),
  projectPage: z.string().nullish(),
  allowedExtensions: z.array(z.string()).nullish(),
  uploadedBy: ApiApplicationPersonSchema.nullish(),
});

/**
 * Schema for validating API application data.
 *
 * Properties:
 * - `appKey` (string): Unique key for the application.
 * - `displayName` (string): Display name of the application.
 * - `description` (string): Description of the application.
 * - `type` (string): Type of the application.
 * - `isPinned` (boolean | nullish): Indicates if the application is pinned.
 * - `templateSource` (string | nullish): Source template of the application.
 * - `category` (object | nullish): Category details of the application.
 *   - `id` (string): Unique identifier for the category.
 *   - `name` (string): Name of the category.
 *   - `displayName` (string): Display name of the category.
 *   - `color` (string): Color associated with the category.
 *   - `defaultIcon` (string): Default icon for the category.
 *   - `sortOrder` (number): Sort order for the category.
 * - `visualization` (object | nullish): Visualization details of the application.
 *   - `color` (string | nullish): Color for visualization.
 *   - `icon` (string | nullish): Icon for visualization.
 *   - `sortOrder` (number): Sort order for visualization.
 * - `keywords` (array of strings | nullish): Keywords associated with the application.
 * - `admins` (array of ApiApplicationPersonSchema | nullish): List of admin users for the application.
 * - `owners` (array of ApiApplicationPersonSchema | nullish): List of owner users for the application.
 * - `build` (ApiApplicationBuildSchema | nullish): Build details of the application.
 */
export const ApiApplicationSchema = z.object({
  appKey: z.string(),
  displayName: z.string(),
  description: z.string(),
  type: z.string(),
  isPinned: z.boolean().nullish(),
  templateSource: z.string().nullish(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
      displayName: z.string(),
      color: z.string(),
      defaultIcon: z.string(),
      sortOrder: z.number(),
    })
    .nullish(),
  visualization: z
    .object({
      color: z.string().nullish(),
      icon: z.string().nullish(),
      sortOrder: z.number(),
    })
    .nullish(),
  keywords: z.array(z.string()).nullish(),
  admins: z.array(ApiApplicationPersonSchema).nullish(),
  owners: z.array(ApiApplicationPersonSchema).nullish(),
  build: ApiApplicationBuildSchema.nullish(),
});

export type ApiApplication = z.infer<typeof ApiApplicationSchema>;
