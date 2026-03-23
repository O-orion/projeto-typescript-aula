import { DataSource } from 'typeorm'
import Area from '../entities/Area'
import Leitura from '../entities/Leitura'
import Pesquisador from '../entities/Pesquisador'
import RefreshToken from '../entities/RefreshToken'
import { Sensor } from '../entities/Sensor'

export const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT as string),
  username: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
  database: process.env.DB_NAME as string,

  entities: [Pesquisador, RefreshToken, Area, Sensor, Leitura],

  logging: true,
  synchronize: process.env.NODE_ENV !== 'production',
})
