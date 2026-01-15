import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Google OAuth Strategy
 * BYPASS MODE: When GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set,
 * Google OAuth will be disabled. Remove the bypass by setting these env vars.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly logger = new Logger(GoogleStrategy.name);
  private readonly isEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const clientID =
      configService.get<string>("GOOGLE_CLIENT_ID") || "bypass-not-configured";
    const clientSecret =
      configService.get<string>("GOOGLE_CLIENT_SECRET") ||
      "bypass-not-configured";

    super({
      clientID,
      clientSecret,
      callbackURL:
        configService.get<string>("GOOGLE_CALLBACK_URL") ||
        "http://localhost:3001/api/auth/google/callback",
      scope: ["email", "profile"],
    });

    // Check if Google OAuth is properly configured
    this.isEnabled =
      clientID !== "bypass-not-configured" &&
      clientSecret !== "bypass-not-configured";

    if (!this.isEnabled) {
      this.logger.warn(
        "⚠️ Google OAuth is BYPASSED - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured",
      );
    } else {
      this.logger.log("✅ Google OAuth is enabled");
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { name, emails, photos } = profile;
      const email = emails?.[0]?.value;

      if (!email) {
        return done(new Error("No email found in Google profile"), undefined);
      }

      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Create new user from Google profile
        user = await this.prisma.user.create({
          data: {
            email,
            name: name?.givenName
              ? `${name.givenName} ${name.familyName || ""}`.trim()
              : email.split("@")[0],
            avatarUrl: photos?.[0]?.value || null,
            googleId: profile.id,
          },
        });
        this.logger.log(`New user created from Google: ${email}`);
      } else if (!user.googleId) {
        // Link existing user with Google account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.id,
            avatarUrl: user.avatarUrl || photos?.[0]?.value || null,
          },
        });
        this.logger.log(`Linked Google account for user: ${email}`);
      }

      done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
    } catch (error: any) {
      this.logger.error(`Google authentication error: ${error.message}`);
      done(error, undefined);
    }
  }
}
