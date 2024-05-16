import { describe, expect, it, vi } from 'vitest';

import chalk from 'chalk';

import { ConsoleLogger } from '../src/ConsoleLogger';
import { LogLevel } from '../src/static';

describe('Console logger', () => {
    it('should log debug messages', () => {
        const spy = vi.spyOn(console, 'debug');
        const logger = new ConsoleLogger('MainLogger');
        logger.level = LogLevel.Debug;
        logger.debug('This is a debug message');
        expect(spy).toHaveBeenCalledWith(
            chalk.dim(chalk.magenta('MainLogger'), 'This is a debug message'),
        );
    });
    it('should log info messages', () => {
        const spy = vi.spyOn(console, 'info');
        const logger = new ConsoleLogger('MainLogger');
        logger.level = LogLevel.Info;
        logger.info('This is an info message');
        expect(spy).toHaveBeenCalledWith(chalk.magenta('MainLogger'), 'This is an info message');
    });

    it('should log warning messages', () => {
        const spy = vi.spyOn(console, 'warn');
        const logger = new ConsoleLogger('MainLogger');
        logger.level = LogLevel.Warning;
        logger.warn('This is a warning message');
        expect(spy).toHaveBeenCalledWith(
            chalk.bold(chalk.magenta('MainLogger'), 'This is a warning message'),
        );
    });

    it('should log error messages', () => {
        const spy = vi.spyOn(console, 'error');
        const logger = new ConsoleLogger('MainLogger');
        logger.level = LogLevel.Error;
        logger.error('This is an error message');
        expect(spy).toHaveBeenCalledWith(chalk.magenta('MainLogger'), 'This is an error message');
    });

    it('should log multiple messages', () => {
        const spy = vi.spyOn(console, 'info');
        const logger = new ConsoleLogger('MainLogger');
        logger.info('This is a debug message', 'This is an additional message');
        expect(spy).toHaveBeenCalledWith(
            chalk.magenta('MainLogger'),
            'This is a debug message',
            'This is an additional message',
        );
    });

    it('should log messages with a custom title', () => {
        const spy = vi.spyOn(console, 'info');
        const logger = new ConsoleLogger('MainLogger', 'CustomTitle');
        logger.info('This is a debug message');
        expect(spy).toHaveBeenCalledWith(
            chalk.magenta('MainLogger - CustomTitle'),
            'This is a debug message',
        );
    });

    it('should not log messages with a lower log level', () => {
        const spy = vi.spyOn(console, 'info');
        const logger = new ConsoleLogger('MainLogger');
        logger.level = LogLevel.Warning;
        logger.info('This message should not be logged');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should log messages from a sub-logger', () => {
        const spy = vi.spyOn(console, 'info');
        const logger = new ConsoleLogger('MainLogger');
        const subLogger = logger.createSubLogger('SubLogger');
        subLogger.info('This is a debug message from the sub-logger');
        expect(spy).toHaveBeenCalledWith(
            chalk.magenta('MainLogger::SubLogger'),
            'This is a debug message from the sub-logger',
        );
    });

    it('should log messages from a sub-logger with a custom sub-title', () => {
        const spy = vi.spyOn(console, 'info');
        const logger = new ConsoleLogger('MainLogger');
        const subLogger = logger.createSubLogger('SubLogger', 'CustomSubTitle');
        subLogger.info('This is a debug message from the sub-logger');
        expect(spy).toHaveBeenCalledWith(
            chalk.magenta('MainLogger::SubLogger - CustomSubTitle'),
            'This is a debug message from the sub-logger',
        );
    });
});
