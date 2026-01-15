import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Root endpoint" })
  @ApiResponse({ status: 200, description: "Returns welcome message" })
  getRoot() {
    return this.appService.getRoot();
  }

  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Returns health status" })
  getHealth() {
    return this.appService.getHealth();
  }
}
