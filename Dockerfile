# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Debug: Show TypeScript version and configuration
RUN echo "TypeScript version:" && npx tsc --version
RUN echo "TypeScript config:" && cat tsconfig.json

# Debug: Show source files
RUN echo "Source files:" && ls -la src/

# Build TypeScript code
RUN npm run build

# Debug: Show build output
RUN echo "Build output:" && ls -la dist/ || echo "dist directory not found"

# Debug: Show file contents if build failed
RUN if [ ! -f "dist/index.js" ]; then \
    echo "Build failed. Showing relevant files:" && \
    echo "package.json:" && cat package.json && \
    echo "tsconfig.json:" && cat tsconfig.json && \
    echo "src/index.ts:" && cat src/index.ts; \
    fi

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