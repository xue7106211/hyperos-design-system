# 部署指南：MiFlow / Matrix

> **状态**：与 2026-07 线上配置一致  
> **相关**：根目录 `Dockerfile` · Agent 精简约定见 [AGENTS.md](../AGENTS.md) · 索引 [docs/index.md](./index.md)

本文说明 **MiFlow（DEVX 流水线）** 与 **Matrix（部署平台）** 的职责拆分、发布流程与常见卡点。网站对外 MDX 不在此目录（见 `content/docs/`）。

本地常用命令（与 `package.json` 一致）：`npm install` · `npm run dev`（`npm run tina:dev` 为同一开发命令别名）· `npm run build`（含 `tinacms build`）· `npm run tina:build` · `npm run start` · `npm run types:check` · `npm run icons:sync` · `npm run icons:import -- /path/to/svgs` · `npm run tokens:import -- /path/to/OS4Token`。生产镜像构建不跑 `tinacms build`；图标资产以仓库内已提交的 `icons/manifest.json` 与 `public/icons/` 为准；规范配图以已提交的 `public/media/` 为准。

## 1. MiFlow vs Matrix

| | **MiFlow（DEVX 流水线）** | **Matrix（部署平台）** |
|--|---------------------------|------------------------|
| 角色 | CI/CD 流水线编排器 | 真正跑服务的部署平台 |
| 干什么 | 拉代码 → 匹配分支 → 构建镜像 → **可选地调用** Matrix 发布 | 管应用、部署空间、集群、实例、镜像绑定 |
| 你看到的界面 | 阶段：代码拉取、分支匹配、构建推送、发布 | 应用 `hyperos-design-system`、空间 `…-staging` / `…-prod`、实例 Running |
| 类比 | 工厂流水线（打包、贴标签、通知发货） | 仓库 + 上架（存镜像、选版本、在 K8s 上跑起来） |

一句话：

- **MiFlow**：自动化「做镜像 + 发起发布」
- **Matrix**：真正「认镜像、起 Pod、管环境」

因此可能出现：MiFlow「发布」步骤失败，但 Matrix 实例已是新 tag——镜像已造好，自动通知 Matrix 上架失败，手动在 Matrix 发布仍可成功。

**验收以 Matrix 部署空间里的实例 Tag / Running 为准，不以流水线「运行完成」文案为准。**

## 2. 分支与环境

| 分支 | Matrix 环境 | 部署空间 | 镜像 tag 前缀 |
|------|-------------|----------|---------------|
| **`main`** | 正式 / 生产 | `hyperos-design-system-prod` | `prod-<短 commit>` |
| **`staging`** | 测试 / staging | `hyperos-design-system-staging` | `staging-<短 commit>` |

- 本地 `npm run dev` 只反映当前检出分支，与线上无关
- **只 push `main` 不会更新测试环境** → 需再 sync `staging`
- **只更新 `staging` 不会更新正式环境** → 正式走 `main` → prod 构建与发布

**镜像仓库（应用已绑定）**：

```text
micr.cloud.mioffice.cn/hyperos-design/hyperos-design-system
```

## 3. 部署主流程

```text
写代码 (本地 / main)
        │
        ▼
  push 到 GitLab
   ├─ staging 分支 ──► 测环境流水线
   └─ main 分支    ──► 正式环境流水线
        │
        ▼
┌─────────────────── MiFlow ───────────────────┐
│ 1. 拉代码                                      │
│ 2. 分支匹配（staging 或 main）                  │
│ 3. Docker 构建 + push 到镜像仓库                 │
│    tag: staging-<sha> 或 prod-<sha>            │
│ 4. 调 Matrix 发布 API（仅 staging 线当前有）     │
└───────────────────┬──────────────────────────┘
                    ▼
┌─────────────────── Matrix ───────────────────┐
│ 应用已绑定镜像名 + 传入的 tag                    │
│ → 在对应部署空间拉起 / 更新实例                  │
└──────────────────────────────────────────────┘
```

### 3.1 发布到测试环境（main → staging）

```bash
git fetch gitlab main staging
git checkout staging
git pull gitlab staging
git merge main
# 若有冲突：AGENTS.md、next.config.mjs、tina/__generated__/* 优先采用 main 版本
git push gitlab staging
git push origin staging
git checkout main
```

