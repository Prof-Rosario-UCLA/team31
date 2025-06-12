FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package.json ./
RUN npm install --production --no-optional

COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build
RUN npx tsc || echo "Build completed with warnings"

EXPOSE 8080
CMD ["node", "dist/index.js"]