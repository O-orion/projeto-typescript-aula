import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import ms, { type StringValue } from 'ms'
import { getJwtConfig } from '../config/jwt.config'
import { appDataSource } from '../database/appDataSource'
import type Pesquisador from '../entities/Pesquisador'
import RefreshToken from '../entities/RefreshToken'
import { AppError } from '../errors/AppError'

export default class RefreshTokenService {
  private repoRefresh = appDataSource.getRepository(RefreshToken)

  async refresh(refreshToken: string, userAgent: string, ip: string) {
    const { refresh, access } = getJwtConfig()

    const decoded = jwt.verify(refreshToken, refresh.secret) as any

    const tokenDb = await this.repoRefresh.findOne({
      where: {
        jti: decoded.jti,
        revoked: false,
        userAgent,
        ipAddress: ip,
      },
      relations: ['pesquisador'],
    })

    if (!tokenDb || tokenDb.expireIn < new Date()) {
      throw new AppError(401, 'Token inválido')
    }

    const valid = await bcrypt.compare(refreshToken, tokenDb.tokenhash)
    if (!valid) {
      throw new AppError(401, 'Token inválido')
    }

    await this.repoRefresh.update({ id: tokenDb.id }, { revoked: true })

    const novo = await this.repoRefresh.save({
      jti: randomUUID(),
      sessionId: tokenDb.sessionId,
      userAgent,
      ipAddress: ip,
      pesquisador: tokenDb.pesquisador,
    })

    return {
      tokenAccess: this.generateAcessToken(tokenDb.pesquisador),
      tokenRefresh: await this.generateRefreshToken(
        tokenDb.pesquisador,
        novo.jti
      ),
    }
  }

  private async generateRefreshToken(pesq: Pesquisador, jti: string) {
    const { refresh } = getJwtConfig()
    const expiresIn = refresh.expiresIn as StringValue

    const tokenPlan = jwt.sign(
      { sub: pesq.id, jti, type: 'refresh' },
      refresh.secret,
      { expiresIn }
    )

    const expireInMS = ms(expiresIn)

    await this.repoRefresh.update(
      { jti },
      {
        tokenhash: await bcrypt.hash(tokenPlan, 12),
        expireIn: new Date(Date.now() + expireInMS),
        revoked: false,
      }
    )

    return tokenPlan
  }

  private generateAcessToken(pesquisador: Pesquisador) {
    const { access } = getJwtConfig()
    const expiresIn = access.expiresIn as StringValue

    return jwt.sign(
      { sub: pesquisador.id, email: pesquisador.email, type: 'access' },
      access.secret,
      { expiresIn }
    )
  }
}
