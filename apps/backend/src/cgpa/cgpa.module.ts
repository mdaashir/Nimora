import { Module } from '@nestjs/common';
import { CgpaService } from './cgpa.service';
import { CgpaController } from './cgpa.controller';
import { ScrapersModule } from '../scrapers/scrapers.module';

@Module({
  imports: [ScrapersModule],
  controllers: [CgpaController],
  providers: [CgpaService],
  exports: [CgpaService],
})
export class CgpaModule {}
