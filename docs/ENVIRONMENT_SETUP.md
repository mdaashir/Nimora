# Environment Configuration

## Local Development

Create `.env` file in root directory:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nimora_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=dev-jwt-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=dev-refresh-secret-key-minimum-32-chars
JWT_EXPIRATION=900000

# Encryption
ENCRYPTION_KEY=12345678901234567890123456789012

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

## Production

Create `.env.production` using [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

## Docker Secrets

For Docker Swarm/Kubernetes:

```bash
echo "your-secret-value" | docker secret create jwt_secret -
echo "your-encryption-key" | docker secret create encryption_key -
```

## CI/CD Integration

Secrets configured in GitHub Actions secrets:
- `DATABASE_URL`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `DEPLOYMENT_TOKEN`

Update in Settings > Secrets and variables > Actions
