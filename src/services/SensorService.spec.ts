import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../errors/AppError'
import SensorService from './SensorService'

// 🔹 mocks dos repositórios
const mockSensorRepo = {
  find: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  merge: vi.fn(),
  remove: vi.fn(),
}

const mockAreaRepo = {
  findOne: vi.fn(),
}

// 🔹 mock do datasource
vi.mock('../database/appDataSource.js', () => ({
  appDataSource: {
    getRepository: (entity: any) => {
      if (entity.name === 'Sensor') return mockSensorRepo
      if (entity.name === 'Area') return mockAreaRepo
    },
  },
}))

describe('SensorService', () => {
  let service: SensorService

  beforeEach(() => {
    service = new SensorService()
    vi.clearAllMocks()
  })

  // ✅ getAllSensors
  it('deve listar todos sensores', async () => {
    mockSensorRepo.find.mockResolvedValue([{ id: '1' }])

    const result = await service.getAllSensors()

    expect(result).toHaveLength(1)
    expect(mockSensorRepo.find).toHaveBeenCalled()
  })

  // ✅ addSensor sucesso
  it('deve criar sensor com sucesso', async () => {
    const data = {
      id: '1',
      serialNumber: '123',
      area_id: 'area-1',
    }

    const areaMock = { id: 'area-1' }

    mockSensorRepo.findOne.mockResolvedValue(null)
    mockAreaRepo.findOne.mockResolvedValue(areaMock)

    mockSensorRepo.create.mockImplementation(data => data)

    mockSensorRepo.save.mockResolvedValue({
      id: '1',
      serialNumber: '123',
      area: areaMock,
    })

    const result = await service.addSensor(data)

    expect(result).toHaveProperty('id')
  })

  // ❌ sensor já existe
  it('deve lançar erro se serial já existir', async () => {
    mockSensorRepo.findOne.mockResolvedValue({ id: '1' })

    await expect(
      service.addSensor({ serialNumber: '123' })
    ).rejects.toBeInstanceOf(AppError)
  })

  // ❌ área não existe
  it('deve lançar erro se área não existir', async () => {
    mockSensorRepo.findOne.mockResolvedValue(null)
    mockAreaRepo.findOne.mockResolvedValue(null)

    await expect(
      service.addSensor({
        serialNumber: '123',
        area_id: 'area-x',
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  // ✅ update sucesso
  it('deve atualizar sensor', async () => {
    const sensorMock = { id: '1' }

    mockSensorRepo.findOneBy.mockResolvedValue(sensorMock)
    mockSensorRepo.create.mockReturnValue({ nome: 'novo' })
    mockSensorRepo.merge.mockReturnValue({ ...sensorMock, nome: 'novo' })
    mockSensorRepo.save.mockResolvedValue({ id: '1', nome: 'novo' })

    const result = await service.updateSensor('1', { nome: 'novo' })

    expect(result).toHaveProperty('nome', 'novo')
  })

  // ❌ update sensor não encontrado
  it('deve lançar erro ao atualizar sensor inexistente', async () => {
    mockSensorRepo.findOneBy.mockResolvedValue(null)

    await expect(service.updateSensor('1', {})).rejects.toBeInstanceOf(AppError)
  })

  // ✅ delete sucesso
  it('deve deletar sensor', async () => {
    const sensorMock = { id: '1' }

    mockSensorRepo.findOneBy.mockResolvedValue(sensorMock)
    mockSensorRepo.remove.mockResolvedValue(undefined)

    await service.deleteSensor('1')

    expect(mockSensorRepo.remove).toHaveBeenCalled()
  })

  // ❌ delete sensor não encontrado
  it('deve lançar erro ao deletar sensor inexistente', async () => {
    mockSensorRepo.findOneBy.mockResolvedValue(null)

    await expect(service.deleteSensor('1')).rejects.toBeInstanceOf(AppError)
  })
})
