# Multi-stage build: Node.js application only (backend is external)

# Stage 1: Build Next.js app
FROM node:20-alpine AS nodejs-builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Runtime image with Node.js only
FROM node:20-alpine

WORKDIR /app

# Copy built Next.js app from builder
COPY --from=nodejs-builder /app/.next ./.next
COPY --from=nodejs-builder /app/public ./public
COPY --from=nodejs-builder /app/node_modules ./node_modules
COPY --from=nodejs-builder /app/package*.json ./
COPY --from=nodejs-builder /app/tsconfig.json ./
COPY --from=nodejs-builder /app/next.config.ts ./
COPY --from=nodejs-builder /app/tailwind.config.js ./

# Copy prisma schema for potential migrations
COPY prisma ./prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application with HTTP backend configuration
ENV BACKEND_DIRECT_CALL=false
ENV NODE_ENV=production

CMD ["npm", "start"]
