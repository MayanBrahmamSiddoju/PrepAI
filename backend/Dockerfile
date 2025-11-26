FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["node", "server.js"]
