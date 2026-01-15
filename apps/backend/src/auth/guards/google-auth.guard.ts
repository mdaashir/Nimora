import {
  Injectable,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  constructor(private readonly configService?: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if Google OAuth is configured (bypass mode check)
    const clientId = this.configService?.get<string>("GOOGLE_CLIENT_ID");
    const clientSecret = this.configService?.get<string>(
      "GOOGLE_CLIENT_SECRET",
    );

    if (!clientId || !clientSecret || clientId === "bypass-not-configured") {
      throw new BadRequestException(
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
      );
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any) {
    if (err || !user) {
      throw err || new Error("Google authentication failed");
    }
    return user;
  }
}
