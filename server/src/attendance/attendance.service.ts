import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AttendanceScraperService } from "../scrapers/attendance.scraper";
import type { AttendanceResponse } from "@nimora/types";

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceScraper: AttendanceScraperService,
  ) {}

  /**
   * Get attendance data for a user
   * Tries cache first, then scrapes if needed
   */
  async getAttendance(
    userId: string,
    rollno: string,
    password: string,
    threshold: number = 75,
  ): Promise<AttendanceResponse> {
    // Check cache first
    const cached = await this.getCachedAttendance(userId);
    if (cached) {
      this.logger.log(`Returning cached attendance for user ${userId}`);
      return cached;
    }

    // Scrape fresh data
    this.logger.log(`Scraping attendance for rollno ${rollno}`);
    const attendance = await this.attendanceScraper.scrapeAttendance(
      rollno,
      password,
      threshold,
    );

    // Cache the result
    await this.cacheAttendance(userId, attendance);

    return attendance;
  }

  /**
   * Get cached attendance data
   */
  private async getCachedAttendance(
    userId: string,
  ): Promise<AttendanceResponse | null> {
    const cached = await this.prisma.attendanceCache.findUnique({
      where: { userId },
    });

    if (!cached || cached.expiresAt < new Date()) {
      return null;
    }

    return JSON.parse(cached.data) as AttendanceResponse;
  }

  /**
   * Cache attendance data
   */
  private async cacheAttendance(
    userId: string,
    data: AttendanceResponse,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes cache

    await this.prisma.attendanceCache.upsert({
      where: { userId },
      update: {
        data: JSON.stringify(data),
        overallPercent: data.overallPercentage,
        cachedAt: new Date(),
        expiresAt,
      },
      create: {
        userId,
        data: JSON.stringify(data),
        overallPercent: data.overallPercentage,
        expiresAt,
      },
    });
  }

  /**
   * Invalidate cache for a user
   */
  async invalidateCache(userId: string): Promise<void> {
    await this.prisma.attendanceCache.deleteMany({
      where: { userId },
    });
  }
}
