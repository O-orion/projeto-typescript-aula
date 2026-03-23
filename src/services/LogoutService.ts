import jwt from 'jsonwebtoken'
import { getJwtConfig } from '../config/jwt.config'
import { appDataSource } from '../database/appDataSource'
import RefreshToken from '../entities/RefreshToken'
import { AppError } from '../errors/AppError'

export default class LogoutService {
  private repoRefresh = appDataSource.getRepository(RefreshToken)

  async logout(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        getJwtConfig().refresh.secret
      ) as any
      await this.repoRefresh.update({ jti: decoded.jti }, { revoked: true })
    } catch {
      throw new AppError(400, 'Token inválido para logout')
    }
  }

  async logoutAll(userId: string) {
    await this.repoRefresh.update(
      { pesquisador: { id: userId } },
      { revoked: true }
    )
  }
}
