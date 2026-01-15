# Production Deployment Guide

## Environment Configuration

### Required Environment Variables

Create `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/nimora_db
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=900

# Redis
REDIS_URL=redis://user:password@host:6379

# JWT Secrets (32+ characters minimum)
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters-long
JWT_REFRESH_SECRET=your-secure-refresh-secret-minimum-32-chars
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key!

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production

# Security
CORS_ORIGIN=https://yourdomain.com
SESSION_COOKIE_DOMAIN=yourdomain.com
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAME_SITE=strict
SESSION_COOKIE_HTTP_ONLY=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_PUPPETEER_FEEDBACK=true
ENABLE_CLASS_TIMETABLE_RESTRICTION=true
```

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 17+ (external or in container)
- Redis 7+ (external or in container)

### Start Production Environment

```bash
# Build and start services
docker-compose -f docker-compose.yml up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Check status
docker-compose ps
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:3000
```

## Database Setup

### Initial Migration

```bash
# Generate Prisma client
npx prisma generate

# Run pending migrations
npx prisma migrate deploy

# Verify database
npx prisma db execute --stdin < verify.sql
```

### Backup

```bash
# Daily backup script
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
```

## SSL/TLS Configuration

### Using NGINX Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

## Monitoring

### Health Metrics

- Backend CPU: < 70%
- Memory: < 80%
- Database Connections: < pool_size * 0.8
- Response Time (p95): < 500ms
- Error Rate: < 0.1%

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# System logs
journalctl -u docker -f
```

## Scaling

### Horizontal Scaling

1. Load Balancer Configuration
2. Database Connection Pooling
3. Redis for Session Management
4. Static Asset CDN

### Vertical Scaling

- Increase container resources
- Update database pool size
- Adjust NODE_ENV settings

## Disaster Recovery

### Backup Schedule

- Daily incremental backups
- Weekly full backups
- Monthly off-site backups

### Recovery Process

1. Stop all services
2. Restore database from backup
3. Verify data integrity
4. Restart services

## Security Checklist

- [ ] Environment variables secured
- [ ] Database encrypted at rest
- [ ] TLS/SSL configured
- [ ] Firewall rules implemented
- [ ] Rate limiting enabled
- [ ] Logging enabled
- [ ] Monitoring configured
- [ ] Backup tested
- [ ] Disaster recovery plan reviewed
- [ ] Security headers verified
