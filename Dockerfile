# syntax=docker/dockerfile:1.7

# ============================================================
# HyperOS Design System 文档站容器化
# 多阶段构建：deps → builder → runner
# runner 只包含 Next.js standalone 运行时（node server.js）
# ============================================================

# ---------- deps: 只装依赖，缓存友好 ----------
FROM node:22-alpine AS deps

# Alpine 编译原生依赖（sharp / better-sqlite3）需要
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# .npmrc 里有 legacy-peer-deps=true，需要一起 COPY
COPY package.json package-lock.json .npmrc ./

# postinstall 会跑 fumadocs-mdx，此时还没 content，先跳过 scripts
RUN npm ci --ignore-scripts

# ---------- builder: 编译 tinacms admin + next 站点 ----------
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 补跑 postinstall 里被跳过的 fumadocs-mdx（生成 .source/）
RUN npx fumadocs-mdx

ENV NEXT_TELEMETRY_DISABLED=1
# TinaCMS 走本地 filesystem 模式构建 admin bundle
# 生产环境如接入 TinaCloud，改为传入 NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN
ENV TINA_PUBLIC_IS_LOCAL=true

# 等价于 npm run build，即 tinacms build && next build
RUN npm run build

# ---------- runner: 最小运行镜像 ----------
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 非 root 用户运行
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Next.js standalone 输出：server.js + 精简 node_modules 都在 .next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# public 里含 tinacms build 生成的 /admin 静态资源
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# standalone 模式下的启动入口
CMD ["node", "server.js"]
