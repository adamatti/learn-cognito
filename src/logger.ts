import winston from "winston";

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  // winston.format.prettyPrint(), // FIXME local only
  // winston.format.colorize(),
  winston.format.errors({ stack: true })
);

const level: winston.LoggerOptions["level"] = "debug";

export default winston.createLogger({
  format,
  level,
  transports: [
    new winston.transports.Console({
      level,
      format,
      handleExceptions: true,
    }),
  ],
});
