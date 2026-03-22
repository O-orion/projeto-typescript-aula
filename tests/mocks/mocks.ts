import Area from "../../src/entities/Area";
import { Sensor } from "../../src/entities/Sensor";

export const areaMock: Area = {
  id: "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589",
  nome: "Area X",
  bioma: "Bioma X",
  latitude: -3.065646,
  longitude: -60.064381,
  largura: 1000,
  comprimento: 450,
  sensores: [],
};

export const sensorMock: Sensor = {
  id: "2f19dfa2-ddbd-4f74-9b5f-fee3467e64bf",
  serialNumber: "00001",
  fabricante: "Fabricante X",
  modelo: "Modelo X",
  tipo: "Tipo X",
  status: "Ativo",
  dataInstalacao: new Date(1773978173000),
  cicloLeitura: 23,
  latitude: -3.065604,
  longitude: -60.064461,
  area: areaMock,
  leituras: [],
};

export const sensorCreateDataMock = {
  serialNumber: "00001",
  fabricante: "Fabricante X",
  modelo: "Modelo X",
  tipo: "Tipo X",
  status: "Ativo",
  dataInstalacao: new Date(1773978173000),
  cicloLeitura: 23,
  latitude: -3.065604,
  longitude: -60.064461,
  area: areaMock,
  leituras: [],
};

export const bodyPesquisadorMock = {
  nome: "professor",
  email: "professor@email.com",
  senha: "minimo8chars#",
  matricula: "MAT001",
  especialidade: "Biologia",
  titulacao: "Mestrado",
  dataNascimento: new Date("1995-05-20"),
};

export const bodyAdminMock = {
  nome: "admin",
  email: "admin@email.com",
  senha: "minimo8chars@",
  matricula: "MAT002",
  especialidade: "Química",
  titulacao: "PhD",
  dataNascimento: new Date("1983-03-21"),
};

export const bodyLoginAdminMock = {
  email: "admin@email.com",
  senha: "minimo8chars@",
};

export const failEmailBodyLoginMock = {
  email: "admin123@email.com",
  senha: "minimo8chars@",
};

export const failSenhaBodyLoginMock = {
  email: "admin@email.com",
  senha: "minimo867chars@",
};

export const failBodyPesquisadorMock = {
  nome: "",
  email: "adminemail.com",
  senha: "minimo8chars",
  matricula: 100,
  especialidade: "Biologia",
  titulacao: "Mestrado",
  dataNascimento: new Date("1995-05-20"),
};
