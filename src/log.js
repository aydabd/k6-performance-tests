/**
 * @file Logger class to log messages to the console
 * @class Logger
 * @example
 * ```javascript
 * import { Logger } from './log.js';
 * const logger = new Logger({ verbose: true, logLevel: 'debug' });
 * logger.debug('Debug message');
 * logger.info('Info message');
 * logger.warn('Warning message');
 * logger.error('Error message');
 * // Set the log level to info
 * logger.setLogLevel('info');
 * logger.debug('Debug message'); // Will not log
 * logger.info('Info message');
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */


/**
 * Logger class to log messages to the console
 */
class Logger {
    /**
     * Constructor for the Logger class
     * @param {object} options - Options for the logger
     * @param {boolean} options.verbose - Enable verbose mode
     * @param {string} options.logLevel - Set the log level
     */
    constructor(options) {
        this.logLevels = {
            'debug': 1,
            'info': 2,
            'warn': 3,
            'error': 4
        };
        this.currentLogLevel = 'info'; // Default log level
        this.verboseEnabled = false;

        this.init(options);
    }

    /**
     * Initialize the logger with the given options
     * @param {object} options - Options for the logger
     * @param {boolean} options.verbose - Enable verbose mode
     * @param {string} options.logLevel - Set the log level
     * @returns {void}
     */
    init(options) {
        options = options || {};
        this.verboseEnabled = options.verbose || false;
        this.currentLogLevel = options.logLevel || 'info';
    }

    /**
     * Log a message to the console
     * @param {string} message - The message to log
     * @param {string} level - The log level
     * @returns {void}
     */
    log(message, level) {
        if (this.logLevels[level] < this.logLevels[this.currentLogLevel]) {
            return; // Do not log if the level is lower than the current log level
        }

        var timestamp = (new Date()).toISOString();
        var formattedMessage = `[${timestamp}] - [${level.toUpperCase()}]: ${message}`;

        switch (level) {
            case 'debug':
                // Only log debug messages if verbose mode is enabled
                if (this.verboseEnabled) console.debug(formattedMessage); // eslint-disable-line no-undef
                break;
            case 'info':
                console.info(formattedMessage); // eslint-disable-line no-undef
                break;
            case 'warn':
                console.warn(formattedMessage); // eslint-disable-line no-undef
                break;
            case 'error':
                console.error(formattedMessage); // eslint-disable-line no-undef
                break;
            default:
                // Fallback to log for any other levels
                console.log(formattedMessage); // eslint-disable-line no-undef
        }
    }

    /**
     * Set the log level
     * @param {string} level - The log level to set
     * @returns {void}
     */
    setLogLevel(level) {
        if (this.logLevels[level]) {
            this.currentLogLevel = level;
        } else {
            console.warn(`Invalid log level: ${level}`); // eslint-disable-line no-undef
        }
    }

    /**
     * Enable verbose mode
     * @param {string} message - The message to log
     * @returns {void}
     */
    debug(message) {
        this.log(message, 'debug');
    }

    /**
     * Log an info message
     * @param {string} message - The message to log
     * @returns {void}
     */
    info(message) {
        this.log(message, 'info');
    }

    /**
     * Log a warning message
     * @param {string} message - The message to log
     * @returns {void}
     */
    warn(message) {
        this.log(message, 'warn');
    }

    /**
     * Log an error message
     * @param {string} message - The message to log
     * @returns {void}
     */
    error(message) {
        this.log(message, 'error');
    }
}

export { Logger };
