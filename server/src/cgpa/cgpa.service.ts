import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CgpaScraperService } from "../scrapers/cgpa.scraper";
import type { CGPAResponse } from "../types";

@Injectable()
export class CgpaService {
  private readonly logger = new Logger(CgpaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cgpaScraper: CgpaScraperService,
  ) {}

  async getCgpa(
    userId: string,
    rollno: string,
    password: string,
  ): Promise<CGPAResponse> {
    // Check cache first
    const cached = await this.getCachedCgpa(userId);
    if (cached) {
      this.logger.log(`Returning cached CGPA for user ${userId}`);
      return cached;
    }

    // Scrape fresh data
    this.logger.log(`Scraping CGPA for rollno ${rollno}`);
    const cgpa = await this.cgpaScraper.scrapeCgpa(rollno, password);

    // Cache the result
    await this.cacheCgpa(userId, cgpa);

    return cgpa;
  }

  private async getCachedCgpa(userId: string): Promise<CGPAResponse | null> {
    const cached = await this.prisma.cgpaCache.findUnique({
      where: { userId },
    });

    if (!cached || cached.expiresAt < new Date()) {
      return null;
    }

    return JSON.parse(cached.data) as CGPAResponse;
  }

  private async cacheCgpa(userId: string, data: CGPAResponse): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour cache

    await this.prisma.cgpaCache.upsert({
      where: { userId },
      update: {
        data: JSON.stringify(data),
        currentCgpa: data.currentCGPA,
        cachedAt: new Date(),
        expiresAt,
      },
      create: {
        userId,
        data: JSON.stringify(data),
        currentCgpa: data.currentCGPA,
        expiresAt,
      },
    });
  }

  async invalidateCache(userId: string): Promise<void> {
    await this.prisma.cgpaCache.deleteMany({
      where: { userId },
    });
  }
}
