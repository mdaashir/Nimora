# Nimora Backend - NestJS API

Backend API service for Nimora student portal built with NestJS, PostgreSQL, and Redis.

## Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5.9
- **Database:** PostgreSQL 17 + Prisma ORM
- **Cache:** Redis 7 (optional, in-memory fallback)
- **Authentication:** JWT + Passport.js
- **Validation:** class-validator
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest + Supertest

## Project Structure

```
server/
├── src/
│   ├── attendance/       # Attendance scraping & API
│   ├── auth/             # JWT authentication
│   ├── cache/            # Caching configuration
│   ├── cgpa/             # CGPA data scraping
│   ├── config/           # Environment validation
│   ├── feedback/         # Feedback submission
│   ├── internals/        # Internal marks scraping
│   ├── middleware/       # Custom middleware
│   ├── prisma/           # Database service
│   ├── timetable/        # Timetable scraping
│   ├── users/            # User management
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma     # Database schema
├── test/                 # E2E tests
├── .env.example
└── package.json
```

## Setup

### Environment Variables

Create `server/.env` from `server/.env.example`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nimora

# JWT
JWT_ACCESS_SECRET=your-32-character-secret-key-here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-32-character-secret-key-here
JWT_REFRESH_EXPIRATION=7d

# Encryption
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
ENCRYPTION_SALT=your-salt-here

# Scraping
ECAMPUS_BASE_URL=https://ecampus.psg.ac.in
SCRAPER_TIMEOUT=30000

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
CACHE_MAX_ITEMS=100
```

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate:dev

# Start development server
pnpm dev

# Server runs on http://localhost:3001
# API docs available at http://localhost:3001/api/docs
```

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (webpack)
- `pnpm start` - Run production build
- `pnpm lint` - Lint with ESLint
- `pnpm format` - Format with Prettier
- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Generate coverage report
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate:dev` - Create and apply migrations
- `pnpm prisma:studio` - Open Prisma Studio GUI

## Key Features

### Authentication

- JWT-based authentication
- Refresh token rotation
- Encrypted credential storage
- HTTP-only secure cookies

### Web Scraping

- Puppeteer-based eCampus scraping
- Attendance tracking
- CGPA calculation
- Timetable fetching
- Internal marks tracking
- Automatic feedback submission

### Caching

- Redis integration (optional)
- In-memory fallback cache
- TTL-based cache invalidation
- Database result caching

### Security

- AES-256-GCM encryption for sensitive data
- Bcrypt password hashing
- CORS protection
- Input validation and sanitization
- Rate limiting ready

### API Documentation

- Swagger/OpenAPI integration
- Auto-generated API docs
- Type-safe DTOs

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Data Retrieval

- `POST /api/attendance` - Get attendance data
- `POST /api/cgpa` - Get CGPA information
- `POST /api/timetable` - Get timetable
- `POST /api/class-timetable` - Get class timetable
- `POST /api/internals` - Get internal marks
- `POST /api/feedback` - Submit feedback

### Health

- `GET /api/health` - Health check

## Database

### Schema

Using Prisma ORM with PostgreSQL:

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  encryptedRollNo String
  createdAt       DateTime  @default(now())
  sessions        Session[]
}

model Session {
  id           String    @id @default(cuid())
  refreshToken String    @unique
  userId       String
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
}
```

### Migrations

```bash
# Create migration
pnpm prisma:migrate:dev --name migration_name

# Deploy migrations
pnpm prisma:migrate:deploy

# Reset database (dev only)
pnpm prisma:migrate:reset
```

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## Deployment

### Docker

```bash
# Build image
docker build -f Dockerfile -t nimora-server .

# Run container
docker run -e DATABASE_URL=... -p 3001:3001 nimora-server
```

### Environment Variables for Production

Required env vars must be set before deployment:

- All JWT secrets (min 32 chars)
- Encryption key (32-byte hex)
- Database URL with strong credentials
- Actual eCampus URL (not test)

## Performance

- Webpack-optimized builds
- Modular architecture
- Dependency injection with NestJS
- Connection pooling for database
- Conditional Redis for distributed caching
- Request validation at module level

## Security

- ✅ Environment validation at startup
- ✅ No hardcoded secrets
- ✅ Encrypted credential storage
- ✅ Secure JWT implementation
- ✅ CORS configured
- ✅ Input sanitization
- ✅ SQL injection protection via ORM
- ✅ Rate limiting ready

## Troubleshooting

**Database connection fails**

```bash
# Check PostgreSQL is running
psql -U user -d nimora -c "SELECT 1"

# Verify DATABASE_URL format
# postgresql://user:password@host:port/database
```

**Prisma Client not found**

```bash
pnpm prisma:generate
```

**Port already in use**

```bash
# Change PORT in .env
PORT=3002
```

**Scraping fails**

- Check ECAMPUS_BASE_URL is accessible
- Verify SCRAPER_TIMEOUT is sufficient
- Check credentials are valid

## License

MIT - See [LICENSE](../LICENSE) for details.
