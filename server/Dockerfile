# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY server/shared-types/package.json ./server/shared-types/
COPY server/shared-utils/package.json ./server/shared-utils/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY server ./server

# Generate Prisma client
WORKDIR /app/server
RUN npx prisma generate

# Build the application
RUN pnpm build

# Production stage
FROM node:22-slim AS runner

WORKDIR /app

# Install pnpm and required tools
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy built application
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package.json ./
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
