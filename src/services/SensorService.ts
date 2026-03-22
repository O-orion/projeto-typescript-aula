import { AppError } from '../errors/AppError.js';
import { appDataSource } from '../database/appDataSource.js';
import { Sensor } from '../entities/Sensor.js';
import Area from '../entities/Area.js';

class SensorService {
    private sensorRepository = appDataSource.getRepository(Sensor);
    private areaRepository = appDataSource.getRepository(Area);

    public async getAllSensors(): Promise<Sensor[]> {
        return await this.sensorRepository.find();
    }

    public async addSensor(data: any): Promise<any> {
        const sensorExiste = await this.sensorRepository.findOne({ 
            where: { serialNumber: data.serialNumber } 
            
        });
        
        if (sensorExiste) {
            throw new AppError(400, "Sensor com este Serial Number já cadastrado!");
        }
        const area = await this.areaRepository.findOne({ 
            where: { id: data.area_id}
         })

         if(!area) {
            throw new AppError(404 ,"Area não foi encontrada!");
         }

       

        const novoSensor = this.sensorRepository.create({
        ...data,
        area: area // Aqui você está passando o objeto completo da área
         });
        await this.sensorRepository.save(novoSensor);
        return novoSensor;
    }

    public async updateSensor(id: string, data: Partial<Sensor>) {
        const sensorExiste = await this.sensorRepository.findOneBy({ id });
        
        if (!sensorExiste) {
            throw new AppError(404, "Sensor não encontrado!");
        }

        const update = this.sensorRepository.create(data);
        const sensorUpdate = this.sensorRepository.merge(sensorExiste, update);

        await this.sensorRepository.save(sensorUpdate);
        return sensorUpdate;
    }

    public async deleteSensor(id: string) {
        const sensor = await this.sensorRepository.findOneBy({ id });

        if (!sensor) {
            throw new AppError(404, "Sensor não encontrado!");
        }

        await this.sensorRepository.remove(sensor);
    }
}

export default SensorService;