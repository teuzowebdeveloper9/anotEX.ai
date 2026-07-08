# Build
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# Runtime
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

# Atrela o pacote ghcr.io ao repositório (aparece em "Packages" no GitHub)
LABEL org.opencontainers.image.source="https://github.com/teuzowebdeveloper9/anotEX.ai"
LABEL org.opencontainers.image.description="anotEX.ai backend — API + worker (NestJS)"
LABEL org.opencontainers.image.licenses="UNLICENSED"

# ffmpeg para compressão de áudio; python3 + yt-dlp para download de vídeos do YouTube
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 ca-certificates curl \
  && curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
