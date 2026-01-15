import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { CryptoService } from "./crypto.service";
import { LoginDto } from "./dto/login.dto";
import { AuthTokensResponseDto } from "./dto/auth-tokens-response.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Login with email/password or eCampus credentials
   */
  async login(loginDto: LoginDto): Promise<AuthTokensResponseDto> {
    const { email, rollno } = loginDto;

    // Find user by email or rollno
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: email || "" },
          // Check if rollno matches encrypted value (would need decryption in real scenario)
        ],
      },
    });

    if (!user && email) {
      // Create new user if doesn't exist (for eCampus login flow)
      user = await this.prisma.user.create({
        data: {
          email,
          name: rollno || email.split("@")[0],
        },
      });
    }

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokensResponseDto> {
    // Find session with refresh token
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Delete old session
    await this.prisma.session.delete({
      where: { id: session.id },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  /**
   * Validate JWT payload
   */
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };

    // Generate access token
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token with different secret/expiration
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: "7d",
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Login with Google OAuth - creates tokens for authenticated user
   */
  async loginWithGoogle(googleUser: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
  }): Promise<AuthTokensResponseDto> {
    // User should already exist from GoogleStrategy validation
    const user = await this.prisma.user.findUnique({
      where: { id: googleUser.id },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in via Google: ${user.email}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Encrypt eCampus credentials for storage
   */
  encryptCredentials(
    rollno: string,
    password: string,
  ): { encryptedRollno: string; encryptedPassword: string } {
    return {
      encryptedRollno: this.cryptoService.encrypt(rollno),
      encryptedPassword: this.cryptoService.encrypt(password),
    };
  }

  /**
   * Decrypt eCampus credentials for scraping
   */
  decryptCredentials(
    encryptedRollno: string,
    encryptedPassword: string,
  ): { rollno: string; password: string } {
    return {
      rollno: this.cryptoService.decrypt(encryptedRollno),
      password: this.cryptoService.decrypt(encryptedPassword),
    };
  }
}
