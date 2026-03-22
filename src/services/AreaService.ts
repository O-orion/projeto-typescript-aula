import { appDataSource } from '../database/appDataSource.js';
import Area from '../entities/Area.js';
import { AppError } from '../errors/AppError.js';

class AreaService {
    private areaRepository = appDataSource.getRepository(Area);

    public async findAll(): Promise<Area[]> {
        return await this.areaRepository.find({ relations: ['sensores'] });
    }

    public async findById(id: string): Promise<Area> {
        id = id.trim()
        const area = await this.areaRepository.findOne({ where: { id }, relations: ['sensores'] });
        if (!area) {
            throw new AppError(404, "Área não encontrada!");
        }
        return area;
    }

    public async create(data: Area): Promise<Area> {
        const novaArea = this.areaRepository.create(data);
        await this.areaRepository.save(novaArea);
        return novaArea;
    }


    async buscarLeiturasDaArea(areaId: string) {
        return await this.areaRepository.findOne({
            where: { id: areaId },
            relations: ['sensores', 'sensores'],
            order: {
            sensores: {
                leituras: {
                dataHora: 'ASC'
                }
            }
            }
        });
    }

    async contarSensorPorArea(id: string) {
        id = id.trim()
        const area = await this.areaRepository.findOne({ where: { id }, relations: ['sensores'] });
        if (!area) {
            throw new AppError(404, "Área não encontrada!");
        }

        const ativos = area.sensores.filter(s => s.status == 'Ativo').length;
        return {
                total: area.sensores.length,
                ativos,
                inativos: area.sensores.length - ativos
            };
    }

    public async findLeiturasByArea(areaId: string) {
        // Primeiro, verificamos se a área existe, buscando por area
        const area = await this.areaRepository.findOne({
            where: { id: areaId },
            relations: {
                sensores: {
                    leituras: true
                }
            }
        });

        if (!area) {
            throw new AppError(404, "Área não encontrada!");
        }

        const todasAsLeituras = area.sensores.flatMap(sensor => sensor.leituras);

        return todasAsLeituras;
    }

    public async update(id: string, data: Partial<Area>): Promise<Area> {
        const areaExiste = await this.areaRepository.findOneBy({ id });

        if (!areaExiste) {
            throw new AppError(404, "Área não encontrada!");
        }

        const areaAtualizada = this.areaRepository.merge(areaExiste, data);
        await this.areaRepository.save(areaAtualizada);
        return areaAtualizada;
    }

    public async delete(id: string): Promise<void> {
        const area = await this.areaRepository.findOneBy({ id });

        if (!area) {
            throw new AppError(404, "Área não encontrada!");
        }

        await this.areaRepository.remove(area);
    }
}

export default AreaService;