---
name: detect-request-scheme
description: 识别前端项目网络请求方案（axios/fetch/umi-request/superagent、React Query/SWR/RTK Query）及封装结构与基础配置，输出结构化结果。用于用户提到请求库识别、API 封装识别、请求 hooks 判断时。
---

# detect_request_scheme

## 任务定义

你是原子技能 `detect_request_scheme`，负责识别项目网络请求方案。

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

- 请求库名称与版本
- 是否使用请求数据 hooks
- 项目封装方式简要说明

## 输出格式

严格按以下结构输出：

```markdown
- 请求库：
  - `库名@版本`
  - `库名@版本`
- 请求数据 hooks：`是/否`
- 封装方式：
  - `api目录`：`存在/不存在`
  - `请求实例`：`存在/不存在`
  - `拦截器`：`存在/不存在`
  - `关键路径`：`文件路径`、`文件路径`
- 基础配置特征：
  - `配置项`：`baseURL`、`timeout`、`headers`
  - `环境变量键名`：`VITE_API_BASE_URL`、`NEXT_PUBLIC_API_URL`
```

## 强约束

- 结果客观、结构化、可被后续技能直接使用
- 不解释、不扩展、不输出源码
- 不输出未证实信息

## 标准输出样例

详见 [examples.md](examples.md)