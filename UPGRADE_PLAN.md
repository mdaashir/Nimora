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
- [ ] Setup monorepo structure with pnpm workspaces
- [ ] Create shared-types package
- [ ] Create shared-utils package
- [ ] Setup root configuration files

### Phase 1: Backend Modernization (NestJS)

- [ ] Initialize NestJS application
- [ ] Setup Prisma ORM
- [ ] Create database schema
- [ ] Implement Config module
- [ ] Implement Auth module
  - [ ] JWT strategy
  - [ ] Google OAuth strategy
  - [ ] Guards and decorators
- [ ] Implement User module
- [ ] Implement Attendance module
- [ ] Implement CGPA module
- [ ] Implement Timetable module
- [ ] Implement Internals module
- [ ] Implement Feedback module
- [ ] Setup global error handling
- [ ] Setup request validation
- [ ] Setup API documentation (Swagger)

### Phase 2: Scraping Service (Puppeteer)

- [ ] Setup Puppeteer configuration
- [ ] Implement eCampus authentication scraper
- [ ] Implement Attendance scraper
- [ ] Implement CGPA scraper
- [ ] Implement Timetable scraper
- [ ] Implement Internals scraper
- [ ] Implement Feedback automation scraper
- [ ] Add caching layer with Redis
- [ ] Implement credential encryption service

### Phase 3: Frontend Modernization (Next.js)

- [ ] Initialize Next.js application
- [ ] Setup Tailwind CSS v4
- [ ] Install and configure shadcn/ui
- [ ] Setup React Query
- [ ] Setup API client (Axios)
- [ ] Implement feature-based folder structure
- [ ] Create UI components
  - [ ] Button, Card, Input, Form components
  - [ ] Navbar, Footer, Layout components
  - [ ] Loading and Error components
- [ ] Implement Auth pages
  - [ ] Login page with Google OAuth
  - [ ] Protected route middleware
- [ ] Implement Attendance feature
  - [ ] API hook
  - [ ] Components
  - [ ] Page
- [ ] Implement CGPA feature
- [ ] Implement Timetable feature
- [ ] Implement Internals feature
- [ ] Implement Feedback feature
- [ ] Implement Home/Dashboard page
- [ ] Add Error Boundaries
- [ ] Add toast notifications

### Phase 4: Database & Caching

- [ ] Design Prisma schema
- [ ] Create User model
- [ ] Create Attendance cache model
- [ ] Create CGPA cache model
- [ ] Setup Redis connection
- [ ] Implement cache service
- [ ] Run database migrations

### Phase 5: Containerization & DevOps

- [ ] Create Backend Dockerfile
- [ ] Create Frontend Dockerfile
- [ ] Create docker-compose.yml
- [ ] Setup PostgreSQL container
- [ ] Setup Redis container
- [ ] Setup environment variables
- [ ] Test local development with Docker
- [ ] Create production build configuration

### Phase 6: Testing & Quality

- [ ] Setup Jest for backend
- [ ] Write backend unit tests
- [ ] Setup Vitest for frontend
- [ ] Write frontend component tests
- [ ] Setup E2E testing (Playwright)
- [ ] Setup ESLint + Prettier
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
