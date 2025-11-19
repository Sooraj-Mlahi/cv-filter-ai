# Start production server
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY server/ ./server/
COPY shared/ ./shared/

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]