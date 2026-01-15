import { Module } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";
import { ScrapersModule } from "../scrapers/scrapers.module";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [ScrapersModule, AuthModule, PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
