ARG NODE_VERSION=24

FROM myoung34/github-runner:ubuntu-noble AS base

# Install Node.js (includes corepack)
ARG NODE_VERSION
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install -y nodejs


# Enable pnpm via corepack (matches GitHub Actions pnpm support)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build stage
FROM base AS build

WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

# Run build, matching GitHub Actions build step
RUN pnpm build --continue
RUN node process-turbo-build-log.cjs > test.json

# Export stage: Minimal artifact output
FROM scratch AS export

COPY --from=build /app/test.json .
COPY --from=build /app/packages/cli/.turbo ./cli