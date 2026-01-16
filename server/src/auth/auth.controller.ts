import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { Response, Request } from "express";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthTokensResponseDto } from "./dto/auth-tokens-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with credentials" })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: AuthTokensResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthTokensResponseDto> {
    const tokens = await this.authService.login(loginDto);

    // Set cookies
    response.cookie("access_token", tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: this.parseExpiration(
        this.configService.get("JWT_ACCESS_EXPIRATION"),
      ),
    });

    response.cookie("refresh_token", tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: this.parseExpiration(
        this.configService.get("JWT_REFRESH_EXPIRATION"),
      ),
    });

    return tokens;
  }

  @Post("refresh")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({
    status: 200,
    description: "Tokens refreshed",
    type: AuthTokensResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthTokensResponseDto> {
    // Get refresh token from body or cookie
    const refreshToken =
      refreshTokenDto.refreshToken || request.cookies?.refresh_token;

    const tokens = await this.authService.refreshTokens(refreshToken);

    // Set new cookies
    response.cookie("access_token", tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: this.parseExpiration(
        this.configService.get("JWT_ACCESS_EXPIRATION"),
      ),
    });

    response.cookie("refresh_token", tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: this.parseExpiration(
        this.configService.get("JWT_REFRESH_EXPIRATION"),
      ),
    });

    return tokens;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout and invalidate tokens" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookies
    response.clearCookie("access_token", COOKIE_OPTIONS);
    response.clearCookie("refresh_token", COOKIE_OPTIONS);

    return { success: true, message: "Logged out successfully" };
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }

  /**
   * Parse JWT expiration string (e.g., "15m", "7d") to milliseconds
   */
  private parseExpiration(exp: string): number {
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiration format: ${exp}`);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[unit] || multipliers["m"]);
  }
}
