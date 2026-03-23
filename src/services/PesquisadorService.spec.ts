import { beforeEach, describe, expect, it, vi } from 'vitest'

// 🔹 mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

// 🔹 mock repository
const mockRepo = {
  find: vi.fn(),
  findOneBy: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  merge: vi.fn(),
  remove: vi.fn(),
}

// 🔹 mock datasource
vi.mock('../database/appDataSource.js', () => ({
  appDataSource: {
    getRepository: () => mockRepo,
  },
}))

// 🔹 importar depois do mock
import bcrypt from 'bcryptjs'
import { AppError } from '../errors/AppError.js'
import PesquisadorService from './PesquisadorService.js'

describe('PesquisadorService', () => {
  let service: PesquisadorService

  beforeEach(() => {
    service = new PesquisadorService()
    vi.clearAllMocks()
  })

  // ✅ findAll
  it('deve retornar todos os pesquisadores', async () => {
    mockRepo.find.mockResolvedValue([{ id: '1' }])

    const result = await service.findAll()

    expect(result).toHaveLength(1)
  })

  // ❌ findById erro
  it('deve lançar erro se pesquisador não existir', async () => {
    mockRepo.findOneBy.mockResolvedValue(null)

    await expect(service.findById('1')).rejects.toBeInstanceOf(AppError)
  })

  // ✅ findById sucesso
  it('deve retornar pesquisador por id', async () => {
    mockRepo.findOneBy.mockResolvedValue({ id: '1' })

    const result = await service.findById('1')

    expect(result).toHaveProperty('id')
  })

  // ❌ create erro (email ou matrícula já existem)
  it('deve lançar erro se email ou matrícula já existirem', async () => {
    mockRepo.findOneBy
      .mockResolvedValueOnce({ email: 'existe' }) // email
      .mockResolvedValueOnce(null) // matricula

    await expect(
      service.create({
        nome: 'Lucas',
        email: 'existe',
        senha: '123',
        matricula: '123',
        titulacao: 'dev',
        dataNascimento: new Date(),
      } as any)
    ).rejects.toBeInstanceOf(AppError)
  })

  // ✅ create sucesso
  it('deve criar pesquisador com senha criptografada', async () => {
    mockRepo.findOneBy
      .mockResolvedValueOnce(null) // email
      .mockResolvedValueOnce(null) // matricula

    ;(bcrypt.hash as any).mockResolvedValue('senha-hash')

    mockRepo.create.mockReturnValue({
      id: '1',
      nome: 'Lucas',
      email: 'lucas@email.com',
      senha: 'senha-hash',
    })

    mockRepo.save.mockResolvedValue({
      id: '1',
      nome: 'Lucas',
      email: 'lucas@email.com',
    })

    const result = await service.create({
      nome: 'Lucas',
      email: 'lucas@email.com',
      senha: '123',
      matricula: '123',
      titulacao: 'dev',
      dataNascimento: new Date(),
    } as any)

    expect(bcrypt.hash).toHaveBeenCalled()
    expect(result).toHaveProperty('id')
  })

  // ❌ update erro
  it('deve lançar erro ao atualizar pesquisador inexistente', async () => {
    mockRepo.findOneBy.mockResolvedValue(null)

    await expect(service.update('1', {} as any)).rejects.toBeInstanceOf(
      AppError
    )
  })

  // ✅ update sucesso
  it('deve atualizar pesquisador', async () => {
    const pesquisador = { id: '1', nome: 'Antigo' }

    mockRepo.findOneBy.mockResolvedValue(pesquisador)
    mockRepo.create.mockReturnValue({ nome: 'Novo' })
    mockRepo.merge.mockReturnValue({ id: '1', nome: 'Novo' })
    mockRepo.save.mockResolvedValue({ id: '1', nome: 'Novo' })

    const result = await service.update('1', { nome: 'Novo' } as any)

    expect(result.nome).toBe('Novo')
  })

  // ❌ delete erro
  it('deve lançar erro ao deletar pesquisador inexistente', async () => {
    mockRepo.findOneBy.mockResolvedValue(null)

    await expect(service.delete('1')).rejects.toBeInstanceOf(AppError)
  })

  // ✅ delete sucesso
  it('deve deletar pesquisador', async () => {
    const pesquisador = { id: '1' }

    mockRepo.findOneBy.mockResolvedValue(pesquisador)
    mockRepo.remove.mockResolvedValue(undefined)

    await service.delete('1')

    expect(mockRepo.remove).toHaveBeenCalledWith(pesquisador)
  })
})
