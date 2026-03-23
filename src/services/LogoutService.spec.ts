import { beforeEach, describe, expect, it, vi } from 'vitest'

// 🔹 mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}))

// 🔹 mock config
vi.mock('../config/jwt.config.js', () => ({
  jwtConfig: {
    refresh: {
      secret: 'secret-test',
    },
  },
}))

// 🔹 mock repository
const mockRepoRefresh = {
  update: vi.fn(),
}

// 🔹 mock datasource
vi.mock('../database/appDataSource.js', () => ({
  appDataSource: {
    getRepository: () => mockRepoRefresh,
  },
}))

// 🔹 import depois dos mocks
import jwt from 'jsonwebtoken'
import { AppError } from '../errors/AppError.js'
import LogoutService from './LogoutService.js'

describe('LogoutService', () => {
  let service: LogoutService

  beforeEach(() => {
    service = new LogoutService()
    vi.clearAllMocks()
  })

  // ✅ logout sucesso
  it('deve fazer logout com sucesso', async () => {
    ;(jwt.verify as any).mockReturnValue({
      jti: 'token-id',
    })

    await service.logout('token-valido')

    expect(mockRepoRefresh.update).toHaveBeenCalledWith(
      { jti: 'token-id' },
      { revoked: true }
    )
  })

  // ❌ logout erro (token inválido)
  it('deve lançar erro se token for inválido', async () => {
    ;(jwt.verify as any).mockImplementation(() => {
      throw new Error()
    })

    await expect(service.logout('token-invalido')).rejects.toBeInstanceOf(
      AppError
    )
  })

  // ✅ logoutAll
  it('deve invalidar todos os tokens do usuário', async () => {
    await service.logoutAll('user-1')

    expect(mockRepoRefresh.update).toHaveBeenCalledWith(
      { pesquisador: { id: 'user-1' } },
      { revoked: true }
    )
  })
})
