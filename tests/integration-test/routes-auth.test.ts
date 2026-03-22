import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { testDataSource } from "../../src/database/testDataSource";
import { appDataSource } from "../../src/database/appDataSource";
import { clearDatabase } from "../helpers/database";
import {
  bodyAdminMock,
  bodyLoginAdminMock,
  failEmailBodyLoginMock,
  failSenhaBodyLoginMock,
} from "../mocks/mocks";
import app from "../../src/app";
import PesquisadorService from "../../src/services/PesquisadorService";
import AuthService from "../../src/services/AuthService";
import RefreshToken from "../../src/entities/RefreshToken";

describe("Testes de integração para contexto total das rotas de autorização", () => {
  beforeAll(async () => {
    await testDataSource.initialize();
    Object.assign(appDataSource, testDataSource);
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe("Testes ao realizar login na aplicação.", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Deve enviar uma requisição POST para /api/login com e-mail e senha válida, retornar um objeto com tokens com código 200", async () => {
      const service = new PesquisadorService();
      await service.create({ id: "id", ...bodyAdminMock });

      const response = await request(app)
        .post("/api/login")
        .send(bodyLoginAdminMock);

      expect(response.status).toBe(200);
      expect(response.body.tokens).toHaveProperty("tokenAccess");
      expect(response.body.tokens).toHaveProperty("tokenRefresh");
    });

    it("Deve enviar uma requisição POST para /api/login com e-mail inválido, retornar um objeto de error com código 401", async () => {
      const service = new PesquisadorService();
      await service.create({ id: "id", ...bodyAdminMock });

      const response = await request(app)
        .post("/api/login")
        .send(failEmailBodyLoginMock);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty("message", "Credênciais Inválidas");
    });

    it("Deve enviar uma requisição POST para /api/login com senha inválida, retornar um objeto de error com código 401", async () => {
      const service = new PesquisadorService();
      await service.create({ id: "id", ...bodyAdminMock });

      const response = await request(app)
        .post("/api/login")
        .send(failSenhaBodyLoginMock);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty("message", "Credênciais Inválidas");
    });
  });

  describe("Testes para atualizar o acesso na aplicação.", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Deve enviar uma requisição POST para /api/refresh , retornar um objeto com tokens com código 200", async () => {
      const pesquisadorService = new PesquisadorService();
      await pesquisadorService.create({ id: "id", ...bodyAdminMock });

      const authService = new AuthService();
      const userAgent = "unknown";

      const { tokenRefresh } = await authService.login(
        bodyAdminMock.email,
        bodyAdminMock.senha,
        userAgent,
        "::ffff:127.0.0.1",
      );

      const response = await request(app)
        .post("/api/refresh")
        .send({ refreshToken: tokenRefresh });

      expect(response.status).toBe(200);
      expect(response.body.tokens).toHaveProperty("tokenAccess");
      expect(response.body.tokens).toHaveProperty("tokenRefresh");
    });

    it("Deve enviar uma requisição POST para /api/refresh com um token que não está no banco, retornar um objeto com error com código 401", async () => {
      const pesquisadorService = new PesquisadorService();
      await pesquisadorService.create({ id: "id", ...bodyAdminMock });

      const authService = new AuthService();
      const userAgent = "unknown";

      const { tokenRefresh } = await authService.login(
        bodyAdminMock.email,
        bodyAdminMock.senha,
        userAgent,
        "ip-para-falhar",
      );

      const response = await request(app)
        .post("/api/refresh")
        .send({ refreshToken: tokenRefresh });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty("message", "Token inválido!");
    });

    it("Deve enviar uma requisição POST para /api/refresh com um token que está no banco com tempo inspirado, retornar um objeto com error com código 401", async () => {
      const pesquisadorService = new PesquisadorService();
      const { id } = await pesquisadorService.create({
        id: "id",
        ...bodyAdminMock,
      });

      const userAgent = "unknown";
      const ipAddress = "::ffff:127.0.0.1";

      const authService = new AuthService();
      const { tokenRefresh } = await authService.login(
        bodyAdminMock.email,
        bodyAdminMock.senha,
        userAgent,
        ipAddress,
      );

      const refreshTokenRepository = appDataSource.getRepository(RefreshToken);
      refreshTokenRepository.update(
        { userAgent, ipAddress, pesquisador: { id } },
        { expireIn: new Date(Date.now() - 10000) },
      );

      const response = await request(app)
        .post("/api/refresh")
        .send({ refreshToken: tokenRefresh });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty("message", "Token inválido!");
    });
  });

  describe("Testes ao realizar logout na aplicação.", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("Deve fazer login com sucesso, e logo em seguida usar o refresh token para fazer logout com sucesso.", async () => {
      const service = new PesquisadorService();
      await service.create({ id: "id", ...bodyAdminMock });

      const responseLogin = await request(app)
        .post("/api/login")
        .send(bodyLoginAdminMock);

      const responseLogout = await request(app)
        .post("/api/logout")
        .send({ refreshToken: responseLogin.body.tokens.tokenRefresh });

      expect(responseLogout.status).toBe(200);
      expect(responseLogout.body).toHaveProperty("message", "Success");
    });

    it("Deve fazer login com sucesso, e logo em seguida deslogar de todos os acessos com sucesso.", async () => {
      const service = new PesquisadorService();
      const { id } = await service.create({ id: "id", ...bodyAdminMock });

      const responseLogin = await request(app)
        .post("/api/login")
        .send(bodyLoginAdminMock);

      const responseLogout = await request(app)
        .post("/api/logout/all")
        .send({ userId: id });

      expect(responseLogout.status).toBe(200);
      expect(responseLogout.body).toHaveProperty("message", "Success");
    });

    it("Deve tentar relizar logout com um refresh token inválido, retornar um objeto de error com código 400", async () => {
      const response = await request(app)
        .post("/api/logout")
        .send({ refreshToken: "refresh-token-invalido" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Error -- MID ERROR");
      expect(response.body).toHaveProperty(
        "message",
        "Token inválido para logout",
      );
    });
  });
});
