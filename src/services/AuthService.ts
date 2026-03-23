import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import ms, { type StringValue } from 'ms'
import { getJwtConfig } from '../config/jwt.config.js'
import { appDataSource } from '../database/appDataSource.js'
import Pesquisador from '../entities/Pesquisador.js'
import RefreshToken from '../entities/RefreshToken.js'
import { AppError } from '../errors/AppError.js'

export default class AuthService {
  private repoRefresh = appDataSource.getRepository(RefreshToken)
  private repoPesquisador = appDataSource.getRepository(Pesquisador)

  async login(email: string, senha: string, userAgent: string, ip: string) {
    const pesquisador = await this.repoPesquisador.findOne({
      where: { email },
    })

    if (!pesquisador) {
      throw new AppError(401, 'Credências Inválidas')
    }

    const senhasSaoIguais = await bcrypt.compare(senha, pesquisador.senha)
    if (!senhasSaoIguais) {
      throw new AppError(401, 'Credênciais Inválidas')
    }

    let refreshToken = await this.repoRefresh.findOne({
      where: {
        pesquisador: { id: pesquisador.id },
        userAgent,
        ipAddress: ip,
        revoked: false,
      },
    })

    if (!refreshToken) {
      refreshToken = await this.createRefreshToken(pesquisador, userAgent, ip)
    }

    const tokenAccess = this.generateAcessToken(pesquisador)
    const tokenRefresh = await this.generateRefreshToken(
      pesquisador,
      refreshToken.jti
    )

    return { tokenAccess, tokenRefresh }
  }

  private async createRefreshToken(
    pesquisador: Pesquisador,
    userAgent: string,
    ip: string
  ) {
    const sessionId = randomUUID()
    const token = this.repoRefresh.create({
      jti: randomUUID(),
      userAgent,
      sessionId,
      ipAddress: ip,
      pesquisador,
    })
    return this.repoRefresh.save(token)
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
