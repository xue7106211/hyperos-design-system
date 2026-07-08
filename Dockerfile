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

# ---------- builder: 编译 next 站点（不跑 tinacms build） ----------
# 不跑 tinacms build 的原因：
# 1. 省内存：tinacms build 打 admin SPA + 编译 schema 会顶 3~4GB
# 2. 避开 CentOS 7.9 (glibc 2.17) 与 better-sqlite3 12.x 的 SIGSEGV
# 3. 生产不做 CMS 编辑（AGENTS.md 里 Phase 2 才接生产鉴权），/admin 本就不该暴露
# 4. tina/__generated__/ 已提交到仓库，next build 需要的 client/types 无需重新生成
# 5. SSG 时 page.tsx 里 TINA_PUBLIC_IS_LOCAL !== 'true' → fetchTinaDoc 返回 null，
#    走 fumadocs-mdx 静态渲染 fallback，完全不碰 tina 数据层
FROM ${BASE_IMAGE} AS builder
ARG NPM_REGISTRY

WORKDIR /home/work/app

RUN npm config set registry "${NPM_REGISTRY}"

COPY --from=deps /home/work/app/node_modules ./node_modules
COPY . .

# 补跑 postinstall 里被跳过的 fumadocs-mdx（生成 .source/）
RUN npx fumadocs-mdx

ENV NEXT_TELEMETRY_DISABLED=1

RUN npx next build

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
