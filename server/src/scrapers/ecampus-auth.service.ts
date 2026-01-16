import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import puppeteer, { Browser, Page } from "puppeteer";

@Injectable()
export class EcampusAuthService {
  private readonly logger = new Logger(EcampusAuthService.name);
  private readonly timeout: number;
  private readonly baseUrl: string;
  private readonly ecampusUrls: {
    STUDZONE: string;
    STUDZONE2: string;
  };

  constructor(private configService: ConfigService) {
    this.timeout = parseInt(this.configService.get("SCRAPER_TIMEOUT"), 10);
    this.baseUrl = this.configService.get("ECAMPUS_BASE_URL");
    this.ecampusUrls = {
      STUDZONE: `${this.baseUrl}/studzone`,
      STUDZONE2: `${this.baseUrl}/studzone2/`,
    };
  }

  /**
   * Create a new browser instance
   */
  async createBrowser(): Promise<Browser> {
    return puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
    });
  }

  /**
   * Login to eCampus studzone and return authenticated page
   */
  async loginStudzone(
    rollno: string,
    password: string,
  ): Promise<{ browser: Browser; page: Page }> {
    const browser = await this.createBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      // Navigate to login page
      await page.goto(this.ecampusUrls.STUDZONE, {
        waitUntil: "networkidle2",
        timeout: this.timeout,
      });

      // Wait for login form
      await page.waitForSelector('input[name="rollno"]', { timeout: 10000 });

      // Fill credentials
      await page.type('input[name="rollno"]', rollno);
      await page.type('input[name="pass"]', password);

      // Submit form
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2" }),
        page.click('input[type="submit"]'),
      ]);

      // Check for login error
      const pageContent = await page.content();
      if (
        pageContent.includes("Invalid") ||
        pageContent.includes("incorrect") ||
        pageContent.includes("error")
      ) {
        await browser.close();
        throw new UnauthorizedException("Invalid eCampus credentials");
      }

      this.logger.log(`Successfully logged into studzone for ${rollno}`);
      return { browser, page };
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * Login to eCampus studzone2 (for CGPA) and return authenticated page
   */
  async loginStudzone2(
    rollno: string,
    password: string,
  ): Promise<{ browser: Browser; page: Page }> {
    const browser = await this.createBrowser();
    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      await page.goto(this.ecampusUrls.STUDZONE2, {
        waitUntil: "networkidle2",
        timeout: this.timeout,
      });

      // Wait for and fill login form
      await page.waitForSelector('input[name="regno"]', { timeout: 10000 });
      await page.type('input[name="regno"]', rollno);
      await page.type('input[name="passwd"]', password);

      // Submit
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2" }),
        page.click('input[type="submit"]'),
      ]);

      const pageContent = await page.content();
      if (
        pageContent.includes("Invalid") ||
        pageContent.includes("incorrect")
      ) {
        await browser.close();
        throw new UnauthorizedException("Invalid eCampus credentials");
      }

      this.logger.log(`Successfully logged into studzone2 for ${rollno}`);
      return { browser, page };
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * Safely close browser
   */
  async closeBrowser(browser: Browser): Promise<void> {
    try {
      await browser.close();
    } catch (error) {
      this.logger.warn("Error closing browser:", error);
    }
  }
}
