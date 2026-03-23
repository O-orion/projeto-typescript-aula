import { Router } from 'express'
import areaRoutes from './areaRouter'
import authRouter from './authRoutes'
import leituraRoutes from './leituraRouter'
import pesquisadorRoutes from './pesquisadorRoutes'
import sensorRouter from './sensorRoutes'

const indexRouter = Router()

indexRouter.use(pesquisadorRoutes)
indexRouter.use(authRouter)
indexRouter.use(sensorRouter)
indexRouter.use(areaRoutes)
indexRouter.use(leituraRoutes)

export default indexRouter
