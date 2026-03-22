import { Router, type Request, type Response } from "express";
import AuthController from "../controllers/AuthController.js";
import AuthService from "../services/AuthService.js";
import LogoutService from "../services/LogoutService.js";
import RefreshTokenService from "../services/RefreshTokenService.js";
import { asyncHandler } from "../utils/asyncError.js";


const authService = new AuthService();
const logoutService = new LogoutService();
const refreshService = new RefreshTokenService();

const authController = new AuthController(authService, logoutService, refreshService);

const authRouter = Router()

authRouter.post("/login", asyncHandler(authController.login.bind(authController)));
authRouter.post('/refresh', (req: Request, res: Response) => authController.refreshToken(req, res));
authRouter.post('/logout/all', (req: Request, res: Response) => authController.logoutAll(req, res))
authRouter.post('/logout', (req: Request, res: Response) => authController.logout(req, res))

export default authRouter;
