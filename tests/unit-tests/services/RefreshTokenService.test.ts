import { beforeEach, describe, expect, it, vi } from "vitest";

vi.resetModules();

const mockRefreshTokenRepository = {
  findOne: vi.fn(),
  update: vi.fn(),
  save: vi.fn(),
};

const mockJwt = vi.hoisted(() => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

const mockBcrypt = vi.hoisted(() => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

vi.mock("../../../src/database/appDataSource.js", () => {
  return {
    appDataSource: {
      getRepository: () => {
        return mockRefreshTokenRepository;
      },
    },
  };
});

vi.mock("jsonwebtoken", () => {
  return {
    default: mockJwt,
  };
});

vi.mock("bcryptjs", () => {
  return {
    default: mockBcrypt,
  };
});

import RefreshTokenService from "../../../src/services/RefreshTokenService";
import { jwtConfig } from "../../../src/config/jwt.config";
import { AppError } from "../../../src/errors/AppError";

describe("RefreshTokenService testes", () => {
  const service = new RefreshTokenService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("A função refresh() deve gerar novos tokens com sucesso", async () => {
    // Arrange
    mockJwt.verify.mockReturnValue({ jti: "123" });
    const tokenDb = {
      id: "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589",
      expireIn: new Date(Date.now() + 10000),
      tokenhash: "token-hash",
      sessionId: "session-id",
      pesquisador: {
        id: "9a55c47a-93a1-406c-9a50-6f3c583b7177",
        email: "pesquisador@email.com",
      },
    };
    mockRefreshTokenRepository.findOne.mockResolvedValue(tokenDb);
    mockBcrypt.compare.mockResolvedValue(true);
    mockRefreshTokenRepository.update.mockResolvedValue(undefined);
    mockRefreshTokenRepository.save.mockResolvedValue({ jti: "novo-jti" });

    mockJwt.sign
      .mockReturnValueOnce("novo-access-token")
      .mockReturnValueOnce("novo-refresh-token");

    // Act
    const tokens = await service.refresh(
      "atual-refresh-token",
      "Browser",
      "187.0.0.0",
    );

    // Assert
    expect(tokens.tokenAccess).toBe("novo-access-token");
    expect(tokens.tokenRefresh).toBe("novo-refresh-token");
    expect(mockJwt.verify).toHaveBeenCalledWith(
      "atual-refresh-token",
      jwtConfig.refresh.secret,
    );
    expect(mockRefreshTokenRepository.findOne).toHaveBeenNthCalledWith(1, {
      where: {
        jti: "123",
        revoked: false,
        userAgent: "Browser",
        ipAddress: "187.0.0.0",
      },
      relations: ["pesquisador"],
    });
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      "atual-refresh-token",
      tokenDb.tokenhash,
    );
    expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
      { id: tokenDb.id },
      { revoked: true },
    );
    expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith({
      jti: expect.any(String),
      sessionId: tokenDb.sessionId,
      userAgent: "Browser",
      ipAddress: "187.0.0.0",
      pesquisador: tokenDb.pesquisador,
    });
    expect(mockJwt.sign).toHaveBeenNthCalledWith(
      1,
      {
        sub: tokenDb.pesquisador.id,
        email: tokenDb.pesquisador.email,
        type: "access",
      },
      jwtConfig.access.secret,
      {
        expiresIn: jwtConfig.access.expiresIn!,
      },
    );
    expect(mockJwt.sign).toHaveBeenNthCalledWith(
      2,
      {
        sub: tokenDb.pesquisador.id,
        jti: "novo-jti",
        type: "refresh",
      },
      jwtConfig.refresh.secret,
      {
        expiresIn: jwtConfig.refresh.expiresIn!,
      },
    );
  });

  it("A função refresh() deve lançar um erro ao receber um token expirado", async () => {
    // Arrange
    mockJwt.verify.mockReturnValue({ jti: "123" });
    const tokenDb = {
      id: "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589",
      expireIn: new Date(Date.now() - 10000),
      tokenhash: "token-hash",
      sessionId: "session-id",
      pesquisador: {
        id: "9a55c47a-93a1-406c-9a50-6f3c583b7177",
        email: "pesquisador@email.com",
      },
    };
    mockRefreshTokenRepository.findOne.mockResolvedValue(tokenDb);

    // Act & Assert
    try {
      await service.refresh("atual-refresh-token", "Browser", "187.0.0.0");
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Token inválido!");
      expect(error.statusCode).toBe(401);
      expect(mockJwt.verify).toHaveBeenCalledWith(
        "atual-refresh-token",
        jwtConfig.refresh.secret,
      );
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledOnce();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.save).not.toHaveBeenCalled();
      expect(mockJwt.sign).not.toHaveBeenCalled();
    }
  });

  it("A função refresh() deve lançar um erro ao receber um refreshToken inválido", async () => {
    // Arrange
    mockJwt.verify.mockReturnValue({ jti: "123" });
    const tokenDb = {
      id: "a6ec24dc-eb2b-4f9a-b98c-1e4d074e2589",
      expireIn: new Date(Date.now() + 10000),
      tokenhash: "token-hash",
      sessionId: "session-id",
      pesquisador: {
        id: "9a55c47a-93a1-406c-9a50-6f3c583b7177",
        email: "pesquisador@email.com",
      },
    };
    mockRefreshTokenRepository.findOne.mockResolvedValue(tokenDb);
    mockBcrypt.compare.mockResolvedValue(false);

    // Act & Assert
    try {
      await service.refresh("inválido-refresh-token", "Browser", "187.0.0.0");
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Token inválido!");
      expect(error.statusCode).toBe(401);
      expect(mockJwt.verify).toHaveBeenCalledWith(
        "inválido-refresh-token",
        jwtConfig.refresh.secret,
      );
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledOnce();
      expect(mockJwt.verify).toHaveBeenCalledWith(
        "inválido-refresh-token",
        jwtConfig.refresh.secret,
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        "inválido-refresh-token",
        tokenDb.tokenhash,
      );
      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.save).not.toHaveBeenCalled();
      expect(mockJwt.sign).not.toHaveBeenCalled();
    }
  });
});
