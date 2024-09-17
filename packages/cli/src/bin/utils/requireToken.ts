/**
 * Make sure the user has a valid azure token.
 */
export const requireToken = () => {
    if (!process?.env?.FUSION_TOKEN) {
        throw new Error(
            'Missing required environment variable FUSION_TOKEN. Please set it before running this command.',
        );
    }
};
