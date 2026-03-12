import fs from 'fs';
import path from 'path';
import type { TransformableInfo } from 'logform';
// import { SetupConstants } from './setupConstants';
export class SetupConstants {
  static readonly EMPTY_TEXT = '';
  static readonly END_LINE = '\n';
  static readonly ATTACHED_STATE = "attached";
  static readonly VISIBLE_STATE = "visible";
  static readonly FIVE = 5;
  static readonly TEN = 10;
  static readonly SIXTY = 60;
  static readonly FIVE_HUNDRED = 500;
  static readonly ONE_THOUSAND = 1000;
  static readonly INFO = "info";
  static readonly DEBUG: "debug";
  static readonly ERROR: "error";
  static readonly WARN: "warn";

  // static readonly FOLDER_REPORTS = "./reports/";
  static readonly LOG_FOLDER_PATH = `logFiles`;
  static readonly LOGGER_LINE_SEPARATOR = "-----------------------------------------------------------------------------------------------";
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const winston = require('winston');

// Ensure log folder exists
const logDir = SetupConstants.LOG_FOLDER_PATH || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Get timestamp string for file naming
const currentTimeStamp = new Date()
  .toISOString()
  .slice(0, 19)
  .replace(/[-:]/g, SetupConstants.EMPTY_TEXT);

const logFileName = `testLog_${currentTimeStamp}.log`;
const logFileFullPath = path.join(logDir, logFileName);

// In-memory buffer for per-step logs
const logBuffer: string[] = [];

// Define how log lines should appear
const consoleFormat = winston.format.printf(
  ({ timestamp, level, message }: TransformableInfo) => {
    const formatted = `${timestamp}  ${message}`;
    logBuffer.push(formatted); // Store log in buffer for current step
    const colorizer = winston.format.colorize({ all: true });
    const coloredLevel = colorizer.colorize(level, level.toUpperCase());
    return `${timestamp} : ${message}`;
  }
);

export class Logger {
  public static readonly logFilePath: string = logFileFullPath;

  private static readonly logger = winston.createLogger({
    level: process.env.LOG_LEVEL || SetupConstants.INFO,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      consoleFormat
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: logFileFullPath,
        level: 'debug',
      }),
    ],
  });

  // Core log methods
  static debug(message: string): void {
    this.logger.debug(message);
  }

  static info(message: string): void {
    message= message.replace(/\s*\n\s*/g, ' ').trim();
    this.logger.info(`- INFO - ${message}`);
  }

  static warn(message: string): void {
    this.logger.warn(message);
  }

  static error(message: string): void {
    this.logger.error(`- ERROR -${message}`);
  }

  static step(message: string): void {
    this.logger.info(`- INFO - ${message}`);
  } 

  // Step-specific log access
  static getBufferedLogs(): string {
    return logBuffer.join('\n');
  }

  static clearBuffer(): void {
    logBuffer.length = 0;
  }

  // Utility log wrappers
  static initTestSuite(name: string): void {
    this.logger.info(`=== Starting Test Suite: ${name} ===`);
  }

  static termTestSuite(name: string): void {
    this.logger.info(`=== Completed Test Suite: ${name} ===`);
    this.logger.info(SetupConstants.LOGGER_LINE_SEPARATOR);
  }

  static initTest(name: string): void {
    this.logger.info(`-- Start Test: ${name}`);
  }

  static termTest(name: string): void {
    this.logger.info(`-- End Test: ${name}`);
    this.logger.info(SetupConstants.LOGGER_LINE_SEPARATOR);
  }
}
