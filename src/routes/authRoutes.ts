import { type Request, type Response, Router } from 'express'
import AuthController from '../controllers/AuthController'
import AuthService from '../services/AuthService'
import LogoutService from '../services/LogoutService'
import RefreshTokenService from '../services/RefreshTokenService'
import { asyncHandler } from '../utils/asyncError'

const authService = new AuthService()
const logoutService = new LogoutService()
const refreshService = new RefreshTokenService()

const authController = new AuthController(
  authService,
  logoutService,
  refreshService
)

const authRouter = Router()

authRouter.post(
  '/login',
  asyncHandler(authController.login.bind(authController))
)
authRouter.post('/refresh', (req: Request, res: Response) =>
  authController.refreshToken(req, res)
)
authRouter.post('/logout', (req: Request, res: Response) =>
  authController.logout(req, res)
)

export default authRouter
