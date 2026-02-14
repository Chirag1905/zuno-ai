FROM oven/bun:1.3.9

# Install system dependencies
RUN apt-get update -y && apt-get install -y openssl libssl-dev

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Copy prisma schema for postinstall script
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Generate Prisma client
RUN bun prisma generate

# Expose port
EXPOSE 3000

# Start command (will be overridden by docker-compose for dev, but good default)
CMD ["bun", "run", "dev"]
