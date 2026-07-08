# syntax=docker/dockerfile:1.7

# ============================================================
# HyperOS Design System 文档站容器化
# 多阶段构建：deps → builder → runner
# runner 只包含 Next.js standalone 运行时（node server.js）
# 基础镜像：小米内部 devx-build-image（与 dpilot 等业务项目一致）
# ============================================================

ARG BASE_IMAGE=micr.cloud.mioffice.cn/devx-build-image/nodejs:22-centos7.9-base
ARG NPM_REGISTRY=https://pkgs.d.xiaomi.net/artifactory/api/npm/mi-npm/

# ---------- deps: 只装依赖，最大化利用层缓存 ----------
FROM ${BASE_IMAGE} AS deps
ARG NPM_REGISTRY

WORKDIR /home/work/app

# 小米内部 npm 源
RUN npm config set registry "${NPM_REGISTRY}"

# .npmrc 里有 legacy-peer-deps=true，需要一起 COPY
COPY package.json package-lock.json .npmrc ./

# postinstall 会跑 fumadocs-mdx，此时还没有 content，先跳过 scripts
RUN npm ci --ignore-scripts

# ---------- builder: 编译 tinacms admin + next 站点 ----------
FROM ${BASE_IMAGE} AS builder
ARG NPM_REGISTRY

WORKDIR /home/work/app

RUN npm config set registry "${NPM_REGISTRY}"

COPY --from=deps /home/work/app/node_modules ./node_modules
COPY . .

# 补跑 postinstall 里被跳过的 fumadocs-mdx（生成 .source/）
RUN npx fumadocs-mdx

ENV NEXT_TELEMETRY_DISABLED=1
# TinaCMS 走本地 filesystem 模式构建 admin bundle
# 生产环境如接入 TinaCloud，改为传入 NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN
ENV TINA_PUBLIC_IS_LOCAL=true
# 容器里 v8 默认堆上限约 1.5~2GB，tinacms build 编译全部 MDX collection 时会 OOM
# 抬高到 4GB。要求 Matrix 构建 Pod 内存 ≥ 4GB，否则会被平台 OOMKilled
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 等价于 npm run build，即 tinacms build && next build
RUN npm run build

# ---------- runner: 最小运行镜像 ----------
FROM ${BASE_IMAGE} AS runner

WORKDIR /home/work/app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV TZ=Asia/Shanghai

# 时区：北京时间（与 dpilot 项目对齐）
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
 && echo "Asia/Shanghai" > /etc/timezone

# 非 root 用户运行（CentOS 使用 groupadd / useradd）
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --no-create-home --home-dir /home/work/app nextjs

# Next.js standalone 输出：server.js + 精简 node_modules 都在 .next/standalone
COPY --from=builder --chown=nextjs:nodejs /home/work/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /home/work/app/.next/static ./.next/static
# public 里含 tinacms build 生成的 /admin 静态资源
COPY --from=builder --chown=nextjs:nodejs /home/work/app/public ./public

USER nextjs

EXPOSE 3000

# standalone 模式下的启动入口
CMD ["node", "server.js"]
