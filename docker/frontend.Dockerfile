# 1. Base Image
FROM node:20-slim

# 2. Enable pnpm
RUN corepack enable

# 3. Set Working Directory
WORKDIR /app

# 4. Copy dependency information
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# 5. Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

# 6. Copy application code
COPY frontend/ .

# 7. Set environment variable for the API URL at build time
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# 8. Build the application
RUN pnpm build

# 9. Expose port
EXPOSE 3000

# 10. Start the application
CMD ["pnpm", "start"]