确认已同步（无输出即可）：

```bash
git fetch gitlab main staging
git log --oneline gitlab/staging..gitlab/main
```

### 3.2 发布到正式环境（main → prod）

> **当前流水线现状**：`main` 流水线阶段 4 通常只有「发布staging」（push main 时会跳过），**没有「发布prod」步骤**。  
> 因此：`prod:构建并推送docker镜像` 变绿、整条流水线「运行完成」**只代表镜像造好了，不代表正式站已更新**。

推荐步骤：

1. 先完成 staging 验收
2. 代码已在 `gitlab/main`（双远程 push）
3. DEVX 确认：`main分支` 匹配通过 → **`prod:构建并推送docker镜像` 成功**
4. 记下短 SHA，预期 tag：`prod-<短 commit>`
5. Matrix → `hyperos-design-system` → **`hyperos-design-system-prod`** → 手动选该 `prod-*` tag 发布
6. 实例 Tag 已切换且 Running / Ready 后，打开正式站验收

不要把 `staging-*` 镜像直接当正式用（除非团队明确允许）。

若以后在 MiFlow 为 main 补上「发布prod」，镜像 tag 填 `prod-$CI_COMMIT_SHORT_SHA`（不带镜像名），才可依赖自动发布。

## 4. MiFlow 配置要点

构建步骤「镜像完整地址」示例：

```text
micr.cloud.mioffice.cn/hyperos-design/hyperos-design-system:staging-$CI_COMMIT_SHORT_SHA
micr.cloud.mioffice.cn/hyperos-design/hyperos-design-system:prod-$CI_COMMIT_SHORT_SHA
```

「Matrix发布」任务里的 **镜像 tag** 字段：

| 正确 | 错误 |
|------|------|
| `staging-$CI_COMMIT_SHORT_SHA` | `hyperos-design-system:staging-$CI_COMMIT_SHORT_SHA` |
| `prod-$CI_COMMIT_SHORT_SHA` | `hyperos-design-system:prod-$CI_COMMIT_SHORT_SHA` |

页面提示：只需指定要发布的镜像 tag；tag 前的镜像名配置在 Matrix，每次发布不可变更。  
日志里仍可能显示 `镜像tag: [hyperos-design-system:staging-xxxx]`——那是 Matrix 把「应用镜像名 + tag」拼在一起，**不代表**流水线字段要带镜像名。

## 5. 容器化技术要点

- **基础镜像**：`micr.cloud.mioffice.cn/devx-build-image/nodejs:22-openeuler2403-base`（Node 22 LTS + openEuler 24.03 / glibc 2.38）
- **npm 源**：`https://pkgs.d.xiaomi.net/artifactory/api/npm/mi-npm/`
- **多阶段**：deps → builder → runner（standalone）
- **生产构建不跑 `tinacms build`**：读仓库内 `tina/__generated__/`
- **不暴露 `/admin`**（Phase 2 前无生产鉴权）
- **端口**：`3000`；`CMD ["node", "server.js"]`

> **历史坑（glibc）**：早期 `nodejs:22-centos7.9-base`（glibc 2.17）会导致 `better-sqlite3` / `next/og` / `sharp` 等在 SSG 阶段 SIGSEGV。openEuler 24.03 已解决。

详见根目录 `Dockerfile`。

### Ask AI 环境变量

Ask AI 入口由服务端门闩控制：未配齐 `MI_LLM_*`（或 `AI_CHAT_ENABLED=false`）时 **不渲染** 右下角入口。本地靠 `.env.local`；线上必须在 Matrix 部署空间 **编辑 → 主容器环境变量** 注入，**不要**写进镜像或 git。

#### 要注入的变量

| 变量 | 示例 / 说明 |
|------|-------------|
| `MI_LLM_BASE_URL` | `https://api.llm.mioffice.cn/anthropic/v1`（勿带末尾 `/messages`） |
| `MI_LLM_API_KEY` | 站点统一 Bearer Key |
| `MI_LLM_MODEL` | 如 `ppio/pa/claude-sonnet-4-6` |
| `AI_CHAT_ENABLED`（可选） | 设为 `false` 时强制隐藏入口 |

网关需支持流式；请求会自动带唯一 `X-Model-Request-Id`。本地模板见 `.env.example`；设计说明见 [ai-assistant-design](./superpowers/specs/2026-08-11-ai-assistant-design.md)。

