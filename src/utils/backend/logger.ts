import winston from "winston"

winston.addColors({
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white"
})

const format = winston.format.combine(
    winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss:ms" }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
)

const transports: winston.transport[] = [
    new winston.transports.Console({
        level: process.env.NODE_ENV === "production" ? "info" : process.env.NODE_ENV === "test" ? "warn" : "silly",
        format: winston.format.combine(
            winston.format.colorize({
                all: true
            })
        )
    })
]

if (process.env.NODE_ENV === "production") {
    transports.push(
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error"
        }),
        new winston.transports.File({ filename: "logs/all.log" })
    )
}

export default winston.createLogger({
    format,
    transports
})
