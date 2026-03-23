import 'reflect-metadata'
import compression from 'compression'
import cors from 'cors'
import express, { type Express } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import 'reflect-metadata'

import errorHandler from './middleware/errorHandler'
import indexRouter from './routes/index.routes'

const app: Express = express()

app.set('trust proxy', 1)

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
)

app.use(helmet({ contentSecurityPolicy: false }))

app.use(
  cors({
    origin: '**',
    credentials: true,
  })
)

app.use(morgan('dev'))
app.use(express.json())
app.use(compression({ threshold: 1024 }))

app.use('/api', indexRouter)

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(errorHandler)

export default app
