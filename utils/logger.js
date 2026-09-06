const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;

// 1. Define your custom text format
const myCustomFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
    level: 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        myCustomFormat
    ), transports: [
        new winston.transports.Console({
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                myCustomFormat,
                colorize({ all: true })
            )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    ]
});

module.exports = logger;