import { pino } from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
      timestampKey: "time",
      translateTime: true,
    },
  },
});

export default logger;