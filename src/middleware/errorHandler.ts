import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express'
import winston from 'winston'
import { AppError } from '../errors/AppError'

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: './logs/log-error.log' }),
  ],
})

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`Aqui o erro: ${err.message} - ${req.path} - ${req.ip} `)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: `${err.name} -- MID ERROR`,
      message: `${err.message}`,
    })
  } else {
    res.status(500).json({
      error: 'Error interno',
      message: 'Ocorreu um erro interno em nossa aplicação',
    })
  }
}

export default errorHandler
