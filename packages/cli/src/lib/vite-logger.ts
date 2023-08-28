import { createLogger as _createLogger } from 'vite';

export const createViteLogger = () => {
    const logger = _createLogger();
    const originalWarning = logger.warn;
    logger.warn = (msg, options) => {
        /** import of app file from framework */
        if (
            msg.includes('import(manifest.entry)') &&
            msg.includes('dynamic-import-vars#limitations')
        )
            return;
        originalWarning(msg, options);
    };
    return logger;
};

export default createViteLogger;