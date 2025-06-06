# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Verify build output exists
RUN ls -la dist/

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"] 