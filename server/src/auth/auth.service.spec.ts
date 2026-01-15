import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { CryptoService } from "./crypto.service";

describe("AuthService", () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let cryptoService: CryptoService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock-token"),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config: Record<string, string> = {
        JWT_REFRESH_SECRET: "test-refresh-secret",
        JWT_REFRESH_EXPIRATION: "7d",
        ENCRYPTION_KEY: "test-encryption-key-32-characters!!",
      };
      return config[key];
    }),
  };

  const mockUsersService = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockCryptoService = {
    encrypt: jest.fn().mockReturnValue("encrypted-value"),
    decrypt: jest.fn().mockReturnValue("decrypted-value"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    cryptoService = module.get<CryptoService>(CryptoService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    const mockUser = {
      id: "user-id",
      email: "test@example.com",
      name: "Test User",
      avatarUrl: null,
    };

    it("should login successfully with existing user", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.session.create.mockResolvedValue({ id: "session-id" });

      const result = await service.login({
        email: "test@example.com",
        password: "password",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should create a new user if not found", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.session.create.mockResolvedValue({ id: "session-id" });

      const result = await service.login({
        email: "newuser@example.com",
        password: "password",
      });

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken");
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(null);

      await expect(
        service.login({ email: "", password: "password" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refreshTokens", () => {
    const mockUser = {
      id: "user-id",
      email: "test@example.com",
      name: "Test User",
      avatarUrl: null,
    };

    const mockSession = {
      id: "session-id",
      userId: "user-id",
      refreshToken: "valid-refresh-token",
      expiresAt: new Date(Date.now() + 86400000), // 1 day from now
    };

    it("should refresh tokens successfully", async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.session.delete.mockResolvedValue(mockSession);
      mockPrismaService.session.create.mockResolvedValue({
        id: "new-session-id",
      });

      const result = await service.refreshTokens("valid-refresh-token");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(mockPrismaService.session.delete).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException for expired refresh token", async () => {
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() - 86400000), // 1 day ago
      });

      await expect(
        service.refreshTokens("expired-refresh-token"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshTokens("invalid-refresh-token"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should delete session on logout", async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout("refresh-token");

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken: "refresh-token" },
      });
    });
  });

  describe("validateUser", () => {
    const mockUser = {
      id: "user-id",
      email: "test@example.com",
      name: "Test User",
    };

    it("should return user for valid payload", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser({
        sub: "user-id",
        email: "test@example.com",
      });

      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedException for invalid user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser({ sub: "invalid-id", email: "test@example.com" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("encryptCredentials", () => {
    it("should encrypt credentials", () => {
      const result = service.encryptCredentials("22Z209", "password123");

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith("22Z209");
      expect(mockCryptoService.encrypt).toHaveBeenCalledWith("password123");
      expect(result).toHaveProperty("encryptedRollno");
      expect(result).toHaveProperty("encryptedPassword");
    });
  });

  describe("decryptCredentials", () => {
    it("should decrypt credentials", () => {
      const result = service.decryptCredentials(
        "encrypted-rollno",
        "encrypted-password",
      );

      expect(mockCryptoService.decrypt).toHaveBeenCalledWith(
        "encrypted-rollno",
      );
      expect(mockCryptoService.decrypt).toHaveBeenCalledWith(
        "encrypted-password",
      );
      expect(result).toHaveProperty("rollno");
      expect(result).toHaveProperty("password");
    });
  });
});
