import { createLogger as _createLogger } from 'vite';

export const createViteLogger = () => {
    const logger = _createLogger();
    const originalLogger = { ...logger };

    logger.error = (msg, opt) => {
        if (msg.match(/^Failed to load url \/assets/)) {
            return;
        }
        originalLogger.error(msg, opt);
    };
    logger.warn = (msg, options) => {
        /** import of app file from framework */
        if (
            msg.includes('import(manifest.entry)') &&
            msg.includes('dynamic-import-vars#limitations')
        )
            return;

        originalLogger.warn(msg, options);
    };
    return logger;
};

export default createViteLogger;
