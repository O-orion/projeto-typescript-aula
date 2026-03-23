import { appDataSource } from '../database/appDataSource.js'
import Leitura from '../entities/Leitura'
import { Sensor } from '../entities/Sensor'
import { AppError } from '../errors/AppError'
import type { CreateLeituraDTO } from '../types/createLeituraDTO'

class LeituraService {
  private leituraRepository = appDataSource.getRepository(Leitura)
  private sensorRepository = appDataSource.getRepository(Sensor)

  public async findAll(): Promise<Leitura[]> {
    return await this.leituraRepository.find({
      relations: {
        sensor: true,
      },
    })
  }

  public async findById(id: string): Promise<Leitura> {
    const leitura = await this.leituraRepository.findOneBy({ id })

    if (!leitura) {
      throw new AppError(404, 'Leitura não encontrada')
    }

    return leitura
  }

  public async create(data: CreateLeituraDTO): Promise<Leitura> {
    const sensor = await this.sensorRepository.findOne({
      where: { id: data.sensor_id },
    })

    if (!sensor) {
      throw new AppError(404, 'Sensor não foi encontrado!')
    }

    const novaLeitura = this.leituraRepository.create({
      umidade: data.umidade,
      temperatura: data.temperatura,
      dataHora: new Date(),
      sensor: sensor,
    })
    await this.leituraRepository.save(novaLeitura)
    return novaLeitura
  }

  public async update(id: string, data: Leitura): Promise<Leitura> {
    const leituraExiste = await this.leituraRepository.findOneBy({ id })

    if (!leituraExiste) {
      throw new AppError(404, 'Leitura não encontrada')
    }

    const updateData = this.leituraRepository.create(data)
    const leituraAtualizada = this.leituraRepository.merge(
      leituraExiste,
      updateData
    )

    await this.leituraRepository.save(leituraAtualizada)
    return leituraAtualizada
  }

  public async delete(id: string): Promise<void> {
    const leitura = await this.leituraRepository.findOneBy({ id })

    if (!leitura) {
      throw new AppError(404, 'Leitura não encontrada')
    }

    await this.leituraRepository.remove(leitura)
  }

  async listarLeiturasPorArea(areaId: string) {
    const rows = await this.leituraRepository
      .createQueryBuilder('leitura')
      .innerJoin('leitura.sensor', 'sensor')
      .innerJoin('sensor.area', 'area')
      .where('area.id = :areaId', { areaId })
      .orderBy('leitura.dataHora', 'ASC')
      .getMany()

    const labels: string[] = []
    const temperatura: number[] = []
    const umidade: number[] = []

    for (const leitura of rows) {
      labels.push(
        new Date(leitura.dataHora).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )

      temperatura.push(leitura.temperatura)
      umidade.push(leitura.umidade)
    }

    return {
      labels,
      temperatura,
      umidade,
    }
  }
}

export default LeituraService
