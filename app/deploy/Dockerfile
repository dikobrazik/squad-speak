ARG NODE_VERSION=24.14.1-alpine

# ============================================
# Stage 1: Install dependencies
# ============================================

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /usr/app

COPY ./package*.json ./
COPY ./app/package*.json ./app/

RUN --mount=type=cache,target=/root/.npm \
    npm ci -w app --no-audit --no-fund

# ============================================
# Stage 2: Build Next.js application
# ============================================

FROM node:${NODE_VERSION} AS builder
WORKDIR /usr/app
COPY --from=dependencies /usr/app/node_modules ./node_modules
# COPY --from=dependencies /usr/app/app/node_modules ./app/node_modules
COPY ./app/.env ./app/.env
COPY ./app ./app
COPY ./shared ./shared
COPY ./package*.json ./
RUN npm run build -w app

# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

WORKDIR /usr/app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
COPY --from=builder --chown=node:node /usr/app/app/public ./public
RUN mkdir .next
RUN chown node:node .next
COPY --from=builder --chown=node:node /usr/app/app/.next/standalone ./
COPY --from=builder --chown=node:node /usr/app/app/.next/static ./.next/static
USER node:1001

EXPOSE 3000
CMD ["node", "app/server.js"]
