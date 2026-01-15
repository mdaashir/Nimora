# Nimora - Production Ready

Streamlined modern student portal built with Next.js 15 & NestJS 11.

## Quick Setup

```bash
# Install & setup
pnpm install
pnpm prepare  # Install Git hooks

# Development
pnpm dev

# Testing
pnpm test
```

## Features

- Attendance Tracking
- CGPA Analytics
- Timetable Management
- Internal Marks Tracking
- Auto Feedback Submission
- Secure JWT Authentication
- AES-256 Data Encryption

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui
- **Backend**: NestJS 11, Prisma ORM, PostgreSQL 17
- **Cache**: Redis 7
- **Auth**: JWT + AES-256-GCM Encryption
- **Testing**: Jest, Vitest, Playwright (50+ tests)
- **Security**: A Rating - OWASP Top 10 Mitigated

## CI/CD

Minimal, focused workflows:
- **test.yml** - Lint, type check, unit tests, E2E tests
- **security.yml** - Dependency scanning, CodeQL analysis
- **Pre-commit hooks** - Auto-format & lint before commits

## Key Files

```
├── .github/workflows/      # CI pipelines (test, security)
├── .husky/                 # Git hooks (pre-commit)
├── .lintstagedrc           # Lint-staged configuration
├── apps/
│   ├── frontend/           # Next.js app
│   ├── backend/            # NestJS API
│   └── packages/           # Shared code
├── docs/
│   └── CI_CD_WORKFLOW.md   # CI/CD documentation
└── docker-compose.yml      # Production setup
```

## Documentation

- [CI/CD Workflow](docs/CI_CD_WORKFLOW.md) - GitHub Actions & Git hooks
- [README.md](README.md) - Full project details

## Development Commands

```bash
pnpm dev              # Start dev servers
pnpm test             # Run all tests
pnpm lint             # Check code quality
pnpm format           # Auto-format code
pnpm build            # Production build
docker-compose up -d  # Docker deployment
```

## Status

✅ Production Ready
✅ 50+ Tests Passing
✅ Security Rating: A
✅ Automated Code Quality
✅ Pre-commit Hooks Enabled
