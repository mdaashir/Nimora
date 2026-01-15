# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY client/package.json ./client/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY client ./client

# Build the application
WORKDIR /app/client
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Production stage
FROM node:22-slim AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/client/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/client/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["node", "server.js"]
