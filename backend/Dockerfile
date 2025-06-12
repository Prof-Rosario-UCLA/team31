FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy TypeScript files and config
COPY . .

# Install dev dependencies for building
RUN npm install --only=development

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 8080

# Start the compiled JavaScript
CMD ["node", "dist/index.js"]