import { format, loggers, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import * as dotenv from 'dotenv'
dotenv.config()
const { combine, timestamp, json, colorize, printf, label } = format

const logging = ['SYSTEM']

logging.forEach((v) => {
  const errorAlignColorsAndTime = combine(
    label({
      label: v,
    }),
    timestamp({
      format: 'YYYY-MM-dd HH:mm:ss',
    }),
    printf(({ level, timestamp, label, message, ...appendix }) => {
      return `[${timestamp}] [${level}] [${label}]: "${message}" ${JSON.stringify(
        appendix
      )}`
    })
  )
  const successAlignColorsAndTime = combine(
    label({
      label: v,
    }),
    timestamp({
      format: 'YYYY-MM-dd HH:mm:ss',
    }),
    printf(({ level, timestamp, label, message, ...appendix }) => {
      return `[${timestamp}] [${level}] [${label}]: "${message}" ${JSON.stringify(
        appendix
      )}`
    })
  )
  const ignoreErr = format((info, opts) => {
    if (info.level === 'error' || info.level === 'warn') {
      return false
    }
    return info
  })
  const transportERROR = new DailyRotateFile({
    dirname: process.cwd() + '/logs/operation/error/' + v,
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'warn',
    maxSize: '20m',
    maxFiles: '1d',
    format: errorAlignColorsAndTime,
  })
  const transportSUCCESS = new DailyRotateFile({
    dirname: process.cwd() + '/logs/operation/success/' + v,
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '1d',
    format: combine(ignoreErr(), successAlignColorsAndTime),
  })
  loggers.add(v, {
    level: 'silly',
    transports: [
      transportSUCCESS,
      transportERROR,
      new transports.Console({
        format: combine(
          colorize({ all: true }),
          errorAlignColorsAndTime,
          successAlignColorsAndTime
        ),
      }),
    ],
  })
})
export { loggers }
