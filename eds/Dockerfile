# ── Stage 1: Build Storybook (cached) ──
FROM node:22-alpine AS build

# Git is needed for clone; skip Playwright browsers (only e2e, not build)
RUN apk add --no-cache git
RUN npm install -g pnpm@10.15.0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /app

# Clone the repo
ARG EDS_REPO=https://github.com/equinor/design-system.git
ARG EDS_REF=main
RUN git clone --depth 1 --branch "${EDS_REF}" "${EDS_REPO}" .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all prerequisite packages, then Storybook.
RUN pnpm build:tokens-build \
    && pnpm build:icons \
    && pnpm build:tokens \
    && pnpm build:utils \
    && pnpm build:core-react \
    && pnpm build:storybook

# ── Stage 2: Extract LLM docs from the Storybook build ──
# Use a base image with system deps for Playwright; browser binaries are
# installed at npm-install time so the image version never drifts out of sync.
# Install tools BEFORE copying build output so these layers stay cached even
# when the Storybook build changes.
FROM node:24-bookworm AS extractor

WORKDIR /app
RUN npm install @fluentui/storybook-llms-extractor@0.0.4
RUN npx playwright install --with-deps chromium

COPY --from=build /app/packages/eds-core-react/storybook-build ./storybook-build
RUN npx storybook-llms-extractor --distPath ./storybook-build
RUN cd ./storybook-build/llms && for f in *.txt; do mv "$f" "${f%.txt}.md"; done

# ── Stage 3: Convert token JSON → markdown for indexing ──
FROM oven/bun:slim AS process

WORKDIR /app
COPY --from=build /app/packages/eds-tokens/build/json ./json
COPY convert-tokens.ts ./convert-tokens.ts

RUN bun run convert-tokens.ts

COPY --from=extractor /app/storybook-build/llms/ ./stories
COPY trim-stories.ts ./trim-stories.ts

RUN bun run trim-stories.ts

COPY --from=build /app/apps/design-system-docs/docs/components ./components
COPY fix-index-gaps.ts ./fix-index-gaps.ts

RUN bun run fix-index-gaps.ts /app

# ── Stage 4: Export only the generated files ──
FROM scratch AS export
COPY --from=process /app/components /components
COPY --from=build /app/apps/design-system-docs/docs/foundation /foundation
COPY --from=process /app/stories/ /stories
COPY --from=process /app/tokens/ /tokens
COPY --from=build /app/packages/eds-tokens/README.md /tokens/eds-tokens.md
COPY --from=build /app/packages/eds-icons/README.md /tokens/eds-icons.md
