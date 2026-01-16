import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { CryptoService } from "./crypto.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UsersModule } from "../users/users.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>("JWT_ACCESS_SECRET");
        const expiresIn = configService.get<string>("JWT_ACCESS_EXPIRATION");

        if (!secret || !expiresIn) {
          throw new Error(
            "JWT_ACCESS_SECRET and JWT_ACCESS_EXPIRATION must be configured",
          );
        }

        return {
          secret,
          signOptions: { expiresIn: expiresIn as any },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CryptoService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, CryptoService, JwtAuthGuard],
})
export class AuthModule {}
