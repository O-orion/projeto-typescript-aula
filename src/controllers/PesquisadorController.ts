import type { Request, Response } from "express";
import type PesquisadorService from "../services/PesquisadorService.js";

export default class PesquisadorController {

    private pesquisadorService: PesquisadorService;

    constructor(pesquisadorService: PesquisadorService) {
        this.pesquisadorService = pesquisadorService;
    }

    public async findAll(req: Request, res: Response) {
        const pesquisadores = await this.pesquisadorService.findAll();
        res.status(200).json(pesquisadores);
    }

    public async findById(req: Request, res: Response) {
        const { id } = req.params;
        const pesquisador = await this.pesquisadorService.findById(id as string);
        res.status(200).json(pesquisador);
    }

    public async create(req: Request, res: Response) {
        const body = req.body;
        const pesquisador = await this.pesquisadorService.create(body);
        res.status(201).json(pesquisador);
    }

    public async update(req: Request, res: Response) {
        const { id } = req.params;
        const body = req.body;
        const pesquisador = await this.pesquisadorService.update(id as string, body);
        res.status(200).json(pesquisador);
    }

    public async delete(req: Request, res: Response) {
        const { id } = req.params;
        await this.pesquisadorService.delete(id as string);
        res.status(204).end();
    }
}