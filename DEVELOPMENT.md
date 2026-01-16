# Development Guide

Complete guide for developing Nimora locally.

## Table of Contents

1. [Local Setup](#local-setup)
2. [Architecture Overview](#architecture-overview)
3. [Development Commands](#development-commands)
4. [Database Development](#database-development)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Debugging](#debugging)
8. [Performance Profiling](#performance-profiling)
9. [Common Workflows](#common-workflows)

## Local Setup

### System Requirements

```bash
# Check Node.js version (need 20+)
node --version

# Check pnpm version (need 9+)
pnpm --version

# Check PostgreSQL version (need 17+)
psql --version

# Check Redis (optional but recommended)
redis-cli --version
```

### Initial Setup

```bash
# 1. Clone and install
git clone https://github.com/mdaashir/Nimora.git
cd Nimora
pnpm install

# 2. Setup environment
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# 3. Configure .env files
# Edit server/.env with local database credentials
# Edit client/.env.local with API URL

# 4. Setup database
cd server
pnpm prisma:migrate:dev --name init

# 5. Generate Prisma Client
pnpm prisma:generate

# 6. Start development
cd ..
pnpm dev
```

### Local Database Setup

Using PostgreSQL locally:

```bash
# Create database
createdb nimora

# Create user
createuser nimora -P

# Grant privileges
psql nimora -c "ALTER USER nimora WITH SUPERUSER"

# Set DATABASE_URL in server/.env
DATABASE_URL="postgresql://nimora:password@localhost:5432/nimora"

# Run migrations
cd server && pnpm prisma:migrate:dev
```

Or use Docker:

```bash
# Start PostgreSQL in Docker
docker run -d \
  --name nimora-db \
  -e POSTGRES_USER=nimora \
  -e POSTGRES_PASSWORD=nimora_secret \
  -e POSTGRES_DB=nimora \
  -p 5432:5432 \
  postgres:17

# Update DATABASE_URL
DATABASE_URL="postgresql://nimora:nimora_secret@localhost:5432/nimora"
```

## Architecture Overview

### Monorepo Structure

```
├── client/          # Next.js frontend
├── server/          # NestJS backend
├── .github/         # CI/CD workflows
├── prisma/          # Shared database schema
└── docker-compose.yml
```

### Technology Stack

**Frontend:**

- Next.js 15 with App Router
- React 19 with Server Components
- TailwindCSS v4 for styling
- shadcn/ui for components
- TanStack Query for data fetching
- React Hook Form for forms
- Zod for validation
- Vitest for testing
- Playwright for E2E tests

**Backend:**

- NestJS 11 with dependency injection
- PostgreSQL via Prisma ORM
- Redis for caching (optional)
- JWT for authentication
- Puppeteer for web scraping
- Jest for testing

### Data Flow

```
User Browser
    ↓
Next.js Frontend (localhost:3000)
    ↓ (REST API calls)
NestJS Backend (localhost:3001)
    ↓ (Database queries)
PostgreSQL (localhost:5432)
    ↓
Redis Cache (localhost:6379, optional)
```

## Development Commands

### Workspace Commands

```bash
# Start all services
pnpm dev

# Build everything
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

### Frontend-Only Commands

```bash
cd client

# Development
pnpm dev

# Build
pnpm build

# Testing
pnpm test                # Watch mode
pnpm test run            # Single run
pnpm test:coverage       # With coverage
pnpm test:e2e            # E2E tests
pnpm test:e2e:ui         # With browser UI

# Other
pnpm lint
pnpm lint:fix
pnpm typecheck
```

### Backend-Only Commands

```bash
cd server

# Development with hot reload
pnpm dev

# Watch mode
pnpm start:dev

# Debug mode
pnpm start:debug

# Build
pnpm build

# Testing
pnpm test              # Watch mode
pnpm test:watch       # Same as above
pnpm test:cov         # With coverage
pnpm test:debug       # Debug tests
pnpm test:e2e         # E2E tests

# Database
pnpm prisma:generate          # Generate Client
pnpm prisma:migrate:dev       # Create migration
pnpm prisma:migrate:deploy    # Apply migrations
pnpm prisma:studio            # Prisma GUI

# Other
pnpm lint
pnpm format
```

## Database Development

### Prisma Workflow

1. **Modify Schema**

   ```bash
   # Edit server/prisma/schema.prisma
   ```

2. **Create Migration**

   ```bash
   cd server
   pnpm prisma:migrate:dev --name add_new_model
   # Follow prompts and review generated SQL
   ```

3. **Review Generated Files**

   ```bash
   # Check migration in server/prisma/migrations/
   ls -la server/prisma/migrations/
   ```

4. **Generate Client**

   ```bash
   pnpm prisma:generate
   ```

5. **Use in Code**
   ```typescript
   // NestJS service
   const user = await this.prisma.user.findUnique({
     where: { id: userId },
   });
   ```

### Common Prisma Tasks

```bash
# Reset database (⚠️ DELETES ALL DATA)
pnpm prisma:migrate:reset

# Seed database with test data
# Create server/prisma/seed.ts
pnpm prisma db seed

# Open Prisma Studio GUI
pnpm prisma:studio
# Accessible at http://localhost:5555

# View database schema
pnpm prisma db pull

# Generate TypeScript types
pnpm prisma:generate
```

### Debugging Queries

```typescript
// Enable query logging in server/.env
DATABASE_URL = "postgresql://...?schema=public&log=query";

// Or in Prisma config
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});
```

## API Development

### Creating a New Endpoint

1. **Create DTO** (server/src/feature/dto/feature.dto.ts)

   ```typescript
   import { ApiProperty } from "@nestjs/swagger";
   import { IsString, IsEmail } from "class-validator";

   export class FeatureDto {
     @ApiProperty({ example: "user@example.com" })
     @IsEmail()
     email: string;

     @ApiProperty({ example: "John Doe" })
     @IsString()
     name: string;
   }
   ```

2. **Create Service** (server/src/feature/feature.service.ts)

   ```typescript
   import { Injectable } from "@nestjs/common";
   import { PrismaService } from "../prisma/prisma.service";

   @Injectable()
   export class FeatureService {
     constructor(private prisma: PrismaService) {}

     async createFeature(data: FeatureDto) {
       return this.prisma.feature.create({ data });
     }
   }
   ```

3. **Create Controller** (server/src/feature/feature.controller.ts)

   ```typescript
   import { Controller, Post, Body } from "@nestjs/common";
   import { ApiTags, ApiOperation } from "@nestjs/swagger";
   import { FeatureService } from "./feature.service";
   import { FeatureDto } from "./dto/feature.dto";

   @ApiTags("features")
   @Controller("api/feature")
   export class FeatureController {
     constructor(private service: FeatureService) {}

     @Post()
     @ApiOperation({ summary: "Create feature" })
     async create(@Body() dto: FeatureDto) {
       return this.service.createFeature(dto);
     }
   }
   ```

4. **Create Module** (server/src/feature/feature.module.ts)

   ```typescript
   import { Module } from "@nestjs/common";
   import { FeatureService } from "./feature.service";
   import { FeatureController } from "./feature.controller";

   @Module({
     controllers: [FeatureController],
     providers: [FeatureService],
     exports: [FeatureService],
   })
   export class FeatureModule {}
   ```

5. **Register Module** (server/src/app.module.ts)

   ```typescript
   import { FeatureModule } from "./feature/feature.module";

   @Module({
     imports: [
       // ...existing modules...
       FeatureModule,
     ],
   })
   export class AppModule {}
   ```

6. **Test the Endpoint**

   ```bash
   # Check Swagger docs
   # http://localhost:3001/api/docs

   # Or test with curl
   curl -X POST http://localhost:3001/api/feature \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "name": "John Doe"}'
   ```

## Frontend Development

### Creating a New Page

1. **Create Page Component** (client/src/app/feature/page.tsx)

   ```typescript
   import { Metadata } from 'next';
   import { FeatureComponent } from '@/components/feature';

   export const metadata: Metadata = {
     title: 'Feature - Nimora',
     description: 'Feature page',
   };

   export default function FeaturePage() {
     return <FeatureComponent />;
   }
   ```

2. **Create Component** (client/src/components/feature/index.tsx)

   ```typescript
   'use client';

   import { useQuery } from '@tanstack/react-query';
   import { api } from '@/utils/api';

   export function FeatureComponent() {
     const { data, isLoading } = useQuery({
       queryKey: ['features'],
       queryFn: async () => {
         const { data } = await api.get('/api/features');
         return data;
       },
     });

     if (isLoading) return <div>Loading...</div>;

     return (
       <div>
         {data?.map(item => (
           <div key={item.id}>{item.name}</div>
         ))}
       </div>
     );
   }
   ```

3. **Update Navigation** (client/src/components/layout/Navbar.tsx)
   ```typescript
   <Link href="/feature">Feature</Link>
   ```

## Debugging

### Backend Debugging

```bash
# Start with debugger
pnpm start:debug

# In VS Code, create .vscode/launch.json
{
  "type": "node",
  "request": "attach",
  "name": "Attach",
  "port": 9229
}

# Then press F5 to debug
```

### Frontend Debugging

```bash
# Chrome DevTools
# Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)

# VS Code Debugger
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}/client/src"
}
```

### Network Debugging

```bash
# Use Chrome DevTools Network tab
# Or use curl for API testing
curl -v http://localhost:3001/api/health

# Use Postman or REST Client VS Code extension
```

## Performance Profiling

### Frontend Performance

```bash
# Lighthouse audit
pnpm test:coverage

# Bundle analysis
npm install -D @next/bundle-analyzer

# Then update next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});

# Run with analysis
ANALYZE=true pnpm build
```

### Backend Performance

```bash
# Request timing
# Enable in src/main.ts
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${Date.now() - start}ms`);
  });
  next();
});

# Database query profiling
# Enable Prisma logging
DATABASE_QUERY_EVENTS=true pnpm dev
```

## Common Workflows

### Adding a Feature

1. Create backend API endpoint
2. Add Prisma model if needed
3. Create migration and test database changes
4. Create frontend page/component
5. Connect frontend to backend
6. Add tests (unit + E2E)
7. Test full flow locally
8. Submit PR

### Fixing a Bug

1. Identify root cause
2. Write test that reproduces bug
3. Fix bug
4. Verify test passes
5. Test manually if needed
6. Update documentation if relevant
7. Submit PR

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update specific package
pnpm update package-name@latest

# Update all packages
pnpm update -r

# Check for security issues
pnpm audit

# Fix security issues
pnpm audit --fix
```

### Database Backup

```bash
# Export database
pg_dump nimora > backup.sql

# Restore database
psql nimora < backup.sql

# Or using Docker
docker exec nimora-db pg_dump -U nimora nimora > backup.sql
```

## Tips & Tricks

- Use Prisma Studio for visual database editing
- Enable request logging in development
- Use React DevTools browser extension
- Test E2E workflows thoroughly before push
- Keep environment variables secure
- Use `.gitignore` properly
- Run full test suite before PR

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
