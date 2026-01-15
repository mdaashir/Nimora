import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { name, emails, photos } = profile;
      const email = emails?.[0]?.value;

      if (!email) {
        return done(new Error('No email found in Google profile'), null);
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
              ? `${name.givenName} ${name.familyName || ''}`.trim()
              : email.split('@')[0],
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
    } catch (error) {
      this.logger.error(`Google authentication error: ${error.message}`);
      done(error, null);
    }
  }
}
