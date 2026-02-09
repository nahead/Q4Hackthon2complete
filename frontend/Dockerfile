FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the pre-built Next.js application
COPY frontend/.next ./.next
COPY frontend/public ./public
COPY frontend/next.config.js ./
COPY frontend/package.json ./

EXPOSE 3000

# Start the Next.js app
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]