# Nimora Developer Setup Guide

## Prerequisites

- **Node.js:** v20+ (LTS recommended)
- **pnpm:** v9+ (package manager)
- **Docker & Docker Compose:** (optional, for full stack with database)
- **Git:** For version control

## Quick Start (Without Docker)

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/Nimora.git
cd Nimora
pnpm install
```

### 2. Generate Prisma Client

```bash
cd apps/backend
npx prisma generate
```

### 3. Start Frontend Only

```bash
cd apps/frontend
pnpm dev
# Frontend available at http://localhost:3000
```

### 4. Start Backend (requires environment variables)

```bash
cd apps/backend

# Set required environment variables
export ENCRYPTION_KEY="your-32-character-encryption-key"
export JWT_SECRET="your-jwt-secret-key"
export JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nimora"

# Build and run
pnpm build
node ./dist/main.js
# Backend available at http://localhost:3001
```

## Full Stack Setup (With Docker)

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/Nimora.git
cd Nimora
pnpm install
```

### 2. Create Environment File

Create `apps/backend/.env`:

```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nimora"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32
JWT_REFRESH_EXPIRATION=30d

# Encryption
ENCRYPTION_KEY=your-encryption-key-must-be-32-chars

# Google OAuth (leave empty to bypass)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
cd apps/backend
npx prisma migrate dev
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd apps/backend
pnpm dev

# Terminal 2: Frontend
cd apps/frontend
pnpm dev
```

## Project Structure

```
nimora/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── attendance/
│   │   │   ├── cgpa/
│   │   │   ├── timetable/
│   │   │   ├── internals/
│   │   │   ├── feedback/
│   │   │   ├── scrapers/ # Puppeteer scrapers
│   │   │   └── prisma/   # Database service
│   │   └── prisma/       # Schema & migrations
│   └── frontend/         # Next.js 15 app
│       └── src/
│           ├── app/      # App Router pages
│           ├── components/
│           └── lib/      # Utilities
└── packages/
    ├── shared-types/     # TypeScript interfaces
    └── shared-utils/     # Utility functions
```

## Available Scripts

### Root Level

```bash
pnpm install          # Install all dependencies
pnpm -r test          # Run all tests
pnpm -r build         # Build all packages
```

### Backend (`apps/backend`)

```bash
pnpm build            # Build for production
pnpm dev              # Start in watch mode
pnpm start            # Start built server
pnpm test             # Run unit tests
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate:dev  # Run migrations
pnpm prisma:studio    # Open Prisma Studio
```

### Frontend (`apps/frontend`)

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

## API Endpoints

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| POST | `/auth/login` | Login with eCampus credentials |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/profile` | Get current user profile |
| POST | `/attendance` | Get attendance data |
| POST | `/cgpa` | Get CGPA data |
| POST | `/timetable` | Get timetable data |
| POST | `/internals` | Get internal marks |
| POST | `/feedback` | Submit feedback |

**Swagger Documentation:** `http://localhost:3001/api/docs`

## Testing

```bash
# Run all tests
pnpm -r test

# Run backend tests with coverage
cd apps/backend
pnpm test:cov

# Run shared-utils tests
cd packages/shared-utils
pnpm test
```

## Troubleshooting

### Backend won't start

1. Ensure Prisma client is generated: `npx prisma generate`
2. Check all environment variables are set
3. Verify `dist/main.js` exists after build

### Frontend build errors

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`

### Database connection errors

1. Ensure PostgreSQL is running: `docker-compose up -d postgres`
2. Check `DATABASE_URL` in environment
3. Run migrations: `npx prisma migrate dev`

## Google OAuth Setup (Optional)

1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
4. Remove bypass warning by ensuring credentials are configured
