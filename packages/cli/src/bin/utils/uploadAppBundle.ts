import { readFileSync } from 'node:fs';

/**
 * Function that uploads a zip bundle to the endpoint.
 * 
 * @param endpoint string The endpoint to upload to
 * @param bundle string The filename to upload
 * @returns Object
 */
export const uploadAppBundle = async (endpoint: string, bundle: string) => {
    const state: { buffer: Buffer | null } = {
        buffer: null,
    };

    try {
        state.buffer = readFileSync(bundle);
    } catch {
        throw new Error(`😞 Could not read bundle ${bundle}, does it exist?`);
    }

    const requestBundle = await fetch(endpoint, {
        method: 'POST',
        body: state.buffer,
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
            'Content-Type': 'application/zip',
        },
    });

    if (requestBundle.status === 401 || requestBundle.status === 403) {
        throw new Error(
            `This is not allowed for this role on this app. HTTP message: ${requestBundle.statusText}`
        );
    }

    if (requestBundle.status === 404) {
        throw new Error(`This app do not exist. HTTP message: ${requestBundle.statusText}`);
    }

    if (requestBundle.status === 409) {
        throw new Error(
            `This version is already published. HTTP message: ${requestBundle.statusText}`,
        );
    }

    if (requestBundle.status === 410) {
        throw new Error(`This app is deleted. HTTP message: ${requestBundle.statusText}`);
    }

    if (!requestBundle.ok) {
        throw new Error(
            `Failed to publish bundle. HTTP status ${requestBundle.status}, ${requestBundle.statusText}`,
        );
    }

    return await requestBundle.json();
};
