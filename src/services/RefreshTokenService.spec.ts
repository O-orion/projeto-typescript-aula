import { beforeEach, describe, expect, it, vi } from 'vitest'

// 🔹 mocks externos
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}))

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'new-jti'),
}))

vi.mock('../config/jwt.config.js', () => ({
  jwtConfig: {
    access: {
      secret: 'access-secret',
      expiresIn: '1h',
    },
    refresh: {
      secret: 'refresh-secret',
      expiresIn: '1d',
    },
  },
}))

// 🔹 mock repository
const mockRepo = {
  findOne: vi.fn(),
  update: vi.fn(),
  save: vi.fn(),
}

// 🔹 mock datasource
vi.mock('../database/appDataSource.js', () => ({
  appDataSource: {
    getRepository: () => mockRepo,
  },
}))

// 🔹 imports após mocks
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AppError } from '../errors/AppError.js'
import RefreshTokenService from './RefreshTokenService.js'

describe('RefreshTokenService', () => {
  let service: RefreshTokenService

  beforeEach(() => {
    service = new RefreshTokenService()
    vi.clearAllMocks()
  })

  // ✅ refresh sucesso
  it('deve gerar novos tokens com sucesso', async () => {
    const tokenDb = {
      id: '1',
      jti: 'old-jti',
      sessionId: 'session',
      userAgent: 'chrome',
      ipAddress: 'ip',
      expireIn: new Date(Date.now() + 100000),
      tokenhash: 'hash',
      pesquisador: { id: 'user-1', email: 'teste@email.com' },
    }

    ;(jwt.verify as any).mockReturnValue({ jti: 'old-jti' })

    mockRepo.findOne.mockResolvedValue(tokenDb)

    ;(bcrypt.compare as any).mockResolvedValue(true)
    ;(bcrypt.hash as any).mockResolvedValue('new-hash')

    mockRepo.save.mockResolvedValue({ jti: 'new-jti' })

    ;(jwt.sign as any).mockReturnValue('token-fake')

    const result = await service.refresh('refresh-token', 'chrome', 'ip')

    expect(result).toHaveProperty('tokenAccess')
    expect(result).toHaveProperty('tokenRefresh')

    expect(mockRepo.update).toHaveBeenCalled() // revogou antigo
  })

  // ❌ token não encontrado
  it('deve lançar erro se token não existir', async () => {
    ;(jwt.verify as any).mockReturnValue({ jti: 'x' })

    mockRepo.findOne.mockResolvedValue(null)

    await expect(service.refresh('token', 'ua', 'ip')).rejects.toBeInstanceOf(
      AppError
    )
  })

  // ❌ token expirado
  it('deve lançar erro se token estiver expirado', async () => {
    const tokenDb = {
      expireIn: new Date(Date.now() - 1000),
    }

    ;(jwt.verify as any).mockReturnValue({ jti: 'x' })

    mockRepo.findOne.mockResolvedValue(tokenDb)

    await expect(service.refresh('token', 'ua', 'ip')).rejects.toBeInstanceOf(
      AppError
    )
  })

  // ❌ hash inválido
  it('deve lançar erro se hash não bater', async () => {
    const tokenDb = {
      id: '1',
      jti: 'x',
      sessionId: 's',
      userAgent: 'ua',
      ipAddress: 'ip',
      expireIn: new Date(Date.now() + 1000),
      tokenhash: 'hash',
      pesquisador: { id: 'user' },
    }

    ;(jwt.verify as any).mockReturnValue({ jti: 'x' })

    mockRepo.findOne.mockResolvedValue(tokenDb)

    ;(bcrypt.compare as any).mockResolvedValue(false)

    await expect(service.refresh('token', 'ua', 'ip')).rejects.toBeInstanceOf(
      AppError
    )
  })
})
