import type { Request, Response } from 'express'
import type LeituraService from '../services/LeituraService.js'

export default class LeituraController {
  private leituraService: LeituraService

  constructor(leituraService: LeituraService) {
    this.leituraService = leituraService
  }

  public async findAll(req: Request, res: Response) {
    const leituras = await this.leituraService.findAll()
    res.status(200).json(leituras)
  }

  public async findById(req: Request, res: Response) {
    const { id } = req.params
    const leitura = await this.leituraService.findById(id as string)
    res.status(200).json(leitura)
  }

  public async create(req: Request, res: Response) {
    const body = req.body
    const leitura = await this.leituraService.create(body)
    res.status(201).json(leitura)
  }

  public async update(req: Request, res: Response) {
    const { id } = req.params
    const body = req.body
    const leitura = await this.leituraService.update(id as string, body)
    res.status(200).json(leitura)
  }

  public async delete(req: Request, res: Response) {
    const { id } = req.params
    await this.leituraService.delete(id as string)
    res.status(204).json({ status: 'Leitura deletada' })
  }

  public async listarLeiturasPorArea(req: Request, res: Response) {
    const { areaId } = req.params
    const limit = Number(req.query.limit ?? 50)

    const leituras = await this.leituraService.listarLeiturasPorArea(
      areaId as string
    )

    return res.json(leituras)
  }
}
