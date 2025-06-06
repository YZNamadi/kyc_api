# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Show source files
RUN echo "Source files:" && ls -la src/

# Build TypeScript code with verbose output
RUN npm run build

# Show build output
RUN echo "Build output:" && ls -la dist/

# Ensure proper permissions
RUN chown -R node:node /usr/src/app

# Remove dev dependencies
RUN npm prune --production

# Final verification
RUN echo "Final directory structure:" && ls -la

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"] 