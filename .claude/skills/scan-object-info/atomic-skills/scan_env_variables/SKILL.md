---
name: scan-env-variables
description: 扫描并识别前端项目中的环境变量配置文件，提取环境变量键名、用途、默认值和环境区分。用于用户提到环境变量分析、配置文件识别、环境区分时。
---

# scan_env_variables

## 任务定义

你是原子技能 `scan_env_variables`，负责扫描并识别前端项目中的环境变量配置。

## 扫描范围

- 环境文件：
  - `.env`、`.env.local`
  - `.env.development`、`.env.development.local`
  - `.env.production`、`.env.production.local`
  - `.env.test`、`.env.test.local`
- 环境变量格式：
  - `VITE_*`（Vite）
  - `REACT_APP_*`（Create React App）
  - `NEXT_PUBLIC_*`（Next.js）
  - `NUXT_*`（Nuxt）
  - 其他自定义前缀

## 输入依据（只读）

- 环境文件（如 `.env*`）
- 项目类型（由 `detect_framework` 提供）
- 构建工具（由 `scan_config_files` 提供）

## 输出字段

- 环境文件清单
- 环境变量键名
- 环境变量用途
- 默认值
- 环境区分（development/production/test）
- 前缀规范

## 判定规则

1. 环境文件识别：
   - 列出所有存在的环境文件
   - 按优先级排序：`.env.local` > `.env.development.local` > `.env.development` > `.env`

2. 环境变量提取：
   - 解析每个环境文件中的键值对
   - 忽略注释行和空行
   - 识别变量前缀模式

3. 环境区分判定：
   - 根据文件名确定环境：`development`、`production`、`test`
   - 未指定环境的变量默认为通用环境

4. 用途推断：
   - 从变量名推断用途（如 `API_BASE_URL` 为 API 地址）
   - 从注释推断用途（如 `# API 接口地址`）
   - 未推断出用途时标记为 `未知用途`

5. 前缀规范：
   - 根据框架识别标准前缀
   - 记录非标准前缀

## 输出格式

严格按以下结构输出：

```markdown
- 环境文件清单：
  - `.env`：存在
  - `.env.development`：存在
  - `.env.production`：存在
- 环境变量键名：
  - `VITE_API_BASE_URL`
  - `REACT_APP_API_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- 环境变量用途：
  - `VITE_API_BASE_URL`：API 接口地址
  - `REACT_APP_API_KEY`：第三方 API 密钥
  - `NEXT_PUBLIC_SITE_URL`：网站域名
- 默认值：
  - `VITE_API_BASE_URL`：`http://localhost:3000`
  - `REACT_APP_API_KEY`：未声明
- 环境区分：
  - `VITE_API_BASE_URL`：development/production
  - `REACT_APP_API_KEY`：production
- 前缀规范：
  - `VITE_*`：Vite 标准前缀
  - `REACT_APP_*`：Create React App 标准前缀
```

## 强约束

- 保持精简、客观、可被后续技能读取
- 不解释、不扩展、不输出源码
- 不输出未证实结论
- 环境变量值原样输出
- 只输出在文件中实际存在的变量

## 适用场景

- 需要了解项目如何管理环境配置
- 需要部署项目时确认环境变量
- 需要添加新环境变量时参考规范
- 需要分析配置泄露风险

## 前置条件

- 项目必须使用环境变量配置
- 对于 Vite/React/Next 等框架，需要 `detect_framework` 或 `scan_config_files` 提供框架信息
- 环境文件必须存在于项目中