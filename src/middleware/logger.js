// logger.js
const winston = require("winston");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Custom format for detailed error logging
const errorStackFormat = winston.format(info => {
  if (info.error && info.error instanceof Error) {
    return Object.assign({}, info, {
      stack: info.error.stack,
      message: info.error.message
    });
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    errorStackFormat(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Error log file
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Combined log file
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log')
    }),
    // Console output with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      )
    })
  ],
  // Prevent winston from exiting on uncaught errors
  exitOnError: false
});

// Add unhandled error logging
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection', { error });
});

// Enhanced request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  req.requestId = uuidv4();

  // Log incoming request
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Override res.json to capture response
  const oldJson = res.json;
  res.json = function(body) {
    res.responseBody = body;
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.info(`Response ${res.statusCode}`, {
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      body: body,
      timestamp: new Date().toISOString()
    });
    
    return oldJson.apply(res, arguments);
  };

  // Log errors
  res.on('error', (error) => {
    logger.error('Response error', {
      requestId: req.requestId,
      error: error,
      timestamp: new Date().toISOString()
    });
  });

  next();
};

module.exports = { logger, requestLogger };
