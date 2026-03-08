ARG NODE_VERSION=24.14.1-alpine

# ============================================
# Stage 1: Install dependencies
# ============================================

FROM node:${NODE_VERSION} AS builddeps
WORKDIR /usr/app
COPY ./package*.json ./
COPY ./server/package*.json ./server/
RUN --mount=type=cache,target=/root/.npm \
    npm ci -w server --no-audit --no-fund

# ============================================
# Stage 1: Install production dependencies
# ============================================
FROM node:${NODE_VERSION} AS dependencies
ENV NODE_ENV=production
WORKDIR /usr/app
COPY ./package*.json ./
COPY ./server/package*.json ./server/
RUN --mount=type=cache,target=/root/.npm \
    npm ci -w server --no-audit --no-fund
  
# ============================================
# Stage 2: Build Nest.js application
# ============================================

FROM node:${NODE_VERSION} AS builder
WORKDIR /usr/app
COPY --from=builddeps /usr/app/node_modules ./node_modules
# COPY --from=builddeps /usr/app/server/node_modules ./server/node_modules
COPY ./server ./server
COPY ./shared ./shared
COPY ./package*.json ./
RUN npm run build -w server


# ============================================
# Stage 3: Run Nest.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

WORKDIR /usr/app

ENV NODE_ENV=production
COPY --from=dependencies --chown=node:node /usr/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/app/server/dist ./dist
# COPY --from=dependencies --chown=node:node /usr/app/server/node_modules ./dist/node_modules
USER node:1001

EXPOSE 80
CMD ["node", "dist/server/src/main.js"]
