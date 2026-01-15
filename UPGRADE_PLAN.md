# Nimora Modernization Plan

## Overview

Transform Nimora from Python/FastAPI + React into a unified full-stack JavaScript ecosystem following medace's proven patterns.

**Target Stack:**
- **Frontend:** Next.js 15+ with App Router
- **Backend:** NestJS with modular architecture
- **Database:** PostgreSQL 17 with Prisma ORM
- **Cache:** Redis for session/data caching
- **Scraping:** Puppeteer (Node.js) replacing Selenium
- **UI:** shadcn/ui + Tailwind CSS v4
- **State:** React Query (TanStack Query)
- **Auth:** Google OAuth2 + JWT
- **Containerization:** Docker + Docker Compose

---

## Implementation Progress Tracker

### Phase 0: Project Setup & Infrastructure

- [x] Create `upgrade` branch
- [x] Create implementation plan (this file)
- [x] Setup monorepo structure with pnpm workspaces
- [x] Create shared-types package
- [x] Create shared-utils package
- [x] Setup root configuration files

### Phase 1: Backend Modernization (NestJS)

- [x] Initialize NestJS application
- [x] Setup Prisma ORM
- [x] Create database schema
- [x] Implement Config module
- [x] Implement Auth module
  - [x] JWT strategy
  - [x] Google OAuth strategy
  - [x] Guards and decorators
- [x] Implement User module
- [x] Implement Attendance module
- [x] Implement CGPA module
- [x] Implement Timetable module
- [x] Implement Internals module
- [x] Implement Feedback module
- [x] Setup global error handling
- [x] Setup request validation
- [x] Setup API documentation (Swagger)

### Phase 2: Scraping Service (Puppeteer)

- [x] Setup Puppeteer configuration
- [x] Implement eCampus authentication scraper
- [x] Implement Attendance scraper
- [x] Implement CGPA scraper
- [x] Implement Timetable scraper
- [x] Implement Internals scraper
- [ ] Implement Feedback automation scraper
- [x] Add caching layer with Redis
- [x] Implement credential encryption service

### Phase 3: Frontend Modernization (Next.js)

- [x] Initialize Next.js application
- [x] Setup Tailwind CSS v4
- [x] Install and configure shadcn/ui
- [x] Setup React Query
- [x] Setup API client (Axios)
- [x] Implement feature-based folder structure
- [x] Create UI components
  - [x] Button, Card, Input, Form components
  - [x] Navbar, Footer, Layout components
  - [x] Loading and Error components
- [x] Implement Auth pages
  - [x] Login page with Google OAuth
  - [x] Protected route middleware
- [x] Implement Attendance feature
  - [x] API hook
  - [x] Components
  - [x] Page
- [x] Implement CGPA feature
- [x] Implement Timetable feature
- [x] Implement Internals feature
- [x] Implement Feedback feature
- [x] Implement Home/Dashboard page
- [ ] Add Error Boundaries
- [ ] Add toast notifications

### Phase 4: Database & Caching

- [x] Design Prisma schema
- [x] Create User model
- [x] Create Attendance cache model
- [x] Create CGPA cache model
- [x] Setup Redis connection
- [x] Implement cache service
- [ ] Run database migrations

### Phase 5: Containerization & DevOps

- [x] Create Backend Dockerfile
- [x] Create Frontend Dockerfile
- [x] Create docker-compose.yml
- [x] Setup PostgreSQL container
- [x] Setup Redis container
- [x] Setup environment variables
- [ ] Test local development with Docker
- [x] Create production build configuration

### Phase 6: Testing & Quality

- [x] Setup Jest for backend
- [x] Write backend unit tests
- [ ] Setup Vitest for frontend
- [ ] Write frontend component tests
- [ ] Setup E2E testing (Playwright)
- [x] Setup ESLint + Prettier
- [ ] Achieve >80% test coverage

### Phase 7: Migration & Documentation

