import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // Global prefix
  app.setGlobalPrefix("api");

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  // Cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Nimora API")
      .setDescription("The Nimora Student Portal API documentation")
      .setVersion("2.0")
      .addTag("auth", "Authentication endpoints")
      .addTag("attendance", "Attendance data endpoints")
      .addTag("cgpa", "CGPA and grades endpoints")
      .addTag("timetable", "Timetable endpoints")
      .addTag("internals", "Internal marks endpoints")
      .addTag("feedback", "Feedback automation endpoints")
      .addBearerAuth()
      .addCookieAuth("access_token")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
    logger.log("Swagger documentation available at /api/docs");
  }

  const port = process.env.PORT;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API endpoint: http://localhost:${port}/api`);
}

bootstrap();
