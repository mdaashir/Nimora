import { Module } from '@nestjs/common';
import { AttendanceScraperService } from './attendance.scraper';
import { CgpaScraperService } from './cgpa.scraper';
import { TimetableScraperService } from './timetable.scraper';
import { InternalsScraperService } from './internals.scraper';
import { EcampusAuthService } from './ecampus-auth.service';

@Module({
  providers: [
    EcampusAuthService,
    AttendanceScraperService,
    CgpaScraperService,
    TimetableScraperService,
    InternalsScraperService,
  ],
  exports: [
    EcampusAuthService,
    AttendanceScraperService,
    CgpaScraperService,
    TimetableScraperService,
    InternalsScraperService,
  ],
})
export class ScrapersModule {}
