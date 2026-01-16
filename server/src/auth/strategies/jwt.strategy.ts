import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>("JWT_ACCESS_SECRET");
    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET not configured");
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from cookie first
        JwtStrategy.extractJwtFromCookie,
        // Fallback to Bearer token in header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Extract JWT from cookie
   */
  private static extractJwtFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.access_token) {
      return req.cookies.access_token;
    }
    return null;
  }

  /**
   * Validate JWT payload and return user
   */
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    return user;
  }
}
