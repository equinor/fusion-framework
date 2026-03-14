# ── Stage 1: Build Storybook (cached) ──
FROM mcr.microsoft.com/playwright:v1.58.2-noble AS build

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Clone the repo
ARG EDS_REPO=https://github.com/equinor/design-system.git
ARG EDS_REF=main
RUN git clone --depth 1 --branch "${EDS_REF}" "${EDS_REPO}" .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all prerequisite packages, then Storybook
RUN pnpm run build:tokens-build \
    && pnpm build:icons \
    && pnpm build:tokens \
    && pnpm run build:utils \
    && pnpm build:core-react \
    && pnpm build:storybook 

# ── Stage 2: Extract LLM docs (re-runs without rebuilding) ──
FROM mcr.microsoft.com/playwright:v1.58.2-noble AS extractor

WORKDIR /app
COPY --from=build /app/packages/eds-core-react/storybook-build ./storybook-build

RUN npm install @fluentui/storybook-llms-extractor@latest
RUN npx storybook-llms-extractor --distPath ./storybook-build
RUN cd ./storybook-build/llms && for f in *.txt; do mv "$f" "${f%.txt}.md"; done

# ── Stage 3: Export only the generated files ──
FROM scratch AS export
COPY --from=build /app/apps/design-system-docs/docs /docs
COPY --from=extractor /app/storybook-build/llms/ /stories