#### 在 Matrix 哪里配（正确入口）

> 与 Matrix Oncall 确认（2026-08）：无状态 Node.js 自定义 env 配在部署编辑页的主容器「环境变量」，不是「设置 → 变量配置」。

路径（正式站为例）：

```text
Matrix → 应用 hyperos-design-system
      → 部署空间 hyperos-design-system-prod
      → 右上角「编辑」（进入发布 / 部署单配置）
      → 主容器 main →「环境变量」→「+ 添加」或「批量编辑」
      → 下一步 → 核对 → 发布
```

测环境同理，改部署空间为 `hyperos-design-system-staging`。

说明：

- 代码侧通过 `process.env.MI_LLM_*` 读取；当前 Ask AI **直接读环境变量**，在部署单明文（或平台密文映射到同名 env）注入即可
- 修改环境变量会触发实例 **滚动升级**；新实例起来后入口才会出现
- **不必为配 env 单独重建镜像**（可沿用当前 `prod-*` / `staging-*` tag）
- 若开启了发布审批，编辑后需审批通过才生效
- Oncall 建议敏感 Key 可走 KeyCenter 注入；本站尚未接 KeyCenter 客户端，**现阶段以部署单「环境变量」为准**（Key 勿进 git / 镜像）

#### 容易误判的入口（不是自定义业务 env）

部署空间 **设置** 侧栏里这些页 **不要**当作 Ask AI 的 `MI_LLM_*` 填写处：

| 设置项 | 实际作用 |
|--------|----------|
| **变量配置** | 只注入平台元数据：`REGION` / `ZONE`，或 `MATRIX_CLUSTER` / `MATRIX_APP_ID` 等；**不能**填 `MI_LLM_*` |
| **KeyCenter** | 平台加解密 Sidecar / 密钥托管入口；与「环境变量」表单不同；未接客户端前不要指望在这里单独配出 Ask AI |
| **镜像配置** | 镜像 tag 过滤 / 审批 |
| **高级设置 → 自定义配置** | 高影响覆盖，非首选；改前先问 Matrix Oncall |

## 6. 卡点排查（2026-07）

| 现象 | 原因 | 处理 |
|------|------|------|
| 本地有、staging 没有 | 只 push 了 `main`，未 merge 到 `staging` | 按 §3.1 同步并 push |
| staging 有、正式没有 | 正式走 `main` → `prod-*` | 触发 `main` 造镜像后，Matrix 发 prod |
| **`main` 流水线「运行完成」，正式站仍旧** | **只构建 prod，没有「发布prod」**；「发布staging」在 push main 时跳过 | Matrix **`…-prod` 手动选 `prod-<短 commit>`** |
| **线上无 Ask AI 入口**（本地有） | 部署单未注入 `MI_LLM_*`，或 `AI_CHAT_ENABLED=false` | 部署空间 **编辑 → 主容器环境变量** 配齐三项并发布（滚动升级）；勿只开「设置 → 变量配置」 |
| 构建成功，发布报「镜像版本不存在」 | ① tag 写成了 `镜像名:tag`；② 仓库绑定不一致；③ 构建未完成就发布 | 发布字段只填 tag；核对镜像仓库路径；等 push + register 完成 |
| 流水线发布失败，但实例已是新 tag | 自动发布失败，手动已成功 | 以 Matrix 实例为准 |
| 反复「重新执行」同一流水线 | 配置未改，或正式线不含发布步骤 | 先改配置或 Matrix 手动发；空跑无意义 |

**读流水线对照**：

| 你看到的 | 实际含义 |
|----------|----------|
| `prod:构建并推送docker镜像` 绿 | 镜像已在仓库，**尚未**保证正式站更新 |
| `发布staging` 跳过（push 的是 main） | 正常 |
| 没有「发布prod」节点 | 正式发布需 Matrix 手动（当前配置） |
| Matrix 实例 Tag = 目标 tag 且 Running | **该环境部署成功** |

构建成功日志应包含：

```text
Pushing image to micr.cloud.mioffice.cn/hyperos-design/hyperos-design-system:prod-<sha>
Pushed …@sha256:…
Image is secure
```

**兜底**：Matrix → 对应部署空间 → 手动选择已存在的 `staging-*` / `prod-*` tag 发布。
