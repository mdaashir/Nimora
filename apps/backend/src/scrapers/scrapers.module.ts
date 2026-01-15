import { Module } from '@nestjs/common';
import { AttendanceScraperService } from './attendance.scraper';
import { CgpaScraperService } from './cgpa.scraper';
import { EcampusAuthService } from './ecampus-auth.service';

@Module({
  providers: [
    EcampusAuthService,
    AttendanceScraperService,
    CgpaScraperService,
  ],
  exports: [
    EcampusAuthService,
    AttendanceScraperService,
    CgpaScraperService,
  ],
})
export class ScrapersModule {}
