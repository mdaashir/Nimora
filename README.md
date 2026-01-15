# 🎓 Nimora

<div align="center">

**A modern student portal for eCampus - Built with Next.js 15 & NestJS**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[📖 Documentation](docs/DEVELOPER_SETUP.md) • [🚀 Quick Start](#quick-start) • [🐳 Docker](#docker-deployment)

</div>

---

## ✨ Features

- **📊 Attendance Tracking** - View attendance with bunk calculator
- **📈 CGPA Analytics** - Semester-wise GPA breakdown
- **📅 Timetable & Exams** - Class and exam schedules
- **�️ Class Timetable** - Conditional access for specific students (22PT roll numbers)
- **📝 Internal Marks** - Track continuous assessment scores
- **💬 Auto Feedback** - Automate faculty feedback submission (Puppeteer-based)
- **🔐 Secure Auth** - JWT authentication with encrypted credentials
- **🎨 Original Design** - Restored blue theme (#1173d4) from original Skipp branding

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 15, React 19, TailwindCSS v4, shadcn/ui |
| **Backend** | NestJS 11, Prisma ORM, PostgreSQL 17 |
| **Scraping** | Puppeteer (Node.js) |
| **Cache** | Redis 7 |
| **Auth** | JWT, Passport.js, AES-256-GCM Encryption |
| **Testing** | Jest + Vitest + Playwright (50+ tests) |
| **Security** | A Rating - OWASP Top 10 Mitigated |

## 📁 Project Structure

```
nimora/
├── apps/
│   ├── frontend/         # Next.js 15 App Router
│   └── backend/          # NestJS API
├── packages/
│   ├── shared-types/     # TypeScript interfaces
│   └── shared-utils/     # Utility functions
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/Nimora.git
cd Nimora

# Install dependencies
pnpm install

# Generate Prisma client
cd apps/backend && npx prisma generate

# Start frontend
cd apps/frontend && pnpm dev

# Start backend (in another terminal)
cd apps/backend
export ENCRYPTION_KEY="your-32-character-encryption-key!"
export JWT_SECRET="your-jwt-secret-key-minimum-32-char"
export JWT_REFRESH_SECRET="your-refresh-secret-minimum-32ch"
pnpm dev
```

**Frontend:** http://localhost:3000
**Backend:** http://localhost:3001
**API Docs:** http://localhost:3001/api/docs

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login |
| POST | `/api/attendance` | Get attendance |
| POST | `/api/cgpa` | Get CGPA |
| POST | `/api/timetable` | Get timetable |
| POST | `/api/internals` | Get internal marks |
| POST | `/api/feedback` | Submit feedback |

## 🧪 Testing

```bash
# Run all tests
pnpm -r test

# 47 tests passing:
# - Backend: 27 tests
# - Shared-utils: 20 tests
```

## 📚 Documentation

- [Developer Setup Guide](docs/DEVELOPER_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Guide](docs/TESTING.md)
- [Security Audit](docs/SECURITY_AUDIT.md)
- [Performance Report](docs/PERFORMANCE.md)
- [Upgrade Plan](UPGRADE_PLAN.md)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Backend unit tests
pnpm test:backend

# Frontend component tests
pnpm test:frontend

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

**Test Coverage:**
- Backend: 27 unit tests
- Frontend: 3 component test suites
- E2E: 2 Playwright test suites
- Total: 50+ automated tests

## 🔐 Security

- **Security Rating:** A (Excellent)
- All eCampus credentials encrypted with AES-256-GCM
- JWT tokens with secure expiration (15m access, 7d refresh)
- HTTP-only cookies for authentication tokens
- CORS configured for production
- OWASP Top 10 vulnerabilities mitigated
- Security headers configured (HSTS, CSP, X-Frame-Options)
- Input validation and sanitization
- No third-party OAuth dependencies
- Rate limiting on sensitive endpoints

## ⚡ Performance

- **Bundle Optimization:** Code splitting, tree shaking, SWC minification
- **Image Optimization:** AVIF/WebP support, responsive images
- **Caching:** Redis for session and data caching
- **Security Headers:** HSTS, CSP-ready, X-Content-Type-Options
- **Compression:** Gzip enabled for responses
- **Static Generation:** 13/13 pages pre-rendered

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ using Next.js + NestJS
</div>
