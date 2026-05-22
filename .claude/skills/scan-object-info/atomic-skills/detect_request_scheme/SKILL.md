---
name: detect-request-scheme
description: 识别前端项目网络请求方案（axios/fetch/umi-request/superagent、React Query/SWR/RTK Query）及封装结构与基础配置，输出结构化结果。改进版新增 confidence scores、better error handling 和 suggested follow-up actions。
---

# detect_request_scheme（改进版 v1.1）

## 任务定义

你是原子技能 `detect_request_scheme`，负责识别项目网络请求方案（改进版：新增 confidence scores、错误处理和后续建议）。

## 识别范围

- 请求库：`axios`、`fetch`、`umi-request`、`superagent`
- 请求数据 hooks：`@tanstack/react-query`、`react-query`、`swr`、`@reduxjs/toolkit`（RTK Query）
- 封装结构：`api` 目录、拦截器、请求实例
- 环境域名与基础配置（如 baseURL、超时、headers、环境变量键名）

## 输入依据（只读）

- `package.json`（dependencies/devDependencies）
- 目录结构（如 `src/api`、`src/services`、`src/utils/request.*`）
- 请求相关文件（如 `request.*`、`axios.*`、`http.*`、`service.*`）
- 环境文件（如 `.env*`，仅识别变量名）

## 判定规则

1. 请求库识别：
   - 命中依赖 `axios` -> 记录 Axios
   - 未命中上述库但命中原生封装（`fetch(` 调用模式）-> 记录 Fetch
   - 命中 `umi-request`、`superagent` 则分别记录
   - 命中多个库时全部输出
2. 请求数据 hooks：
   - 命中 `@tanstack/react-query` 或 `react-query` -> `是`
   - 命中 `swr` -> `是`
   - 命中 `@reduxjs/toolkit` 且存在 `createApi` 线索 -> `是`
   - 否则 -> `否`
3. 封装结构识别：
   - `api` 目录是否存在
   - 是否存在请求实例创建（如 `axios.create`）
   - 是否存在请求/响应拦截器（如 `interceptors.request/response`）
4. 环境域名与基础配置：
   - 仅输出键名或配置项名（如 `VITE_API_BASE_URL`、`baseURL`、`timeout`）
   - 不输出敏感值与源码

## 输出字段

- 请求库名称与版本（含 confidence score）
- 是否使用请求数据 hooks（含 confidence score）
- 项目封装方式简要说明

## Confidence Score 判定
- **high**：从 package.json 检测到请求库 + 存在对应的封装文件
- **medium**：从 package.json 检测到请求库，但无封装文件
- **low**：仅从目录结构推测，无 package.json 证据

## 输出格式

严格按以下结构输出：

```markdown
- 请求库 (confidence: overall)：
  - `库名@版本` (confidence: high/medium/low)
  - `库名@版本` (confidence: high/medium/low)
- 请求数据 hooks：`是/否` (confidence: high/medium/low)
- 封装方式：
  - `api目录`：`存在/不存在` (confidence: high/medium/low)
  - `请求实例`：`存在/不存在` (confidence: high/medium/low)
  - `拦截器`：`存在/不存在` (confidence: high/medium/low)
  - `关键路径`：`文件路径`、`文件路径`
- 基础配置特征：
  - `配置项`：`baseURL`、`timeout`、`headers`
  - `环境变量键名`：`VITE_API_BASE_URL`、`NEXT_PUBLIC_API_URL`
- 错误（如有）：⚠️ [错误描述]
```

## 错误处理

**如果缺少必要的输入数据**：
```markdown
⚠️ 错误：缺少 package.json 信息，无法确定请求方案

降级策略：
- 输出 `请求库：未知` (confidence: low)
- 其他依赖此结果的技能将标记为 confidence: low

建议后续操作：
1. 请确保 package.json 存在且包含依赖信息
2. 或者手动提供请求方案信息
```

## 强约束

- 结果客观、结构化、可被后续技能直接使用
- 不解释、不扩展、不输出源码
- 不输出未证实信息
- 每个结果标注 confidence score
- 错误信息必须包含降级策略和后续建议

## Suggested Follow-up Actions

根据检测结果，推荐以下后续操作：
- 如果检测到 `Axios` → 推荐查看 `src/api/` 目录了解 API 封装
- 如果检测到 `React Query/SWR` → 推荐查看请求 hooks 的配置和使用方式
- 如果检测到拦截器 → 推荐了解统一的错误处理和 token 刷新逻辑
- 如果未检测到请求库 → 建议使用 Axios 或原生 fetch 封装统一请求逻辑
- 如果检测到 `VITE_API_BASE_URL` → 推荐在 `.env` 文件中配置正确的 API 地址

## 版本
v1.1 - 改进版：新增 confidence scores、better error handling、suggested follow-up actions