- [ ] Create API documentation
- [ ] Create developer setup guide
- [ ] Create deployment guide
- [ ] Test full application workflow
- [ ] Performance optimization
- [ ] Security audit

---

## Project Structure

```
nimora/
├── apps/
│   ├── frontend/                 # Next.js application
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router
│   │   │   ├── components/
│   │   │   │   └── ui/           # shadcn/ui components
│   │   │   ├── features/
│   │   │   │   ├── attendance/
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── components/
│   │   │   │   │   └── types/
│   │   │   │   ├── cgpa/
│   │   │   │   ├── timetable/
│   │   │   │   ├── internals/
│   │   │   │   └── feedback/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── query-client.ts
│   │   │   │   └── utils.ts
│   │   │   └── constants/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── backend/                  # NestJS application
│       ├── src/
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── strategies/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   └── dto/
│       │   ├── users/
│       │   ├── attendance/
│       │   ├── cgpa/
│       │   ├── timetable/
│       │   ├── internals/
│       │   ├── feedback/
│       │   ├── scrapers/
│       │   │   ├── ecampus-auth.scraper.ts
│       │   │   ├── attendance.scraper.ts
│       │   │   ├── cgpa.scraper.ts
│       │   │   ├── timetable.scraper.ts
│       │   │   ├── internals.scraper.ts
│       │   │   └── feedback.scraper.ts
│       │   ├── cache/
│       │   ├── config/
│       │   ├── prisma/
│       │   ├── common/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   └── middleware/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── test/
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared-types/             # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── attendance.ts
│   │   │   ├── cgpa.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared-utils/             # Shared utilities
│       ├── src/
│       │   ├── encryption.ts
│       │   ├── validation.ts
│       │   └── index.ts
│       └── package.json
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── .env.example
├── .gitignore
├── README.md
└── UPGRADE_PLAN.md
```

---

## Technology Decisions

### Backend: NestJS
- Modular architecture matching medace pattern
- Built-in dependency injection
- TypeScript-first
- Excellent Prisma integration
- Auto-generated Swagger docs

### Frontend: Next.js 15+
- App Router for modern React patterns
- Server Components for performance
- Built-in optimizations
- Great DX with fast refresh

### Database: PostgreSQL + Prisma
- Type-safe database queries
- Auto-generated migrations
- Excellent developer experience
- Medace-proven pattern

### Caching: Redis
- Fast in-memory data store
- Session management
- Rate limiting support
- Reduces eCampus API hits

### Scraping: Puppeteer
- Pure JavaScript (no Python dependency)
- Chrome DevTools Protocol
- Reliable automation
- Works well in Docker

### UI: shadcn/ui + Tailwind
- Radix UI primitives (accessible)
- Copy-paste components
- Full customization
- Modern design patterns

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nimora

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Encryption (for eCampus credentials)
ENCRYPTION_KEY=your-32-byte-encryption-key

# App URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

---

## Commit Strategy

Each completed TODO section should be committed with a descriptive message:

```
feat(setup): initialize monorepo structure
feat(backend): add NestJS application scaffold
feat(backend): implement auth module with JWT
feat(backend): implement attendance module
feat(frontend): initialize Next.js application
feat(frontend): add shadcn/ui components
feat(docker): add containerization setup
test(backend): add unit tests for auth module
docs: add API documentation
```

---

## Next Steps

1. ✅ Create upgrade branch
2. ✅ Create this implementation plan
3. 🔄 Setup monorepo structure
4. Initialize backend (NestJS)
5. Initialize frontend (Next.js)
6. Setup Docker infrastructure
7. Implement core features

---

## Notes

- **Sensitive Data:** Will prompt for Google OAuth credentials and encryption keys
- **eCampus Scraping:** Existing Python logic will be ported to Puppeteer
- **Backward Compatibility:** Old API endpoints will be deprecated gradually
- **Testing:** Focus on critical paths first (auth, attendance, cgpa)

---

*Last Updated: January 15, 2026*
