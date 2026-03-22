import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app";

describe("Testes para validar saúde da aplicação", () => {
  it("Teste de Health Check da aplicação, deve retornar código 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
  });

  it("Teste de tratamento por meio de middleware para erros inesperados, deve retornar 500", async () => {
    const response = await request(app).post("/api/test-error");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Error interno");
    expect(response.body).toHaveProperty(
      "message",
      "Ocorreu um erro interno em nossa aplicação",
    );
  });
});
