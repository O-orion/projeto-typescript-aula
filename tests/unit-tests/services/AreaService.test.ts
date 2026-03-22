import { beforeEach, describe, expect, it, vi } from "vitest";

vi.resetModules();

const mockAreaRepository = {
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  merge: vi.fn(),
  findOneBy: vi.fn(),
  remove: vi.fn(),
};

vi.mock("../../../src/database/appDataSource.js", () => {
  return {
    appDataSource: {
      getRepository: () => {
        return mockAreaRepository;
      },
    },
  };
});

import AreaService from "../../../src/services/AreaService";
import { areaMock } from "../../mocks/mocks";
import Area from "../../../src/entities/Area";
import { AppError } from "../../../src/errors/AppError";

describe("AreaService testes", () => {
  const service = new AreaService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Deve retornar todas as áreas", async () => {
    // Arrange
    mockAreaRepository.find.mockResolvedValue([areaMock]);

    // Act
    const areas = await service.findAll();

    // Assert
    expect(areas).toBeInstanceOf(Array);
    expect(areas).toHaveLength(1);
    expect(areas).toEqual([areaMock]);
    expect(mockAreaRepository.find).toHaveBeenCalledWith({
      relations: ["sensores"],
    });
    expect(mockAreaRepository.find).toHaveResolvedTimes(1);
  });

  it("Deve buscar uma área pelo seu id", async () => {
    // Arrange
    const id = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    mockAreaRepository.findOne.mockResolvedValue(areaMock);

    // Act
    const area = await service.findById(id);

    // Assert
    expect(area).toBeInstanceOf(Object);
    expect(area).toHaveProperty("id", id);
    expect(area).toEqual(areaMock);
    expect(mockAreaRepository.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: ["sensores"],
    });
    expect(mockAreaRepository.findOne).toHaveResolvedTimes(1);
  });

  it("Deve lançar um erro ao buscar área com um id que não existe", async () => {
    // Arrange
    const id = "494fdf41-579c-4aec-9f43-7d9c7328b0c1";
    mockAreaRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    try {
      const area = await service.findById(id);
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Área não encontrada!");
      expect(error.statusCode).toBe(404);
      expect(mockAreaRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ["sensores"],
      });
      expect(mockAreaRepository.findOne).toHaveResolvedTimes(1);
      expect(mockAreaRepository.findOne).toHaveResolvedWith(null);
    }
  });

  it("Deve criar uma área com sucesso", async () => {
    // Arrange
    mockAreaRepository.create.mockReturnValue(areaMock);
    mockAreaRepository.save.mockResolvedValue(areaMock);

    // Act
    const area = await service.create(areaMock);

    // Assert
    expect(area).toBeInstanceOf(Object);
    expect(area).toHaveProperty("id", areaMock.id);
    expect(area).toEqual(areaMock);
    expect(mockAreaRepository.create).toHaveBeenCalledWith(areaMock);
    expect(mockAreaRepository.save).toHaveBeenCalledWith(areaMock);
    expect(mockAreaRepository.save).toHaveResolvedTimes(1);
  });
  //

  it("Deve buscar leituras da área com ordenação correta", async () => {
    // Arrange
    // Criei algo mais simples para testar
    const id = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    const mockLeiturasArea = {
      id: "1",
      sensores: [
        {
          leituras: [{ dataHora: "2024-01-01" }, { dataHora: "2024-01-02" }],
        },
      ],
    };
    mockAreaRepository.findOne.mockResolvedValue(mockLeiturasArea);

    // Act
    const leituras = await service.buscarLeiturasDaArea(id);

    // Assert
    expect(leituras).toEqual(mockLeiturasArea);
    expect(mockAreaRepository.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: ["sensores", "sensores"],
      order: {
        sensores: {
          leituras: {
            dataHora: "ASC",
          },
        },
      },
    });
    expect(mockAreaRepository.findOne).toHaveResolvedTimes(1);
  });

  it("Deve contar corretamente os sensores de uma área", async () => {
    // Arrange
    // Criei algo mais simples para testar
    const id = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    const mockSensoresArea = {
      id,
      sensores: [
        { status: "Ativo" },
        { status: "Inativo" },
        { status: "Ativo" },
        { status: "Ativo" },
        { status: "Ativo" },
        { status: "Inativo" },
      ],
    };
    mockAreaRepository.findOne.mockResolvedValue(mockSensoresArea);

    // Act
    const contagemSensores = await service.contarSensorPorArea(id);

    // Assert
    expect(contagemSensores.total).toBe(6);
    expect(contagemSensores.ativos).toBe(4);
    expect(contagemSensores.inativos).toBe(2);
    expect(mockAreaRepository.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: ["sensores"],
    });
    expect(mockAreaRepository.findOne).toHaveResolvedTimes(1);
  });

  it("Deve lançar um erro ao tentar contar sensores de uma área com um id que não existe", async () => {
    // Arrange
    const id = "a6ef54dc-eb2b-7f9a-d98c-1e4d074e4022";
    mockAreaRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    try {
      await service.contarSensorPorArea(id);
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Área não encontrada!");
      expect(error.statusCode).toBe(404);
      expect(mockAreaRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ["sensores"],
      });
      expect(mockAreaRepository.findOne).toHaveResolvedTimes(1);
    }
  });

  it("Deve retornar todas as leituras da área em um array único", async () => {
    // Arrange
    const areaId = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    const leitura1 = { id: "3d981b19-3ae6-4972-85e4-832facc931a9", valor: 10 };
    const leitura2 = { id: "e8dccad2-a35c-4c07-ba0f-39435a6839c6", valor: 20 };
    const leitura3 = { id: "2695da36-a2cb-411f-bc15-268675ce0681", valor: 30 };
    const mockLeiturasArea = {
      id: areaId,
      sensores: [
        {
          leituras: [leitura1, leitura2],
        },
        {
          leituras: [leitura3],
        },
      ],
    };
    mockAreaRepository.findOne.mockResolvedValue(mockLeiturasArea);

    // Act
    const leituras = await service.findLeiturasByArea(areaId);

    // Assert
    expect(leituras).toEqual([leitura1, leitura2, leitura3]);
    expect(mockAreaRepository.findOne).toHaveBeenCalledWith({
      where: { id: areaId },
      relations: {
        sensores: {
          leituras: true,
        },
      },
    });
    expect(mockAreaRepository.findOne).toHaveResolvedTimes(1);
  });

  it("Deve lançar um erro ao tentar ver leituras com id de uma área que não existe", async () => {
    // Arrange
    const areaId = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    mockAreaRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    try {
      await service.findLeiturasByArea(areaId);
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Área não encontrada!");
      expect(error.statusCode).toBe(404);
      expect(mockAreaRepository.findOne).toHaveBeenCalledWith({
        where: { id: areaId },
        relations: {
          sensores: {
            leituras: true,
          },
        },
      });
      expect(mockAreaRepository.findOne).toHaveResolvedTimes(1);
    }
  });

  it("Deve atualizar uma área com sucesso", async () => {
    // Arrange
    const areaId = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    const data: Partial<Area> = {
      nome: "Area Y",
      bioma: "Bioma Y",
      largura: 1200,
    };
    mockAreaRepository.findOneBy.mockResolvedValue(areaMock);
    mockAreaRepository.merge.mockReturnValue({ ...areaMock, ...data });
    mockAreaRepository.save.mockResolvedValue({ ...areaMock, ...data });

    // Act
    const areaUpdated = await service.update(areaId, data);

    // Assert
    expect(areaUpdated.id).toBe(areaId);
    expect(areaUpdated).not.toEqual(areaMock);
    expect(mockAreaRepository.findOneBy).toHaveBeenCalledWith({ id: areaId });
    expect(mockAreaRepository.merge).toHaveBeenCalledWith(areaMock, data);
    expect(mockAreaRepository.save).toHaveBeenCalledWith({
      ...areaMock,
      ...data,
    });
  });

  it("Deve lançar um erro ao tentar atualizar uma área com um id que não existe", async () => {
    // Arrange
    const areaId = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    const data: Partial<Area> = {
      nome: "Area Y",
      bioma: "Bioma Y",
      largura: 1200,
    };
    mockAreaRepository.findOneBy.mockResolvedValue(null);

    // Act & Assert
    try {
      await service.update(areaId, data);
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Área não encontrada!");
      expect(error.statusCode).toBe(404);
      expect(mockAreaRepository.findOneBy).toHaveBeenCalledWith({ id: areaId });
      expect(mockAreaRepository.merge).not.toHaveBeenCalled();
      expect(mockAreaRepository.save).not.toHaveBeenCalled();
    }
  });

  it("Deve remover uma área com sucesso", async () => {
    // Arrange
    const areaId = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    mockAreaRepository.findOneBy.mockResolvedValue(areaMock);
    mockAreaRepository.remove.mockReturnValue(areaMock);

    // Act
    await service.delete(areaId);

    // Assert
    expect(mockAreaRepository.findOneBy).toHaveBeenCalledWith({ id: areaId });
    expect(mockAreaRepository.remove).toHaveBeenCalledWith(areaMock);
  });

  it("Deve lançar um erro ao tentar remover uma área com um id que não existe", async () => {
    // Arrange
    const areaId = "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589";
    mockAreaRepository.findOneBy.mockResolvedValue(null);

    // Act & Assert
    try {
      await service.delete(areaId);
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Área não encontrada!");
      expect(error.statusCode).toBe(404);
      expect(mockAreaRepository.findOneBy).toHaveBeenCalledWith({ id: areaId });
      expect(mockAreaRepository.remove).not.toHaveBeenCalled();
    }
  });
});
