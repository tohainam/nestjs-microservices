FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose gRPC port (default gRPC port is 50051)
EXPOSE 50051

# Start the gRPC microservice
CMD ["pnpm", "run", "start:prod"]