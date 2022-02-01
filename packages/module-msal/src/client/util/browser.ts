/**
 * Redirects browser to provided location
 * If not redirected by provided timeout, promise is rejected
 *
 * @internal
 *
 * @param url - endpoint to navigate to
 * @param timeout - max wait before redirect
 * @param history - append navigation to history
 */
export const redirect = (url: string, timeout = 3000, history?: boolean): Promise<void> => {
    history ? window.location.assign(url) : window.location.replace(url);
    return new Promise((_, reject) => setTimeout(reject, timeout));
};
