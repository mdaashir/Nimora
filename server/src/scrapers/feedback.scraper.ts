import { Injectable, Logger } from "@nestjs/common";
import * as puppeteer from "puppeteer";
import { ConfigService } from "@nestjs/config";

export interface FeedbackResult {
  status: "success" | "error";
  message: string;
  error?: string;
}

@Injectable()
export class FeedbackScraper {
  private readonly logger = new Logger(FeedbackScraper.name);
  private readonly feedbackDisabled: boolean;
  private readonly timeout: number;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.feedbackDisabled =
      this.configService.get("DISABLE_FEEDBACK") === "true";
    this.timeout = parseInt(this.configService.get("SCRAPER_TIMEOUT"), 10);
    this.baseUrl = this.configService.get("ECAMPUS_BASE_URL");
  }

  /**
   * Launch a Puppeteer browser instance
   */
  private async launchBrowser(): Promise<puppeteer.Browser> {
    if (this.feedbackDisabled) {
      throw new Error(
        "Feedback automation is currently disabled. Please try again later or contact support.",
      );
    }

    try {
      return await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--window-size=1920,1080",
        ],
      });
    } catch (error) {
      this.logger.error("Failed to launch browser", error);
      throw new Error(
        "ChromeDriver setup failed. This feature requires a compatible server environment with Chrome support.",
      );
    }
  }

  /**
   * Process intermediate feedback form
   */
  private async processIntermediateFeedback(
    page: puppeteer.Page,
  ): Promise<FeedbackResult> {
    try {
      // Wait for courses to load
      await page.waitForSelector(".intermediate-body", { timeout: 10000 });
      const courses = await page.$$(".intermediate-body");

      if (courses.length === 0) {
        return {
          status: "error",
          message: "No intermediate feedback forms found",
        };
      }

      // Iterate through the courses
      for (let i = 0; i < courses.length; i++) {
        // Re-query courses to avoid stale elements
        const currentCourses = await page.$$(".intermediate-body");
        await currentCourses[i].scrollIntoView();
        await currentCourses[i].click();

        // Get the number of questions
        const questionsText = await page.$eval(
          "div.bottom-0",
          (el) => el.textContent,
        );
        const questions = parseInt(questionsText?.split(" ").pop() || "0");

        // Fill out the feedback
        for (let q = 0; q < questions; q++) {
          try {
            // Click the first radio button for each question
            const radioSelector = `label[for='radio-${q + 1}-1']`;
            await page.waitForSelector(radioSelector, { timeout: 5000 });
            await page.click(radioSelector);

            // Click next button
            await page.click(".carousel-control-next");
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            this.logger.warn(`Error on question ${q + 1}:`, error);
            continue;
          }
        }

        // Go back to course list
        await page.click(".overlay");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return {
        status: "success",
        message: "Intermediate feedback completed",
      };
    } catch (error) {
      this.logger.error("Error in intermediate feedback:", error);
      return {
        status: "error",
        message: "Error processing intermediate feedback",
        error: error.message,
      };
    }
  }

  /**
   * Process end-semester feedback form
   */
  private async processEndsemFeedback(
    page: puppeteer.Page,
  ): Promise<FeedbackResult> {
    try {
      // Wait for staff list to load
      await page.waitForSelector("div.staff-item", { timeout: 10000 });
      const staffList = await page.$$("div.staff-item");

      if (staffList.length === 0) {
        return {
          status: "error",
          message: "No end-semester feedback forms found",
        };
      }

      // Iterate through each staff member
      for (let i = 0; i < staffList.length; i++) {
        // Re-query to avoid stale elements
        const currentStaffList = await page.$$("div.staff-item");
        await currentStaffList[i].scrollIntoView();
        await currentStaffList[i].click();

        // Wait for feedback form to load
        await page.waitForSelector("span.ms-1", { timeout: 5000 });
        await page.waitForSelector(
          "//tbody[@id='feedbackTableBody']/tr[1]/td[@class='rating-cell']/div[@class='star-rating']/label[1]",
          { timeout: 5000 },
        );

        // Get all review questions
        const reviewList = await page.$$("td.question-cell");

        // Fill out ratings (randomly choose 1 or 2 stars for variety)
        for (let q = 1; q <= reviewList.length; q++) {
          const randomRating = Math.floor(Math.random() * 2) + 1; // 1 or 2
          const starSelector = `//tbody[@id='feedbackTableBody']/tr[${q}]/td[@class='rating-cell']/div[@class='star-rating']/label[${randomRating}]`;

          await page.waitForSelector(starSelector, { timeout: 5000 });
          await page.click(starSelector);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        // Submit this staff's feedback
        await page.click("#btnSave");
        await page.waitForSelector("img.img-fluid", { timeout: 5000 });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Final submit button
      await page.click("#btnFinalSubmit");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        status: "success",
        message: "End semester feedback completed",
      };
    } catch (error) {
      this.logger.error("Error in end-semester feedback:", error);
      return {
        status: "error",
        message: "Error processing end-semester feedback",
        error: error.message,
      };
    }
  }

  /**
   * Automate feedback submission
   * @param index - Feedback type index (0 for end-sem, others for intermediate)
   * @param rollNo - Student roll number
   * @param password - Student password
   */
  async autoFeedback(
    index: number,
    rollNo: string,
    password: string,
  ): Promise<FeedbackResult> {
    if (this.feedbackDisabled) {
      this.logger.warn("Feedback automation is disabled");
      throw new Error(
        "Feedback automation is currently disabled. Please try again later or contact support.",
      );
    }

    let browser: puppeteer.Browser | null = null;

    try {
      browser = await this.launchBrowser();
      const page = await browser.newPage();

      // Set user agent
      await page.setUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      );

      // Navigate to eCampus login
      await page.goto(`${this.baseUrl}/studzone`, {
        waitUntil: "networkidle2",
        timeout: this.timeout,
      });

      // Fill login credentials
      await page.type("#rollno", rollNo);
      await page.type("#password", password);
      await page.click("#terms");
      await page.click("#btnLogin");

      // Wait for navigation after login
      await page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: this.timeout,
      });

      // Navigate to feedback section
      await page.waitForSelector("h5:has-text('Feedback')", { timeout: 10000 });
      await page.click("h5:has-text('Feedback')");

      // Wait for feedback cards to load
      await page.waitForSelector(".card-body", { timeout: 10000 });
      const feedbacks = await page.$$(".card-body");

      if (index >= feedbacks.length) {
        return {
          status: "error",
          message: `Invalid feedback index. Only ${feedbacks.length} feedback forms available.`,
        };
      }

      // Click the desired feedback
      await feedbacks[index].click();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Process the appropriate feedback form
      let result: FeedbackResult;
      if (index === 0) {
        result = await this.processEndsemFeedback(page);
      } else {
        result = await this.processIntermediateFeedback(page);
      }

      return result;
    } catch (error) {
      this.logger.error("Error in feedback automation:", error);
      return {
        status: "error",
        message: "Error in feedback automation",
        error: error.message,
      };
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          this.logger.warn("Error closing browser:", error);
        }
      }
    }
  }
}
