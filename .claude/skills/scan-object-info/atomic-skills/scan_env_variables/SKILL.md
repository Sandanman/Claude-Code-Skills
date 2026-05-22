---
name: scan-env-variables
description: 扫描并识别前端项目中的环境变量配置文件，提取环境变量键名、用途、默认值和环境区分。改进版新增 confidence scores、better error handling 和 suggested follow-up actions。
---

# scan_env_variables（改进版 v1.1）

## 任务定义

你是原子技能 `scan_env_variables`，负责扫描并识别前端项目中的环境变量配置（改进版：新增 confidence scores、错误处理和后续建议）。

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

## 输出字段

- 环境文件清单（含 confidence score）
- 环境变量键名（含 confidence score）
- 环境变量用途（推断结果）
- 默认值
- 环境区分（development/production/test）
- 前缀规范

## Confidence Score 判定
- **high**：环境文件存在且变量定义完整（有注释说明用途）
- **medium**：环境文件存在但变量定义不完整（无注释）
- **low**：通过文件名推测存在，未实际读取文件

## 输出格式

严格按以下结构输出：

```markdown
- 环境文件清单 (confidence: overall)：
  - `.env`：`存在` (confidence: high/medium/low)
  - `.env.development`：`存在` (confidence: high/medium/low)
  - `.env.production`：`存在` (confidence: high/medium/low)
- 环境变量键名 (confidence: overall)：
  - `VITE_API_BASE_URL` (confidence: high/medium/low)
  - `REACT_APP_API_KEY` (confidence: high/medium/low)
  - `NEXT_PUBLIC_SITE_URL` (confidence: high/medium/low)
- 环境变量用途：
  - `VITE_API_BASE_URL`：API 接口地址
  - `REACT_APP_API_KEY`：第三方 API 密钥
  - `NEXT_PUBLIC_SITE_URL`：网站域名
- 默认值：
  - `VITE_API_BASE_URL`：`http://localhost:3000` (confidence: medium)
  - `REACT_APP_API_KEY`：`未声明` (confidence: low)
- 环境区分：
  - `VITE_API_BASE_URL`：development/production
  - `REACT_APP_API_KEY`：production
- 前缀规范：
  - `VITE_*`：Vite 标准前缀
  - `REACT_APP_*`：Create React App 标准前缀
- 错误（如有）：⚠️ [错误描述]
```

## 错误处理

**如果环境文件扫描失败**：
```markdown
⚠️ 错误：无法扫描环境变量文件

降级策略：
- 输出 `环境文件清单：未检测到` (confidence: low)
- 其他依赖此结果的技能将标记为 confidence: low

建议后续操作：
1. 请确保项目存在 .env 文件（或参考 .env.example 创建）
2. 如果项目未使用环境变量，请忽略此提示
3. 建议创建 .env.example 文件记录所需的环境变量
```

**如果缺少框架信息**：
```markdown
⚠️ 错误：缺少框架信息，无法确定环境变量前缀规范

降级策略：
- 仅识别已知的标准前缀（VITE_、REACT_APP_、NEXT_PUBLIC_）
- 其他前缀标记为 `自定义前缀`

建议后续操作：
1. 请先执行 detect_framework 获取框架信息
2. 或者手动提供框架类型
```

## 强约束

- 保持精简、客观、可被后续技能读取
- 不解释、不扩展、不输出源码
- 不输出未证实结论
- 环境变量值原样输出（注意安全性，不输出敏感值到日志）
- 只输出在文件中实际存在的变量
- 每个结果标注 confidence score
- 错误信息必须包含降级策略和后续建议

## 适用场景

- 需要了解项目如何管理环境配置
- 需要部署项目时确认环境变量
- 需要添加新环境变量时参考规范
- 需要分析配置泄露风险

## 前置条件

- 项目必须使用环境变量配置
- 对于 Vite/React/Next 等框架，需要 `detect_framework` 或 `scan_config_files` 提供框架信息

## Suggested Follow-up Actions

根据检测结果，推荐以下后续操作：
- 如果检测到 `VITE_API_BASE_URL` → 推荐确认 `.env.development` 和 `.env.production` 中的配置是否正确
- 如果未检测到环境变量 → 建议添加环境变量配置，分离开发和生产配置
- 如果检测到非标准前缀 → 建议统一使用框架推荐的标准前缀
- 如果需要添加新环境变量 → 建议遵循现有前缀规范（如 `VITE_`）
- 如果部署项目 → 建议确认所有必需的环境变量已在生产环境配置

## 版本
v1.1 - 改进版：新增 confidence scores、better error handling、suggested follow-up actions