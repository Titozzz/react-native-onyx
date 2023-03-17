// Logging callback

type Logger = ({message}: {message: string, level: 'alert' | 'info'})=>void
let logger: Logger | null = null;

/**
 * Register the logging callback
 *
 * @param {Function} callback
 */
function registerLogger(callback: Logger) {
    logger = callback;
}

/**
 * Send an alert message to the logger
 *
 * @param {String} message
 */
function logAlert(message: string) {
    logger?.({message: `[Onyx] ${message}`, level: 'alert'});
}

/**
 * Send an info message to the logger
 *
 * @param {String} message
 */
function logInfo(message: string) {
    logger?.({message: `[Onyx] ${message}`, level: 'info'});
}

export {
    registerLogger,
    logInfo,
    logAlert,
};
