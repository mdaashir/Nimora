import { Module } from "@nestjs/common";
import { TimetableService } from "./timetable.service";
import { TimetableController } from "./timetable.controller";
import { ScrapersModule } from "../scrapers/scrapers.module";

@Module({
  imports: [ScrapersModule],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}
