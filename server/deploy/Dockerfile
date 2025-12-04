# Base image
FROM node:20.18.0-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY ./server/package*.json ./server/
COPY ./package*.json ./

# Install app dependencies
RUN npm install -w server

# Bundle app source
COPY ./server ./server
COPY ./shared ./shared

# Creates a "dist" folder with the production build
RUN npm run build -w server

# Start the server using the production build
CMD ["npm", "run", "start:prod", "-w", "server"]
