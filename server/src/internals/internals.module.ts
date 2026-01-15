import { Module } from "@nestjs/common";
import { InternalsService } from "./internals.service";
import { InternalsController } from "./internals.controller";
import { ScrapersModule } from "../scrapers/scrapers.module";

@Module({
  imports: [ScrapersModule],
  controllers: [InternalsController],
  providers: [InternalsService],
  exports: [InternalsService],
})
export class InternalsModule {}
