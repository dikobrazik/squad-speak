# Base on offical Node.js Alpine image
FROM node:22.21.1-alpine3.21

# Set working directory
WORKDIR /usr/app

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./
COPY ./app/package*.json ./app/

# Install dependencies
RUN npm install -w app

# Copy all files
COPY ./app/.env ./app/.env
COPY ./app ./app
COPY ./shared ./shared

# Build app
RUN npm run build -w app

# Expose the listening port
EXPOSE 3000

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node:1001

# Run npm start script when container starts
CMD [ "npm", "start", "-w", "app" ]
