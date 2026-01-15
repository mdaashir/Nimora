import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { CgpaModule } from "./cgpa/cgpa.module";
import { TimetableModule } from "./timetable/timetable.module";
import { InternalsModule } from "./internals/internals.module";
import { FeedbackModule } from "./feedback/feedback.module";
import { ScrapersModule } from "./scrapers/scrapers.module";
import { CacheModule } from "./cache/cache.module";
import { HealthModule } from "./health/health.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Core modules
    PrismaModule,
    CacheModule,
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AttendanceModule,
    CgpaModule,
    TimetableModule,
    InternalsModule,
    FeedbackModule,
    ScrapersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
