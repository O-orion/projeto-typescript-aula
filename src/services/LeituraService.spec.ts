import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../errors/AppError.js'
import LeituraService from './LeituraService.js'

// 🔹 mocks
const mockLeituraRepo = {
  find: vi.fn(),
  findOneBy: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  merge: vi.fn(),
  remove: vi.fn(),
  createQueryBuilder: vi.fn(),
}

const mockSensorRepo = {
  findOne: vi.fn(),
}

// 🔹 mock datasource
vi.mock('../database/appDataSource.js', () => ({
  appDataSource: {
    getRepository: (entity: any) => {
      if (entity.name === 'Leitura') return mockLeituraRepo
      return mockSensorRepo
    },
  },
}))

describe('LeituraService', () => {
  let service: LeituraService

  beforeEach(() => {
    service = new LeituraService()
    vi.clearAllMocks()
  })

  // ✅ findAll
  it('deve retornar todas as leituras', async () => {
    mockLeituraRepo.find.mockResolvedValue([{ id: '1' }])

    const result = await service.findAll()

    expect(result).toHaveLength(1)
  })

  // ❌ findById erro
  it('deve lançar erro se leitura não existir', async () => {
    mockLeituraRepo.findOneBy.mockResolvedValue(null)

    await expect(service.findById('1')).rejects.toBeInstanceOf(AppError)
  })

  // ✅ findById sucesso
  it('deve retornar leitura por id', async () => {
    mockLeituraRepo.findOneBy.mockResolvedValue({ id: '1' })

    const result = await service.findById('1')

    expect(result).toHaveProperty('id')
  })

  // ❌ create erro (sensor não existe)
  it('deve lançar erro se sensor não existir', async () => {
    mockSensorRepo.findOne.mockResolvedValue(null)

    await expect(
      service.create({
        sensor_id: '1',
        temperatura: 25,
        umidade: 60,
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  // ✅ create sucesso
  it('deve criar leitura com sucesso', async () => {
    const sensor = { id: '1' }

    mockSensorRepo.findOne.mockResolvedValue(sensor)

    mockLeituraRepo.create.mockReturnValue({
      id: '1',
      temperatura: 25,
      umidade: 60,
      sensor,
    })

    mockLeituraRepo.save.mockResolvedValue({
      id: '1',
      temperatura: 25,
      umidade: 60,
    })

    const result = await service.create({
      sensor_id: '1',
      temperatura: 25,
      umidade: 60,
    })

    expect(result).toHaveProperty('id')
  })

  // ❌ update erro
  it('deve lançar erro ao atualizar leitura inexistente', async () => {
    mockLeituraRepo.findOneBy.mockResolvedValue(null)

    await expect(service.update('1', {} as any)).rejects.toBeInstanceOf(
      AppError
    )
  })

  // ✅ update sucesso
  it('deve atualizar leitura', async () => {
    const leitura = { id: '1' }

    mockLeituraRepo.findOneBy.mockResolvedValue(leitura)
    mockLeituraRepo.create.mockReturnValue({ temperatura: 30 })
    mockLeituraRepo.merge.mockReturnValue({ id: '1', temperatura: 30 })
    mockLeituraRepo.save.mockResolvedValue({ id: '1', temperatura: 30 })

    const result = await service.update('1', { temperatura: 30 } as any)

    expect(result.temperatura).toBe(30)
  })

  // ❌ delete erro
  it('deve lançar erro ao deletar leitura inexistente', async () => {
    mockLeituraRepo.findOneBy.mockResolvedValue(null)

    await expect(service.delete('1')).rejects.toBeInstanceOf(AppError)
  })

  // ✅ delete sucesso
  it('deve deletar leitura', async () => {
    const leitura = { id: '1' }

    mockLeituraRepo.findOneBy.mockResolvedValue(leitura)
    mockLeituraRepo.remove.mockResolvedValue(undefined)

    await service.delete('1')

    expect(mockLeituraRepo.remove).toHaveBeenCalledWith(leitura)
  })

  // ✅ listarLeiturasPorArea
  it('deve retornar leituras formatadas por área', async () => {
    const fakeRows = [
      {
        dataHora: new Date('2024-01-01T10:00:00'),
        temperatura: 25,
        umidade: 60,
      },
      {
        dataHora: new Date('2024-01-01T11:00:00'),
        temperatura: 26,
        umidade: 65,
      },
    ]

    const qbMock = {
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue(fakeRows),
    }

    mockLeituraRepo.createQueryBuilder.mockReturnValue(qbMock)

    const result = await service.listarLeiturasPorArea('1')

    expect(result.labels.length).toBe(2)
    expect(result.temperatura).toEqual([25, 26])
    expect(result.umidade).toEqual([60, 65])
  })
})
