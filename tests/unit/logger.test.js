import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../src/log.js';

describe('Logger', () => {
    let logger;

    beforeEach(() => {
        logger = new Logger({ logLevel: 'debug' });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('logs info messages at info level', () => {
        const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
        logger.info('hello info');
        expect(spy).toHaveBeenCalledOnce();
        expect(spy.mock.calls[0][0]).toContain('hello info');
    });

    it('logs warn messages at warn level', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        logger.warn('a warning');
        expect(spy).toHaveBeenCalledOnce();
        expect(spy.mock.calls[0][0]).toContain('a warning');
    });

    it('logs error messages at error level', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        logger.error('an error');
        expect(spy).toHaveBeenCalledOnce();
        expect(spy.mock.calls[0][0]).toContain('an error');
    });

    it('does not log debug messages when verbose is disabled', () => {
        logger = new Logger({ logLevel: 'debug', verbose: false });
        const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        logger.debug('debug msg');
        expect(spy).not.toHaveBeenCalled();
    });

    it('logs debug messages when verbose is enabled', () => {
        logger = new Logger({ logLevel: 'debug', verbose: true });
        const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        logger.debug('verbose debug');
        expect(spy).toHaveBeenCalledOnce();
        expect(spy.mock.calls[0][0]).toContain('verbose debug');
    });

    it('filters out messages below the current log level', () => {
        logger = new Logger({ logLevel: 'warn' });
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        logger.info('should be filtered');
        expect(infoSpy).not.toHaveBeenCalled();
    });

    it('allows changing the log level at runtime', () => {
        logger = new Logger({ logLevel: 'error' });
        logger.setLogLevel('info');
        const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
        logger.info('now visible');
        expect(spy).toHaveBeenCalledOnce();
    });

    it('ignores invalid log level changes', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        logger.setLogLevel('invalid');
        expect(logger['currentLogLevel']).toBe('debug');
        warnSpy.mockRestore();
    });

    it('includes a timestamp in the log message', () => {
        const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
        logger.info('timestamp test');
        expect(spy.mock.calls[0][0]).toMatch(/\d{4}-\d{2}-\d{2}T/);
    });
});
