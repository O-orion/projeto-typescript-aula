import { vi, describe, it, expect, beforeEach } from "vitest";

vi.resetModules();

const mockSensorRepository = {
  find: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  merge: vi.fn(),
  remove: vi.fn(),
};

const mockAreaRepository = {
  findOne: vi.fn(),
};

vi.mock("../../../src/database/appDataSource.js", () => {
  return {
    appDataSource: {
      getRepository: (entity: any) => {
        if (entity === Sensor) return mockSensorRepository;
        if (entity === Area) return mockAreaRepository;

        return {};
      },
    },
  };
});

import SensorService from "../../../src/services/SensorService";
import {
  areaMock,
  sensorCreateDataMock,
  sensorMock,
} from "../../mocks/mocks";
import { Sensor } from "../../../src/entities/Sensor";
import Area from "../../../src/entities/Area";
import { AppError } from "../../../src/errors/AppError";

describe("SensorService testes", () => {
  const service = new SensorService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Deve retornar todos os sensores", async () => {
    // Arrange
    const sensorsMock = [sensorMock];
    mockSensorRepository.find.mockResolvedValue(sensorsMock);

    // Act
    const result = await service.getAllSensors();

    // Assert
    expect(result).toEqual(sensorsMock);
  });

  it("Deve criar um sensor com sucesso", async () => {
    // Arrange
    mockSensorRepository.findOne.mockResolvedValue(null);
    mockAreaRepository.findOne.mockResolvedValue(areaMock);
    mockSensorRepository.create.mockReturnValue(sensorMock);
    mockSensorRepository.save.mockResolvedValue(sensorMock);

    // Act
    const sensorCreated = await service.addSensor(sensorCreateDataMock);

    // Assert
    expect(sensorCreated).toHaveProperty("id");
    expect(sensorCreated.id).toBe(sensorMock.id);
    expect(sensorCreated).toEqual(sensorMock);
    expect(mockSensorRepository.findOne).toHaveResolved();
    expect(mockAreaRepository.findOne).toHaveResolved();
    expect(mockSensorRepository.create).toHaveBeenCalledOnce();
    expect(mockSensorRepository.save).toHaveResolved();
  });

  it("Deve lançar um erro ao criar um sensor com serialNumber que já existe", async () => {
    // Arrange
    mockSensorRepository.findOne.mockResolvedValue(sensorMock);

    // Act & Assert
    try {
      await service.addSensor({ serialNumber: "123", area_id: 1 });
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        "Sensor com este Serial Number já cadastrado!",
      );

      expect(mockSensorRepository.findOne).toHaveBeenCalledOnce();
      expect(mockAreaRepository.findOne).not.toHaveBeenCalled();
      expect(mockSensorRepository.create).not.toHaveBeenCalled();
      expect(mockSensorRepository.save).not.toHaveBeenCalled();
    }
  });

  it("Deve lançar um erro ao criar um sensor com uma área que não foi cadastrada", async () => {
    // Arrange
    mockSensorRepository.findOne.mockResolvedValue(null);
    mockAreaRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    try {
      await service.addSensor({ serialNumber: "123", area_id: 1 });
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Area não foi encontrada!");

      expect(mockSensorRepository.findOne).toHaveResolved();
      expect(mockAreaRepository.findOne).toHaveResolved();
      expect(mockSensorRepository.create).not.toHaveBeenCalled();
      expect(mockSensorRepository.save).not.toHaveResolved();
    }
  });

  it("Deve atualizar o fabricante e Modelo do sensor com sucesso sem alterar as demais propriedades", async () => {
    // Arrange
    const id = "2f19dfa2-ddbd-4f74-9b5f-fee3467e64bf";
    const fabricante = "Fabricante Y";
    const modelo = "Modelo Y";
    const data: Partial<Sensor> = { fabricante, modelo };

    mockSensorRepository.findOneBy.mockResolvedValueOnce(sensorMock);
    mockSensorRepository.create.mockReturnValue({ fabricante, modelo });
    mockSensorRepository.merge.mockReturnValue({
      ...sensorMock,
      fabricante,
      modelo,
    });
    mockSensorRepository.save.mockResolvedValue({
      ...sensorMock,
      fabricante,
      modelo,
    });

    // Act
    const sensorUpdated = await service.updateSensor(id, data);

    // Assert
    expect(sensorUpdated.id).toBe(sensorMock.id);
    expect(sensorUpdated.fabricante).toBe(fabricante);
    expect(sensorUpdated.modelo).toBe(modelo);
    expect(sensorUpdated.serialNumber).toBe(sensorMock.serialNumber);

    expect(mockSensorRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockSensorRepository.findOneBy).toHaveResolved();
    expect(mockSensorRepository.create).toHaveBeenCalledOnce();
    expect(mockSensorRepository.merge).toHaveBeenCalledOnce();
    expect(mockSensorRepository.save).toHaveResolved();
  });

  it("Deve lançar um erro ao tentar atualizar um sensor que não existe", async () => {
    // Arrange
    const id = "2f19dfa2-ddbd-4f74-9b5f-fee1267e8722";
    mockSensorRepository.findOneBy.mockResolvedValue(null);

    // Act & Assert
    try {
      await service.updateSensor(id, { serialNumber: "123", cicloLeitura: 1 });
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Sensor não encontrado!");

      expect(mockSensorRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockSensorRepository.findOneBy).toHaveResolvedWith(null);
      expect(mockSensorRepository.create).not.toHaveBeenCalled();
      expect(mockSensorRepository.merge).not.toHaveBeenCalled();
      expect(mockSensorRepository.save).not.toHaveResolved();
    }
  });

  it("Deve remover um sensor com sucesso", async () => {
    // Arrange
    const id = "2f19dfa2-ddbd-4f74-9b5f-fee3467e64bf";
    mockSensorRepository.findOneBy.mockResolvedValueOnce(sensorMock);
    mockSensorRepository.remove.mockResolvedValue(sensorMock);

    // Act
    await service.deleteSensor(id);

    // Assert
    expect(mockSensorRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockSensorRepository.remove).toHaveResolved();
  });

  it("Deve lançar um erro ao tentar remover um sensor que não existe", async () => {
    // Arrange
    const id = "2f19dfa2-ddbd-4f74-9b5f-fee1267e8722";
    mockSensorRepository.findOneBy.mockResolvedValue(null);

    // Act & Assert
    try {
      await service.deleteSensor(id);
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Sensor não encontrado!");

      expect(mockSensorRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockSensorRepository.remove).not.toHaveResolvedWith(null);
    }
  });
});
