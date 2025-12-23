# Multi-stage build for Next.js application
FROM node:25.0.0-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Use npm ci (includes optional dependencies by default)
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Rebuild native modules for the current platform to ensure compatibility
RUN npm rebuild

# Accept build arguments for Next.js public env vars
ARG NEXT_PUBLIC_API_URL
ARG INTERNAL_API_URL
ARG NEXT_PUBLIC_DEV_MODE
ARG NEXT_PUBLIC_MOCK_AUTH
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG GH_CLIENT_ID
ARG GH_CLIENT_SECRET
ARG S3_ACCESS_KEY
ARG S3_SECRET_KEY
ARG S3_BUCKET_NAME
ARG S3_ARN
ARG FAVORITED_CHAINS_TABLE_ARN
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

# Export them as environment variables for the build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_PUBLIC_DEV_MODE=$NEXT_PUBLIC_DEV_MODE
ENV NEXT_PUBLIC_MOCK_AUTH=$NEXT_PUBLIC_MOCK_AUTH
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV GH_CLIENT_ID=$GH_CLIENT_ID
ENV GH_CLIENT_SECRET=$GH_CLIENT_SECRET
ENV S3_ACCESS_KEY=$S3_ACCESS_KEY
ENV S3_SECRET_KEY=$S3_SECRET_KEY
ENV S3_BUCKET_NAME=$S3_BUCKET_NAME
ENV S3_ARN=$S3_ARN
ENV FAVORITED_CHAINS_TABLE_ARN=$FAVORITED_CHAINS_TABLE_ARN
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
