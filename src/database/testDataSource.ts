import { DataSource } from "typeorm";
import Pesquisador from "../entities/Pesquisador.js";
import RefreshToken from "../entities/RefreshToken.js";
import Area from "../entities/Area.js";
import { Sensor } from "../entities/Sensor.js";
import Leitura from "../entities/Leitura.js";

export const testDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  dropSchema: true,
  entities: [Pesquisador, RefreshToken],
  synchronize: true,
  logging: false,
});