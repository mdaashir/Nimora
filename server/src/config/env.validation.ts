import { plainToClass } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsUrl,
  IsEnum,
  MinLength,
  Min,
  Max,
  validateSync,
} from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class EnvironmentVariables {
  // Application
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number;

  // Database
  @IsString()
  @MinLength(10)
  DATABASE_URL: string;

  // JWT
  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRATION: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRATION: string;

  // Encryption
  @IsString()
  @MinLength(32)
  ENCRYPTION_KEY: string;

  @IsString()
  @MinLength(8)
  ENCRYPTION_SALT: string;

  // Bcrypt
  @IsNumber()
  @Min(10)
  @Max(15)
  BCRYPT_SALT_ROUNDS: number;

  // Feedback
  @IsString()
  DISABLE_FEEDBACK?: string;

  // Logging
  @IsString()
  LOG_LEVEL?: string;

  // Application URLs
  @IsUrl({ require_tld: false })
  FRONTEND_URL: string;

  @IsString()
  BACKEND_URL?: string;

  @IsString()
  API_PREFIX?: string;

  // Scraping
  @IsNumber()
  @Min(5000)
  @Max(60000)
  SCRAPER_TIMEOUT: number;

  @IsUrl()
  ECAMPUS_BASE_URL: string;

  // Cache
  @IsNumber()
  @Min(1000)
  CACHE_TTL: number;

  @IsNumber()
  @Min(10)
  CACHE_MAX_ITEMS: number;

  // Redis (optional)
  @IsString()
  REDIS_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).join(", ")
          : "Unknown error";
        return `${error.property}: ${constraints}`;
      })
      .join("\n");

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return validatedConfig;
}
