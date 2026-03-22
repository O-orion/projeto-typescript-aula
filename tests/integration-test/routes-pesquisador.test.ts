import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import { testDataSource } from "../../src/database/testDataSource";
import { appDataSource } from "../../src/database/appDataSource";
import {
  bodyAdminMock,
  bodyPesquisadorMock,
  failBodyPesquisadorMock,
} from "../mocks/mocks";
import Pesquisador from "../../src/entities/Pesquisador";
import { clearDatabase } from "../helpers/database";

describe("Testes de integração para contexto total das rotas de Pesquisador", () => {
  beforeAll(async () => {
    await testDataSource.initialize();
    Object.assign(appDataSource, testDataSource);
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe("Testes de criação de pesquisadores", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Deve enviar uma requisição POST para /api/pesquisador, retornar um objeto pesquisador com código 201", async () => {
      const response = await request(app)
        .post("/api/pesquisador")
        .send(bodyPesquisadorMock);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id", expect.any(String));
      expect(response.body.senha).not.toBe(bodyPesquisadorMock.senha);
      expect(response.body.matricula).toBe(bodyPesquisadorMock.matricula);
      expect(response.body.email).toBe(bodyPesquisadorMock.email);
    });

    it("Deve enviar uma requisição POST para /api/pesquisador com um email que já cadastrado, retornar um body de error e com código 400", async () => {
      const repository = appDataSource.getRepository(Pesquisador);
      await repository.save(bodyPesquisadorMock);

      const response = await request(app)
        .post("/api/pesquisador")
        .send(bodyPesquisadorMock);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty(
        "message",
        "E-mail ou Matrícula já cadastrados",
      );
    });

    it("Deve enviar uma requisição POST para /api/pesquisador, retornar um erro de validação com 3 errors e com código 400", async () => {
      const response = await request(app)
        .post("/api/pesquisador")
        .send(failBodyPesquisadorMock);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("validation-error");
      expect(response.body.error).toBeInstanceOf(Array);
      expect(response.body.error).toHaveLength(3);
      expect(response.body.error[0]).toHaveProperty("field");
      expect(response.body.error[0]).toHaveProperty("message");
    });
  });

  describe("Testes de listagem de pesquisadores", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Deve enviar uma requisição GET para /api/pesquisador, retornar uma lista de pesquisadores com código 200", async () => {
      const repository = appDataSource.getRepository(Pesquisador);
      await repository.save([bodyPesquisadorMock, bodyAdminMock]);

      const response = await request(app).get("/api/pesquisador");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].nome).toBe(bodyPesquisadorMock.nome);
      expect(response.body[1].nome).toBe(bodyAdminMock.nome);
    });

    it("Deve enviar uma requisição GET para /api/pesquisador/:id com id existente, retornar um pesquisador com código 200", async () => {
      const repository = appDataSource.getRepository(Pesquisador);
      const pesquisador = await repository.save(bodyPesquisadorMock);

      const response = await request(app).get(
        `/api/pesquisador/${pesquisador.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.id).toBe(pesquisador.id);
      expect(response.body.nome).toBe(pesquisador.nome);
    });

    it("Deve enviar uma requisição GET para /api/pesquisador/:id com id que não existe, retornar um body com informações de erro e com código 404", async () => {
      const id = "478ae217-4a57-4340-a194-500c8a17835b";

      const response = await request(app).get(`/api/pesquisador/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty(
        "message",
        "Pesquisador não encontrado",
      );
    });
  });

  describe("Testes de atualização de pesquisadores", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Deve enviar uma requisição PUT para /api/pesquisador/:id com id existente, retornar um pesquisador com dados atualizado e com código 200", async () => {
      const repository = appDataSource.getRepository(Pesquisador);
      const pesquisador = await repository.save(bodyPesquisadorMock);

      const response = await request(app)
        .put(`/api/pesquisador/${pesquisador.id}`)
        .send({
          nome: "doutor",
          titulacao: "Doutorado",
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.id).toBe(pesquisador.id);
      expect(response.body.nome).not.toBe(pesquisador.nome);
      expect(response.body.titulacao).not.toBe(pesquisador.titulacao);
      expect(response.body.email).toBe(pesquisador.email);
    });

    it("Deve enviar uma requisição PUT para /api/pesquisador/:id com id que não existe, retornar um body com informações de erro e com código 404", async () => {
      const id = "478ae217-4a57-4340-a194-500c8a17835b";

      const response = await request(app).put(`/api/pesquisador/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty(
        "message",
        "Pesquisador não encontrado",
      );
    });
  });

  describe("Testes de remoção de pesquisadores", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Deve enviar uma requisição DELETE para /api/pesquisador/:id com id existente, retornar sem body e com código 204", async () => {
      const repository = appDataSource.getRepository(Pesquisador);
      const pesquisador = await repository.save(bodyPesquisadorMock);

      const response = await request(app).delete(
        `/api/pesquisador/${pesquisador.id}`,
      );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it("Deve enviar uma requisição DELETE para /api/pesquisador/:id com id que não existe, retornar um body com informações de erro e com código 404", async () => {
      const id = "478ae217-4a57-4340-a194-500c8a17835b";

      const response = await request(app).delete(`/api/pesquisador/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty(
        "message",
        "Pesquisador não encontrado",
      );
    });
  });
});
