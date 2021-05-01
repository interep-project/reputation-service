import winston from "winston";

let logger: winston.Logger | undefined = undefined;

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

const setLogger = (): winston.Logger => {
  if (logger) {
    return logger;
  }

  winston.addColors(colors);

  const format = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  );

  const transports: winston.transport[] = [
    new winston.transports.Console({
      level: process.env.NODE_ENV === "production" ? "info" : "silly",
      format: winston.format.combine(
        winston.format.colorize({
          all: true,
        })
      ),
    }),
  ];
  if (process.env.NODE_ENV === "production") {
    transports.push(
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
      }),
      new winston.transports.File({ filename: "logs/all.log" })
    );
  }

  logger = winston.createLogger({
    format,
    transports,
  });

  return logger;
};

export default logger || setLogger();
