import type { Request, Response } from 'express'
import type AreaService from '../services/AreaService.js'

export default class AreaController {
  private areaService: AreaService

  constructor(areaService: AreaService) {
    this.areaService = areaService
  }

  public async findAll(req: Request, res: Response) {
    const areas = await this.areaService.findAll()
    res.status(200).json(areas)
  }

  public async findById(req: Request, res: Response) {
    const { id } = req.params
    const area = await this.areaService.findById(id as string)
    res.status(200).json(area)
  }

  public async getLeituras(req: Request, res: Response) {
    const { id } = req.params
    const leituras = await this.areaService.findLeiturasByArea(id as string)

    res.status(200).json(leituras)
  }

  public async create(req: Request, res: Response) {
    const area = await this.areaService.create(req.body)
    res.status(201).json(area)
  }

  public async update(req: Request, res: Response) {
    const { id } = req.params
    const area = await this.areaService.update(id as string, req.body)
    res.status(200).json(area)
  }

  public async delete(req: Request, res: Response) {
    const { id } = req.params
    await this.areaService.delete(id as string)
    res.status(204).send()
  }

  public async sensoresAtivos(req: Request, res: Response) {
    const { id } = req.params
    const result = await this.areaService.contarSensorPorArea(id as string)
    res.status(200).json(result)
  }
}
