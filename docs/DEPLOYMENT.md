# Nimora Deployment Guide

## Overview

Nimora can be deployed using:
1. **Docker Compose** - Easiest for self-hosting
2. **Vercel + Railway/Render** - Cloud deployment
3. **Kubernetes** - Production scale

---

## Docker Compose Deployment

### Prerequisites
- Docker & Docker Compose installed
- Domain name (optional)
- SSL certificate (optional, for production)

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Nimora.git
cd Nimora
```

### 2. Configure Environment

Create `.env` file in repository root:

```env
# Database
POSTGRES_USER=nimora
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=nimora
DATABASE_URL=postgresql://nimora:your-secure-password@postgres:5432/nimora

# Redis
REDIS_URL=redis://redis:6379

# Backend
NODE_ENV=production
PORT=3001
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-production-refresh-secret-32
JWT_REFRESH_EXPIRATION=30d
ENCRYPTION_KEY=your-production-encryption-32-char

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

# Frontend
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### 3. Build and Deploy

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Check logs
docker-compose logs -f
```

### 4. Verify Deployment

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Swagger Docs: `http://localhost:3001/api/docs`

---

## Vercel Deployment (Frontend)

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Select your Nimora repository
4. Set root directory to `apps/frontend`

### 2. Configure Build Settings

```
Framework: Next.js
Root Directory: apps/frontend
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

### 3. Set Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### 4. Deploy

Click "Deploy" and Vercel will automatically build and deploy.

---

## Railway/Render Deployment (Backend)

### Railway

1. Create new project at [Railway](https://railway.app/)
2. Add PostgreSQL and Redis from templates
3. Add new service from GitHub repo
4. Set root directory to `apps/backend`
5. Configure environment variables from Railway UI
6. Railway will auto-detect NestJS and deploy

### Render

1. Create new Web Service at [Render](https://render.com/)
2. Connect GitHub repository
3. Set root directory: `apps/backend`
4. Build command: `pnpm install && pnpm build`
5. Start command: `node dist/main.js`
6. Add PostgreSQL and Redis as Render services

---

## Production Checklist

### Security

- [ ] Set strong, unique passwords for all services
- [ ] Use HTTPS (SSL certificates)
- [ ] Configure CORS properly (`FRONTEND_URL`)
- [ ] Set secure cookie options in production
- [ ] Review and set proper rate limits
- [ ] Enable helmet middleware in production

### Performance

- [ ] Enable Redis caching
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable gzip compression

### Monitoring

- [ ] Set up health check endpoints monitoring
- [ ] Configure error logging (e.g., Sentry)
- [ ] Set up database backup schedule
- [ ] Monitor resource usage

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret (32+ chars) | Yes |
| `ENCRYPTION_KEY` | Credential encryption key (32 chars) | Yes |
| `REDIS_URL` | Redis connection string | Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | For OAuth |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

---

## Updating Deployment

### Docker Compose

```bash
git pull origin main
docker-compose build
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

### Vercel/Railway

Push to main branch triggers automatic deployment.

---

## Rollback

### Docker

```bash
# List images
docker images

# Run previous version
docker-compose up -d --no-deps backend:previous-tag
```

### Vercel

Use Vercel dashboard to rollback to previous deployment.

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Missing environment variables
# - Database not ready (add depends_on with healthcheck)
# - Port already in use
```

### Database migrations fail

```bash
# Check migration status
docker-compose exec backend npx prisma migrate status

# Reset database (CAUTION: destroys data)
docker-compose exec backend npx prisma migrate reset
```

### Performance issues

1. Check Redis connection
2. Review database query performance
3. Enable Puppeteer pooling for scrapers
4. Consider horizontal scaling
