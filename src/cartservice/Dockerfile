# Use an official Node.js runtime as a parent image
FROM node:22-slim AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies
RUN npm install

# Bundle app source
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Use a smaller base image for the final image
FROM node:22-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the compiled code and production dependencies from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "dist/index.js" ]
