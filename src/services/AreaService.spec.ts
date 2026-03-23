import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../errors/AppError'
import AreaService from './AreaService'

// mock do repository
const mockRepository = {
  find: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  merge: vi.fn(),
  remove: vi.fn(),
}

// mock do datasource
vi.mock('../database/appDataSource.js', () => ({
  appDataSource: {
    getRepository: () => mockRepository,
  },
}))

describe('AreaService', () => {
  let service: AreaService

  beforeEach(() => {
    service = new AreaService()
    vi.clearAllMocks()
  })

  // ✅ findAll
  it('deve retornar todas as áreas', async () => {
    mockRepository.find.mockResolvedValue([{ id: '1' }])

    const result = await service.findAll()

    expect(result).toHaveLength(1)
    expect(mockRepository.find).toHaveBeenCalled()
  })

  // ✅ findById sucesso
  it('deve retornar uma área por id', async () => {
    mockRepository.findOne.mockResolvedValue({ id: '1' })

    const result = await service.findById('1')

    expect(result).toHaveProperty('id')
  })

  // ❌ findById erro
  it('deve lançar erro se área não existir', async () => {
    mockRepository.findOne.mockResolvedValue(null)

    await expect(service.findById('1')).rejects.toBeInstanceOf(AppError)
  })

  // ✅ create
  it('deve criar uma nova área', async () => {
    const data = { nome: 'Área Teste' }

    mockRepository.create.mockReturnValue(data)
    mockRepository.save.mockResolvedValue(data)

    const result = await service.create(data as any)

    expect(mockRepository.create).toHaveBeenCalledWith(data)
    expect(mockRepository.save).toHaveBeenCalled()
    expect(result).toEqual(data)
  })

  // ✅ update sucesso
  it('deve atualizar uma área', async () => {
    const area = { id: '1', nome: 'Antigo' }

    mockRepository.findOneBy.mockResolvedValue(area)
    mockRepository.merge.mockReturnValue({ ...area, nome: 'Novo' })
    mockRepository.save.mockResolvedValue({ ...area, nome: 'Novo' })

    const result = await service.update('1', { nome: 'Novo' })

    expect(result.nome).toBe('Novo')
  })

  // ❌ update erro
  it('deve lançar erro ao atualizar área inexistente', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await expect(service.update('1', {})).rejects.toBeInstanceOf(AppError)
  })

  // ✅ delete sucesso
  it('deve deletar uma área', async () => {
    const area = { id: '1' }

    mockRepository.findOneBy.mockResolvedValue(area)
    mockRepository.remove.mockResolvedValue(undefined)

    await service.delete('1')

    expect(mockRepository.remove).toHaveBeenCalledWith(area)
  })

  // ❌ delete erro
  it('deve lançar erro ao deletar área inexistente', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await expect(service.delete('1')).rejects.toBeInstanceOf(AppError)
  })

  // ✅ contarSensorPorArea
  it('deve contar sensores corretamente', async () => {
    const areaMock = {
      sensores: [
        { status: 'Ativo' },
        { status: 'Inativo' },
        { status: 'Ativo' },
      ],
    }

    mockRepository.findOne.mockResolvedValue(areaMock)

    const result = await service.contarSensorPorArea('1')

    expect(result).toEqual({
      total: 3,
      ativos: 2,
      inativos: 1,
    })
  })
})
