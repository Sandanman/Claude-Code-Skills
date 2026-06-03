---
name: detect-net-router
description: 检测前端项目网络请求方案与路由方案，一次扫描输出两个维度。τ=500，比分别调用detect-request-scheme+detect-router-solution节省38%。v1.2新增confidence scores、Co-Design规则分配。
---

# detect_net_router（v1.2，K1合并技能）

## 任务定义

你是原子技能 `detect_net_router`（K1 Task Folding 合并版），一次性检测两个维度：
- **网络请求**：HTTP 客户端、请求封装层
- **路由方案**：路由库、路由类型、路由文件位置

**τ 值**：500（原2技能分开调用合计约800，节省38%）

## 合并来源

本技能由以下两个技能合并而来（K1 Task Folding）：
1. `detect_request_scheme`（τ=400 → 合并入）
2. `detect_router_solution`（τ=400 → 合并入）

## 输入依据

- `package.json`（dependencies/devDependencies/scripts）
- 项目结构（src/api、src/router、src/routes 等目录）
- 路由文件（router/index.*、routes/.*、App.tsx 等）

## Co-Design 规则分配

| 检测维度 | 规则分配 | LLM分配 | 说明 |
|---------|---------|--------|------|
| 请求方案 | 包名正则匹配 | 封装层解读 | 规则处理90%场景 |
| 路由方案 | 文件名+包名正则 | 目录结构推断 | 规则处理标准命名 |
| 路由类型 | 文件内容分析 | 上下文推断 | 规则处理配置式路由 |

## 网络请求检测（规则路径）

### HTTP客户端判定

命中即停止：
- Axios：`axios` 依赖
- Fetch API：仅 `node-fetch` 或无 HTTP 库 → Fetch
- ky：`ky` 依赖
- wretch：`wretch` 依赖
- superagent：`superagent` 依赖

### 数据获取方案判定

命中即停止（优先于Axios）：
- React Query：`@tanstack/react-query` 或 `react-query` 依赖
- SWR：`swr` 依赖
- Vue Query：`@tanstack/vue-query` 依赖

### 请求封装层检测

检测以下目录/文件（判断是否二次封装）：
- `src/api/`（API 目录）
- `src/services/`（服务层）
- `src/http/`（HTTP 封装）
- `request.ts` / `request.js`（请求封装文件）

## 路由方案检测（规则路径）

### 路由库判定

命中即停止：
- React Router v6：`react-router-dom` 依赖 且 `useRoutes`/`createBrowserRouter` 使用
- React Router v5：`react-router-dom` 依赖 且 `Switch`/`Route` 使用
- Vue Router：`vue-router` 依赖
- Angular Router：`@angular/router` 依赖
- Next.js Router：`next` 依赖 且 `useRouter` 使用
- SvelteKit Router：`@sveltejs/kit` 依赖
- TanStack Router：`@tanstack/react-router` 或 `@tanstack/vue-router` 依赖

### 路由类型判定

- 配置式路由：存在 `router/index.ts` 配置文件
- 声明式路由：存在 `<Route>` 组件或 `file-based` 目录结构
- 文件路由：存在 `pages/` 或 `app/` 目录（Next.js App Router 或 Remix）

### 路由文件位置

典型位置（按框架）：
- Vue：`src/router/index.ts`
- React：`src/routes/` 或 `src/router/` 或 `src/App.tsx`
- Next.js：`app/` 目录 或 `pages/` 目录

## 输出格式

```markdown
- 请求方案：`Axios/Fetch/SWR/React Query/其他` (confidence: high/medium/low)
  - 依据：`package.json` 中 `关键依赖@版本`
- 请求封装层：`存在/不存在` (confidence: high/medium/low)
  - 封装目录：`src/api/` 等
- 路由方案：`Vue-Router/React Router/Next.js Router/其他` (confidence: high/medium/low)
  - 依据：`package.json` 中 `关键依赖@版本`
- 路由类型：`配置式/声明式/文件路由` (confidence: high/medium/low)
  - 依据：`结构/配置` 中的 `关键文件`
- 路由文件：`src/router/index.ts` 等
```

## Skill Stacking 上下文写入

检测完成后，将结果写入 task_skill.md 共享上下文：

```markdown
### 网络上下文（detect_net_router 输出）
- 请求方案：xxx
- 路由方案：xxx
- 路由文件：xxx
```

## 错误处理

```markdown
⚠️ 错误：未找到 package.json

降级策略：
- 输出 `请求方案：未知` (confidence: low)
- 输出 `路由方案：未知` (confidence: low)

建议后续操作：
1. 请确保项目根目录存在 package.json
```

## τ 节省说明

```
分开调用（K1前）：
detect_request_scheme τ=400 + detect_router_solution τ=400 = τ=800

合并调用（K1后）：
detect_net_router τ=500

τ 节省：300（节省率 38%）
原因：package.json 只读一次，两个维度共享解析结果
```

## 版本

- v1.2 - K1 Task Folding 合并版：从 detect_request_scheme + detect_router_solution 合并而来
- 继承各来源技能的核心检测逻辑，统一输出格式